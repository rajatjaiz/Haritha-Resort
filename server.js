// Local development server: static files from public/ + the same API handler Vercel runs.
//   node server.js        (uses DATABASE_URL if set, otherwise an in-process local Postgres under data/)
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

try { // minimal .env loader (Vercel injects real env vars)
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#') && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch {}
const { handler } = require('./lib/app');
const PORT = +process.env.PORT || 3000;
const PUB = path.join(__dirname, 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };

http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://x').pathname;
  if (pathname.startsWith('/api/') || pathname === '/webhook') return handler(req, res);
  let rel = decodeURIComponent(pathname);
  let file = path.join(PUB, path.normalize(rel));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  try {
    const stat = fs.statSync(file);
    if (stat.isDirectory()) {
      if (!rel.endsWith('/')) {
        res.writeHead(301, { Location: pathname + '/' });
        return res.end();
      }
      file = path.join(file, 'index.html');
    }
  } catch {}
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log(`Haritha Resort app on http://localhost:${PORT}  (admin: /admin/)`));
