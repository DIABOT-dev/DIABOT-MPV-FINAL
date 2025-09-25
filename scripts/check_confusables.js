/**
 * Warn-only scan: phát hiện một số Unicode dễ gây lỗi build
 * - Mathematical Alphanumeric Symbols: U+1D400–U+1D7FF (ví dụ 𝐬)
 * - Zero-width & BOM: U+200B..U+200D, U+FEFF
 * Cho phép tiếng Việt (Latin có dấu), KHÔNG fail build.
 */
const fs=require('fs'),path=require('path');
const ROOT='src';
const RANGES=[
  [0x1D400,0x1D7FF], // mathematical alnum symbols
  [0x200B,0x200D],   // zero-width
  [0xFEFF,0xFEFF],   // BOM
];
const EXTS=new Set(['.ts','.tsx','.js','.jsx']);
const files=[]; (function walk(d){
  for(const e of fs.readdirSync(d,{withFileTypes:true})){
    const p=path.join(d,e.name);
    if(e.isDirectory()) walk(p);
    else if([...EXTS].some(x=>e.name.endsWith(x))) files.push(p);
  }
})(ROOT);

let warnings=0;
for(const f of files){
  const lines=fs.readFileSync(f,'utf8').split(/\r?\n/);
  lines.forEach((line,i)=>{
    for(const ch of line){
      const cp=ch.codePointAt(0);
      if(RANGES.some(([a,b])=>cp>=a&&cp<=b)){
        if(warnings===0) console.log("⚠️  Potential confusables/zero-width found:");
        console.log(`- ${f}:${i+1}  => "${ch}" U+${cp.toString(16).toUpperCase()}`);
        warnings++;
      }
    }
  });
}
console.log(warnings?`Total warnings: ${warnings}`:"✅ No confusables/zero-width detected");
process.exit(0);