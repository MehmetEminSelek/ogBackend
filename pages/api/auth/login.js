import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email/Kullanıcı adı ve şifre zorunludur.' });

        // Email veya username ile arama
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username: email }
                ]
            }
        });

        if (!user) return res.status(401).json({ message: 'Geçersiz kullanıcı veya şifre.' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ message: 'Geçersiz kullanıcı veya şifre.' });

        const token = jwt.sign({
            id: user.id,
            ad: user.ad,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

        return res.status(200).json({
            user: { id: user.id, ad: user.ad, email: user.email, role: user.role },
            token
        });
    }

    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 