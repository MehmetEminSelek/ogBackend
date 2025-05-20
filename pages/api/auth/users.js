import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAuth } from '../../../lib/auth';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    let user;
    try {
        user = verifyAuth(req);
        if (user.role !== 'admin' && user.role !== 'mudur') throw new Error('Yetkisiz.');
    } catch (e) {
        return res.status(401).json({ message: 'Yetkisiz.' });
    }

    if (req.method === 'GET') {
        const users = await prisma.user.findMany({ select: { id: true, ad: true, email: true, role: true, createdAt: true } });
        return res.status(200).json(users);
    }

    if (req.method === 'POST') {
        const { ad, email, password, role } = req.body;
        if (!ad || !email || !password || !role) return res.status(400).json({ message: 'ad, email, password, role zorunludur.' });
        const passwordHash = await bcrypt.hash(password, 10);
        const created = await prisma.user.create({ data: { ad, email, passwordHash, role } });
        return res.status(201).json({ id: created.id, ad: created.ad, email: created.email, role: created.role, createdAt: created.createdAt });
    }

    if (req.method === 'PATCH') {
        const { id, ad, email, password, role } = req.body;
        if (!id) return res.status(400).json({ message: 'id zorunludur.' });
        const data = { ad, email, role };
        if (password) data.passwordHash = await bcrypt.hash(password, 10);
        const updated = await prisma.user.update({ where: { id }, data });
        return res.status(200).json({ id: updated.id, ad: updated.ad, email: updated.email, role: updated.role, createdAt: updated.createdAt });
    }

    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: 'id zorunludur.' });
        await prisma.user.delete({ where: { id } });
        return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 