import fs from 'fs';
import { PNG } from 'pngjs';

fs.createReadStream('public/coffee-hero.png')
  .pipe(new PNG())
  .on('parsed', function() {
    // Check histogram of border pixels
    const borderSamples = [];
    // Top border
    for (let x = 0; x < this.width; x += 10) {
      const idx = x << 2;
      borderSamples.push([this.data[idx], this.data[idx+1], this.data[idx+2]]);
    }
    // Bottom border
    for (let x = 0; x < this.width; x += 10) {
      const idx = (this.width * (this.height - 1) + x) << 2;
      borderSamples.push([this.data[idx], this.data[idx+1], this.data[idx+2]]);
    }
    // Left border
    for (let y = 0; y < this.height; y += 10) {
      const idx = (this.width * y) << 2;
      borderSamples.push([this.data[idx], this.data[idx+1], this.data[idx+2]]);
    }
    // Right border
    for (let y = 0; y < this.height; y += 10) {
      const idx = (this.width * y + (this.width - 1)) << 2;
      borderSamples.push([this.data[idx], this.data[idx+1], this.data[idx+2]]);
    }

    console.log('Sample count:', borderSamples.length);
    // Find min and max for R, G, B, and max deviation |R-G|, |G-B|
    let maxDiff = 0;
    let minVal = 999;
    for (const [r, g, b] of borderSamples) {
      const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      if (diff > maxDiff) maxDiff = diff;
      if (r < minVal) minVal = r;
      if (g < minVal) minVal = g;
      if (b < minVal) minVal = b;
    }
    console.log('Border maxDiff |R-G|:', maxDiff, 'minVal:', minVal);
  });
