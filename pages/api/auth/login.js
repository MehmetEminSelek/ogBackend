import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email ve şifre zorunludur.' });
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Geçersiz kullanıcı veya şifre.' });
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ message: 'Geçersiz kullanıcı veya şifre.' });
        const token = jwt.sign({ id: user.id, ad: user.ad, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({
            user: { id: user.id, ad: user.ad, email: user.email, role: user.role },
            token
        });
    }

    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 