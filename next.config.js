/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["lucide-react"],
  
  // Tăng timeout để tránh false positive khi build chậm
  staticPageGenerationTimeout: 120,

  // ✅ Bỏ qua ESLint & TypeScript typecheck trong lúc build
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // (tuỳ chọn) tắt minify SWC nếu môi trường có cảnh báo plugin
  // swcMinify: false,

  experimental: {
    // giữ nguyên, không bật optimizePackageImports cho lucide-react
  },
  output: "standalone" // Thêm dòng này
};

module.exports = nextConfig
  module.exports = { images: { unoptimized: true } };
