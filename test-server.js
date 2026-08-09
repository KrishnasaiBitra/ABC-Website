const http = require('http');
const path = require('path');
const { once } = require('node:events');

const root = path.resolve(__dirname, 'public');

function serveStatic(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

(async () => {
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  });

  server.listen(0, '127.0.0.1', async () => {
    const { port } = server.address();
    try {
      const result = await fetch(`http://127.0.0.1:${port}/health`);
      const payload = await result.json();
      console.log(JSON.stringify({ port, payload }));
      server.close();
    } catch (error) {
      console.error(error);
      server.close();
      process.exitCode = 1;
    }
  });
})();
