export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, cache-control');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    res.status(200).json({
        ok: true,
        message: 'CORS test başarılı',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin
    });
} 