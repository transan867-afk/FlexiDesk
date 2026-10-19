import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve(__dirname, 'data/db.json');

// Plugin to serve and persist database directly to data/db.json
function jsonDatabasePlugin(): Plugin {
  return {
    name: 'json-database-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Read database
        if (req.url === '/api/db' && req.method === 'GET') {
          try {
            if (fs.existsSync(DB_PATH)) {
              const data = fs.readFileSync(DB_PATH, 'utf-8');
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(data);
              return;
            }
          } catch (err) {
            console.error('Error reading db.json:', err);
          }
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Database file not found' }));
          return;
        }

        // Save / Sync database
        if (req.url === '/api/db/sync' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
              res.setHeader('Content-Type', 'application/json; charset=utf-8');
              res.end(JSON.stringify({ success: true, message: 'Dữ liệu đã được lưu trực tiếp vào ổ đĩa (data/db.json) thành công!' }));
              return;
            } catch (err) {
              console.error('Error writing db.json:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: String(err) }));
              return;
            }
          });
          return;
        }

        next();
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), jsonDatabasePlugin()],
  server: {
    host: true,
    port: 5173,
  },
});
