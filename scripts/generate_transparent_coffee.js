import fs from 'fs';
import { PNG } from 'pngjs';

const origData = fs.readFileSync('C:/Users/Hi There/.gemini/antigravity/brain/47e75e4f-cf8c-465a-b318-9b2e43173a1c/.user_uploaded/media_1792336799060_9b0fb875.png');

new PNG().parse(origData, (err, img) => {
  const width = img.width;
  const height = img.height;
  const visited = new Uint8Array(width * height);
  const queue = [];

  // Check if pixel belongs to checkerboard background
  // Checkerboard is completely neutral gray/white: max difference between R, G, B is <= 3
  // and brightness >= 225
  const isBgPixel = (x, y) => {
    const idx = (width * y + x) << 2;
    const r = img.data[idx];
    const g = img.data[idx+1];
    const b = img.data[idx+2];
    const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
    return maxDiff <= 3 && r >= 225;
  };

  // Seed BFS from all borders
  for (let x = 0; x < width; x++) {
    if (isBgPixel(x, 0) && !visited[x]) {
      queue.push((0 << 16) | x);
      visited[x] = 1;
    }
    if (isBgPixel(x, height - 1) && !visited[(height - 1) * width + x]) {
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

  // 8-directional BFS flood fill
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

  // Clear any isolated islands outside cup
  const fgVisited = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      if (!visited[pos] && !fgVisited[pos]) {
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
        if (fgComp.length < 500) {
          for (const v of fgComp) {
            const fx = v & 0xFFFF;
            const fy = v >> 16;
            visited[fy * width + fx] = 1;
          }
        }
      }
    }
  }

  // Create clean transparent PNG
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
        outPng.data[idx] = img.data[idx];
        outPng.data[idx+1] = img.data[idx+1];
        outPng.data[idx+2] = img.data[idx+2];
        outPng.data[idx+3] = 255;
      }
    }
  }

  // Gentle 1-pixel feathering on boundary
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pos = y * width + x;
      if (!visited[pos]) {
        let bgCount = 0;
        for (let d = 0; d < 4; d++) {
          if (visited[(y + dy[d]) * width + (x + dx[d])]) bgCount++;
        }
        if (bgCount >= 2) {
          const idx = pos << 2;
          const r = img.data[idx];
          const g = img.data[idx+1];
          const b = img.data[idx+2];
          const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
          if (maxDiff <= 6 && r >= 230) {
            outPng.data[idx+3] = 180;
          }
        }
      }
    }
  }

  outPng.pack().pipe(fs.createWriteStream('public/coffee-hero.png'))
    .on('finish', () => {
      fs.copyFileSync('public/coffee-hero.png', 'src/assets/coffee-hero.png');
      console.log('Successfully saved perfect transparent coffee-hero.png!');
    });
});
