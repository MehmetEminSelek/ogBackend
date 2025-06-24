// server.js - Custom NextJS Server with Socket.IO
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocket } = require('./lib/socket-commonjs.js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Tüm IP'lerde dinle
const port = process.env.PORT || 3000;

// ogsiparis.com domain konfigürasyonu
const allowedOrigins = dev 
    ? ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
    : ['https://ogsiparis.com', 'https://www.ogsiparis.com'];

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            // CORS headers
            const origin = req.headers.origin;
            if (allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Allow-Credentials', 'true');

            // Preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            const parsedUrl = parse(req.url, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error occurred handling', req.url, err);
            res.statusCode = 500;
            res.end('internal server error');
        }
    });

    // Initialize Socket.IO
    initSocket(server);

    server.listen(port, hostname, (err) => {
        if (err) throw err;
        console.log(`🚀 Server ready on http://${hostname}:${port}`);
        console.log(`🌐 Domain: ${dev ? 'localhost' : 'ogsiparis.com'}`);
        console.log(`🔧 Environment: ${dev ? 'Development' : 'Production'}`);
    });
}); 