import fs from 'fs';
import { PNG } from 'pngjs';

fs.createReadStream('public/coffee-hero.png')
  .pipe(new PNG())
  .on('parsed', function() {
    const width = this.width;
    const height = this.height;
    const visited = new Uint8Array(width * height);
    const queue = [];

    // Is pixel background checkerboard?
    // Checkerboard squares have R~G~B (grayscale). In the cup, even the white milk has slight warm tint.
    // Also the checkerboard has brightness between 230 and 255.
    const isBgPixel = (x, y) => {
      const idx = (width * y + x) << 2;
      const r = this.data[idx];
      const g = this.data[idx+1];
      const b = this.data[idx+2];
      const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
      // Checkerboard is neutral gray
      return maxDiff <= 14 && r >= 215 && g >= 215 && b >= 215;
    };

    // Initialize BFS from all 4 borders
    for (let x = 0; x < width; x++) {
      if (isBgPixel(x, 0)) { queue.push((0 << 16) | x); visited[x] = 1; }
      if (isBgPixel(x, height - 1)) { queue.push(((height - 1) << 16) | x); visited[(height - 1) * width + x] = 1; }
    }
    for (let y = 0; y < height; y++) {
      if (isBgPixel(0, y) && !visited[y * width]) { queue.push((y << 16) | 0); visited[y * width] = 1; }
      if (isBgPixel(width - 1, y) && !visited[y * width + (width - 1)]) { queue.push((y << 16) | (width - 1)); visited[y * width + (width - 1)] = 1; }
    }

    let head = 0;
    const dx = [1, -1, 0, 0, 1, -1, 1, -1];
    const dy = [0, 0, 1, -1, 1, -1, -1, 1];

    while (head < queue.length) {
      const val = queue[head++];
      const cx = val & 0xFFFF;
      const cy = val >> 16;

      for (let d = 0; d < 8; d++) {
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

    // Now, clean up any floating isolated non-background pixels (dust / remnants) outside the cup
    // The cup is a huge connected body in the center. Any foreground component with < 500 pixels is noise.
    const fgVisited = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = y * width + x;
        if (!visited[pos] && !fgVisited[pos]) {
          // BFS foreground component
          const fgComp = [];
          const fgQ = [(y << 16) | x];
          fgVisited[pos] = 1;
          let fgHead = 0;
          while (fgHead < fgQ.length) {
            const v = fgQ[fgHead++];
            fgComp.push(v);
            const fx = v & 0xFFFF;
            const fy = v >> 16;
            for (let d = 0; d < 4; d++) {
              const fnx = fx + dx[d];
              const fny = fy + dy[d];
              if (fnx >= 0 && fnx < width && fny >= 0 && fny < height) {
                const fpos = fny * width + fnx;
                if (!visited[fpos] && !fgVisited[fpos]) {
                  fgVisited[fpos] = 1;
                  fgQ.push((fny << 16) | fnx);
                }
              }
            }
          }
          // If small island (< 800 pixels), it's background noise!
          if (fgComp.length < 800) {
            for (const v of fgComp) {
              const fx = v & 0xFFFF;
              const fy = v >> 16;
              visited[fy * width + fx] = 1; // Mark as background
            }
          }
        }
      }
    }

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
          outPng.data[idx+3] = 0;
        } else {
          outPng.data[idx] = this.data[idx];
          outPng.data[idx+1] = this.data[idx+1];
          outPng.data[idx+2] = this.data[idx+2];
          outPng.data[idx+3] = 255;
        }
      }
    }

    // Smooth transition on outer boundary (feathering)
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pos = y * width + x;
        if (!visited[pos]) {
          let bgCount = 0;
          for (let d = 0; d < 8; d++) {
            if (visited[(y + dy[d]) * width + (x + dx[d])]) bgCount++;
          }
          if (bgCount >= 2) {
            const idx = pos << 2;
            const r = this.data[idx];
            const g = this.data[idx+1];
            const b = this.data[idx+2];
            const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
            if (maxDiff <= 20 && r >= 200) {
              outPng.data[idx+3] = Math.max(30, 255 - bgCount * 28);
            }
          }
        }
      }
    }

    outPng.pack().pipe(fs.createWriteStream('public/coffee-hero-transparent.png'))
      .on('finish', () => {
        // Also overwrite public/coffee-hero.png and src/assets/coffee-hero.png
        fs.copyFileSync('public/coffee-hero-transparent.png', 'public/coffee-hero.png');
        if (fs.existsSync('src/assets/coffee-hero.png')) {
          fs.copyFileSync('public/coffee-hero-transparent.png', 'src/assets/coffee-hero.png');
        }
        console.log('Successfully updated coffee-hero.png with clean transparent background!');
      });
  });
