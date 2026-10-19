import fs from 'fs';
import { PNG } from 'pngjs';

fs.createReadStream('public/coffee-hero.png')
  .pipe(new PNG())
  .on('parsed', function() {
    // Check right border around rim
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const idx = (this.width * y + x) << 2;
        if (this.data[idx+3] > 0) {
          const r = this.data[idx];
          const g = this.data[idx+1];
          const b = this.data[idx+2];
          const diff = Math.max(Math.abs(r-g), Math.abs(g-b), Math.abs(r-b));
          // If it's very gray and faint on the outside rim (x < 45 or x > 355 or y < 30)
          if ((x < 45 || x > 355 || y < 35) && diff <= 5 && r >= 200) {
            this.data[idx+3] = 0;
          }
        }
      }
    }

    this.pack().pipe(fs.createWriteStream('public/coffee-hero.png'))
      .on('finish', () => {
        fs.copyFileSync('public/coffee-hero.png', 'src/assets/coffee-hero.png');
        console.log('Cleaned outer rim artifacts.');
      });
  });
