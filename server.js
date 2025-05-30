// server.js - Custom NextJS Server with Socket.IO
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocket } = require('./lib/socket-commonjs.js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0'; // Tüm IP'lerde dinle
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
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
    });
}); 