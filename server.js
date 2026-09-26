// server.js
// Zero-dependency static file server for the capstone app.
// Serves the contents of my-capstone-app/ at http://localhost:3000/

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'my-capstone-app');

const CONTENT_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    const relativePath = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    const filePath = path.normalize(path.join(ROOT, relativePath));

    // Guard against path traversal outside of the app directory.
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
        res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
            return;
        }

        const contentType = CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
