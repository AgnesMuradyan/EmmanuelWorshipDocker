const fs = require('fs');
const http = require('http');
const path = require('path');
const url = require('url');

const port = Number(process.env.PORT || 3000);
const buildDir = path.join(__dirname, 'build');

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

const sendFile = (res, filePath) => {
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Unable to read file');
      return;
    }

    const type = mimeTypes[path.extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
};

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(url.parse(req.url).pathname);
  const requestedPath = path.normalize(path.join(buildDir, pathname));

  if (!requestedPath.startsWith(buildDir)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad request');
    return;
  }

  fs.stat(requestedPath, (error, stat) => {
    if (!error && stat.isFile()) {
      sendFile(res, requestedPath);
      return;
    }

    sendFile(res, path.join(buildDir, 'index.html'));
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving React build on http://0.0.0.0:${port}`);
});
