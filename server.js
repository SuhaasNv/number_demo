// Minimal static file server, zero dependencies.
// Serves index.html / style.css / script.js so this runs as-is on Railway
// (or any host that sets PORT and runs `npm start`).

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
};

// Only these files are ever servable — nothing else in the folder
// (server.js, package.json, etc.) is reachable over the network.
const ALLOWED_FILES = new Set(['/index.html', '/style.css', '/script.js']);

// Security headers — the app is fully self-contained (no external scripts,
// styles, fonts, or images), so the CSP can be locked down to 'self'.
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Content-Security-Policy': "default-src 'self'; base-uri 'none'; form-action 'none'",
};

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain', Allow: 'GET, HEAD' });
    res.end('Method not allowed');
    return;
  }

  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/') reqPath = '/index.html';

  if (!ALLOWED_FILES.has(reqPath)) {
    res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
    res.end('Not found');
    return;
  }

  const filePath = path.normalize(path.join(ROOT, reqPath));

  // prevent escaping the project directory
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, SECURITY_HEADERS);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

server.listen(PORT, () => {
  console.log(`Number demo running on port ${PORT}`);
});
