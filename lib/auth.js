import jwt from 'jsonwebtoken';

export function verifyAuth(req) {
    const auth = req.headers.authorization || req.headers.Authorization;
    if (!auth || !auth.startsWith('Bearer ')) throw new Error('No token');
    const token = auth.replace('Bearer ', '');
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
        throw new Error('Invalid token');
    }
} 