import fs from 'fs';
import { PNG } from 'pngjs';

const origData = fs.readFileSync('C:/Users/Hi There/.gemini/antigravity/brain/47e75e4f-cf8c-465a-b318-9b2e43173a1c/.user_uploaded/media_1792336799060_9b0fb875.png');
new PNG().parse(origData, (err, orig) => {
  for (let y = 500; y <= 550; y += 10) {
    console.log(`--- y = ${y} ---`);
    for (let x = 80; x <= 130; x += 5) {
      const idx = (orig.width * y + x) << 2;
      const r = orig.data[idx];
      const g = orig.data[idx+1];
      const b = orig.data[idx+2];
      console.log(`x=${x}: (${r},${g},${b}) diff=${Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b))}`);
    }
  }
});
