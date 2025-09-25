# ---------- Base versions ----------
# Chúng ta khóa Node 20.11 (y/c dự án) để ổn định build.
ARG NODE_VERSION=20.11-alpine

# ---------- Builder ----------
FROM node:${NODE_VERSION} AS builder
WORKDIR /app

# Env build
ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_CACHE_DISABLED=1 \
    CI=1

# Cài deps trước để tối ưu layer cache
COPY package.json package-lock.json* ./
RUN --mount=type=cache,target=/root/.npm npm ci --ignore-scripts

# Copy toàn bộ mã nguồn
COPY . .

# Build Next ở chế độ CI
RUN npm run build:ci || npm run build

# ---------- Runner ----------
FROM node:${NODE_VERSION} AS runner
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Copy output standalone + static assets
# Next.js sẽ sinh /app/.next/standalone với server.js và node_modules tối thiểu
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# (Tuỳ dự án có dùng)
# COPY --from=builder /app/prisma ./prisma

# Healthcheck (tuỳ chọn: cần /api/health đã có)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health',{cache:'no-store'}).then(r=>{if(r.ok)process.exit(0);process.exit(1)}).catch(()=>process.exit(1))"

EXPOSE 3000
# Next standalone tạo sẵn server.js ở thư mục root (đã copy từ builder)
CMD ["node", "server.js"]
