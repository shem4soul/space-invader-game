const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './index.html';
    
    const ext = path.extname(filePath);
    const types = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript'
    };
    
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
        } else {
            res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
            res.end(data);
        }
    });
});

server.listen(8000, () => {
    console.log('Server running at http://localhost:8000');
});

