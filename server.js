const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const http = require('http');
const fs = require('fs');

const { getCorsHeaders } = require('./lib/validation');

const rootDir = path.join(__dirname, 'public');
const port = process.env.PORT || 3000;
const MAX_BODY_BYTES = 5 * 1024 * 1024;

const contactHandler = require('./netlify/functions/contact').handler;
const careersHandler = require('./netlify/functions/careers').handler;
const careersApplyHandler = require('./netlify/functions/careers-apply').handler;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8'
};

function writeJson(res, statusCode, payload, origin) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...getCorsHeaders(origin)
  });
  res.end(JSON.stringify(payload));
}

function handleRequestBody(req, maxBytes, onComplete) {
  let body = '';
  let total = 0;

  req.on('data', (chunk) => {
    total += chunk.length;
    if (total > maxBytes) {
      req.destroy();
      return;
    }
    body += chunk;
  });

  req.on('error', () => {
    onComplete(null, { tooLarge: false, error: true });
  });

  req.on('end', () => {
    if (total > maxBytes) {
      onComplete(null, { tooLarge: true, error: false });
      return;
    }
    onComplete(body, { tooLarge: false, error: false });
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const origin = req.headers.origin || null;
    const url = new URL(req.url, `http://${req.headers.host}`);
    let reqPath = decodeURIComponent(url.pathname);

    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        ...getCorsHeaders(origin),
        'Access-Control-Allow-Origin': origin && origin.startsWith('http://localhost') || origin && origin.startsWith('http://127.0.0.1') || origin && origin.startsWith('https://localhost') ? origin : 'null',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      });
      res.end();
      return;
    }

    if (reqPath === '/') {
      reqPath = '/index.html';
    }

    const routeMap = {
      '/our-story': '/our-story.html',
      '/solutions': '/solutions.html',
      '/what-we-offer': '/what-we-offer.html',
      '/career': '/career.html'
    };

    if (reqPath === '/api/contact') {
      handleRequestBody(req, MAX_BODY_BYTES, async (body, meta) => {
        if (meta.tooLarge) {
          writeJson(res, 413, { success: false, message: 'Request body too large.' }, origin);
          return;
        }

        if (meta.error || body === null) {
          writeJson(res, 400, { success: false, message: 'Invalid request body.' }, origin);
          return;
        }

        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body,
            queryStringParameters: Object.fromEntries(url.searchParams.entries())
          };
          const response = await contactHandler(event);
          res.writeHead(response.statusCode || 200, {
            'Content-Type': response.headers?.['Content-Type'] || 'application/json; charset=utf-8',
            ...getCorsHeaders(origin)
          });
          res.end(response.body || JSON.stringify({ success: false, message: 'No response' }));
        } catch (error) {
          console.error('Local contact handler crashed', { message: error.message });
          writeJson(res, 500, { success: false, message: 'Could not process your request.' }, origin);
        }
      });
      return;
    }

    if (reqPath === '/api/careers-apply') {
      handleRequestBody(req, MAX_BODY_BYTES, async (body, meta) => {
        if (meta.tooLarge) {
          writeJson(res, 413, { success: false, message: 'Request body too large.' }, origin);
          return;
        }

        if (meta.error || body === null) {
          writeJson(res, 400, { success: false, message: 'Invalid request body.' }, origin);
          return;
        }

        try {
          const event = {
            httpMethod: req.method,
            headers: req.headers,
            body,
            queryStringParameters: Object.fromEntries(url.searchParams.entries())
          };
          const response = await careersApplyHandler(event);
          res.writeHead(response.statusCode || 200, {
            'Content-Type': response.headers?.['Content-Type'] || 'application/json; charset=utf-8',
            ...getCorsHeaders(origin)
          });
          res.end(response.body || JSON.stringify({ success: false, message: 'No response' }));
        } catch (error) {
          console.error('Local careers handler crashed', { message: error.message });
          writeJson(res, 500, { success: false, message: 'Could not process your request.' }, origin);
        }
      });
      return;
    }

    if (reqPath === '/api/careers') {
      try {
        const response = await careersHandler({
          httpMethod: req.method,
          headers: req.headers,
          queryStringParameters: Object.fromEntries(url.searchParams.entries())
        });
        res.writeHead(response.statusCode || 200, {
          'Content-Type': response.headers?.['Content-Type'] || 'application/json; charset=utf-8',
          ...getCorsHeaders(origin)
        });
        res.end(response.body || JSON.stringify({ success: false, message: 'No response' }));
      } catch (error) {
        console.error('Local careers fetch failed', { message: error.message });
        writeJson(res, 500, { success: false, message: 'Could not load careers.' }, origin);
      }
      return;
    }

    let requestedFile = routeMap[reqPath] || reqPath;

    const safePath = path.normalize(path.join(rootDir, requestedFile)).replace(/\\/g, '/');
    const root = path.normalize(rootDir).replace(/\\/g, '/');

    if (!safePath.startsWith(root)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Forbidden');
      return;
    }

    fs.readFile(safePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'X-Content-Type-Options': 'nosniff' });
        res.end('Not Found');
        return;
      }

      const ext = path.extname(safePath).toLowerCase();
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'X-Frame-Options': 'SAMEORIGIN',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      });
      res.end(data);
    });
  } catch (error) {
    console.error('Unhandled server error', { message: error.message });
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Internal server error');
    }
  }
});

server.listen(port, () => {
  console.log(`Local site running at http://localhost:${port}`);
});
