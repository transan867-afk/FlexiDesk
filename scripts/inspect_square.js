import fs from 'fs';
import { PNG } from 'pngjs';

fs.createReadStream('public/coffee-hero.png')
  .pipe(new PNG())
  .on('parsed', function() {
    let row = '';
    for (let x = 0; x < 60; x++) {
      const idx = (this.width * 5 + x) << 2;
      const r = this.data[idx];
      const g = this.data[idx+1];
      const b = this.data[idx+2];
      row += `${r} `;
    }
    console.log('Row 5 X=0..59:', row);
  });
