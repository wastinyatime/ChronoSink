import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-public-static-files',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/ping-indexnow') {
              try {
                const targetUrl = 'https://ais-pre-r2dfoalxbovonagjxoatsy-921233943535.asia-southeast1.run.app/';
                const key = '849204bf7c2547b79da933a39e701e68';
                const pingUrl = `https://api.indexnow.org/indexnow?url=${encodeURIComponent(targetUrl)}&key=${key}`;
                const pingRes = await fetch(pingUrl);
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: true, status: pingRes.status, statusText: pingRes.statusText }));
              } catch (err: any) {
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ success: false, error: err?.message || 'Failed' }));
              }
            }

            if (req.url) {
              const cleanUrl = req.url.split('?')[0].slice(1);
              if (cleanUrl) {
                const filePath = path.resolve(__dirname, 'public', cleanUrl);
                if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                  const ext = path.extname(filePath).toLowerCase();
                  const mimeTypes: Record<string, string> = {
                    '.html': 'text/html; charset=utf-8',
                    '.txt': 'text/plain; charset=utf-8',
                    '.xml': 'application/xml; charset=utf-8',
                    '.json': 'application/json; charset=utf-8',
                    '.svg': 'image/svg+xml',
                    '.png': 'image/png',
                    '.ico': 'image/x-icon',
                  };
                  res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
                  return res.end(fs.readFileSync(filePath));
                }
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
