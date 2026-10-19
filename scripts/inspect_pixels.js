import fs from 'fs';
import { PNG } from 'pngjs';

fs.createReadStream('public/coffee-hero.png')
  .pipe(new PNG())
  .on('parsed', function() {
    console.log('Dimensions:', this.width, 'x', this.height);
    for (let y = 0; y < 10; y++) {
      let row = '';
      for (let x = 0; x < 10; x++) {
        const idx = (this.width * y + x) << 2;
        const r = this.data[idx];
        const g = this.data[idx+1];
        const b = this.data[idx+2];
        const a = this.data[idx+3];
        row += `(${r},${g},${b}) `;
      }
      console.log(`y=${y}:`, row);
    }
  });
