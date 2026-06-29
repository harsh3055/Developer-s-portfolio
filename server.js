const http = require('http');
const fs   = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 5050;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.jpg':  'image/jpeg',
  '.webp': 'image/webp',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
};

const CACHE = {
  '.html': 'no-cache',
  '.css':  'public, max-age=31536000, immutable',
  '.js':   'public, max-age=31536000, immutable',
  '.jpg':  'public, max-age=31536000, immutable',
  '.webp': 'public, max-age=31536000, immutable',
};

const GZIP = new Set(['text/html', 'text/css', 'application/javascript']);

http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  const ext      = path.extname(filePath).toLowerCase();
  const mime     = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const headers = {
      'Content-Type':           mime,
      'Cache-Control':          CACHE[ext] || 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    };

    const acceptsGzip = (req.headers['accept-encoding'] || '').includes('gzip');
    if (acceptsGzip && GZIP.has(mime)) {
      zlib.gzip(data, { level: 6 }, (_, compressed) => {
        headers['Content-Encoding'] = 'gzip';
        headers['Content-Length']   = compressed.length;
        res.writeHead(200, headers);
        res.end(compressed);
      });
    } else {
      headers['Content-Length'] = data.length;
      res.writeHead(200, headers);
      res.end(data);
    }
  });
}).listen(PORT, () => console.log(`Serving at http://localhost:${PORT}`));
