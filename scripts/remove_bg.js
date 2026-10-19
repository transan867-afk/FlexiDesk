import fs from 'fs';
import { PNG } from 'pngjs';

fs.createReadStream('public/coffee-hero.png')
  .pipe(new PNG())
  .on('parsed', function() {
    const width = this.width;
    const height = this.height;
    const visited = new Uint8Array(width * height);
    const queue = [];

    // Helper: is pixel background checkerboard?
    const isBgPixel = (x, y) => {
      const idx = (width * y + x) << 2;
      const r = this.data[idx];
      const g = this.data[idx+1];
      const b = this.data[idx+2];
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      // Checkerboard is purely neutral gray (R~G~B) with brightness >= 220
      return maxDiff <= 6 && r >= 220 && g >= 220 && b >= 220;
    };

    // Initialize queue with all 4 borders
    for (let x = 0; x < width; x++) {
      if (isBgPixel(x, 0)) {
        queue.push((0 << 16) | x);
        visited[x] = 1;
      }
      if (isBgPixel(x, height - 1)) {
        queue.push(((height - 1) << 16) | x);
        visited[(height - 1) * width + x] = 1;
      }
    }
    for (let y = 0; y < height; y++) {
      if (isBgPixel(0, y) && !visited[y * width]) {
        queue.push((y << 16) | 0);
        visited[y * width] = 1;
      }
      if (isBgPixel(width - 1, y) && !visited[y * width + (width - 1)]) {
        queue.push((y << 16) | (width - 1));
        visited[y * width + (width - 1)] = 1;
      }
    }

    // BFS
    let head = 0;
    const dx = [1, -1, 0, 0];
    const dy = [0, 0, 1, -1];

    while (head < queue.length) {
      const val = queue[head++];
      const cx = val & 0xFFFF;
      const cy = val >> 16;

      for (let d = 0; d < 4; d++) {
        const nx = cx + dx[d];
        const ny = cy + dy[d];
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx] && isBgPixel(nx, ny)) {
            visited[nidx] = 1;
            queue.push((ny << 16) | nx);
          }
        }
      }
    }

    console.log(`Total pixels: ${width * height}, Background pixels found: ${queue.length}`);

    // Create transparent output
    const outPng = new PNG({ width, height });
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = y * width + x;
        const idx = pos << 2;
        if (visited[pos]) {
          outPng.data[idx] = 0;
          outPng.data[idx+1] = 0;
          outPng.data[idx+2] = 0;
          outPng.data[idx+3] = 0; // Transparent!
        } else {
          outPng.data[idx] = this.data[idx];
          outPng.data[idx+1] = this.data[idx+1];
          outPng.data[idx+2] = this.data[idx+2];
          outPng.data[idx+3] = 255;
        }
      }
    }

    // Anti-aliasing / edge smoothing on border pixels
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pos = y * width + x;
        if (!visited[pos]) {
          // Check if adjacent to background
          let bgNeighbors = 0;
          for (let d = 0; d < 4; d++) {
            if (visited[(y + dy[d]) * width + (x + dx[d])]) bgNeighbors++;
          }
          if (bgNeighbors > 0) {
            const idx = pos << 2;
            const r = this.data[idx];
            const g = this.data[idx+1];
            const b = this.data[idx+2];
            const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
            if (maxDiff <= 12 && r >= 210) {
              // Semi-transparent edge transition
              outPng.data[idx+3] = Math.max(40, 255 - bgNeighbors * 50);
            }
          }
        }
      }
    }

    outPng.pack().pipe(fs.createWriteStream('public/coffee-hero-transparent.png'))
      .on('finish', () => console.log('Successfully saved public/coffee-hero-transparent.png'));
  });
