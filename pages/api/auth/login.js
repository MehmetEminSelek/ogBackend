import prisma from '../../../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'POST') {
        const { kullaniciAdi, sifre } = req.body;
        if (!kullaniciAdi || !sifre) return res.status(400).json({ message: 'Kullanıcı adı ve şifre zorunludur.' });

        // Email veya username ile arama
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: kullaniciAdi },
                    { username: kullaniciAdi }
                ]
            }
        });

        if (!user) return res.status(401).json({ message: 'Geçersiz kullanıcı veya şifre.' });

        const valid = await bcrypt.compare(sifre, user.password);
        if (!valid) return res.status(401).json({ message: 'Geçersiz kullanıcı veya şifre.' });

        const token = jwt.sign({
            id: user.id,
            ad: user.ad,
            email: user.email,
            rol: user.rol
        }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });

        return res.status(200).json({
            success: true,
            user: { id: user.id, ad: user.ad, email: user.email, rol: user.rol },
            token
        });
    }

    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 