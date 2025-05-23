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
        if (user.role !== 'superadmin' && user.role !== 'admin' && user.role !== 'mudur') throw new Error('Yetkisiz.');
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
        const { id, ids } = req.body;
        if (ids && Array.isArray(ids)) {
            if (user.role !== 'superadmin' && user.role !== 'admin') return res.status(403).json({ message: 'Yetkisiz.' });
            let filteredIds = ids;
            if (user.role !== 'superadmin') {
                const usersToDelete = await prisma.user.findMany({ where: { id: { in: ids } } });
                filteredIds = usersToDelete.filter(u => u.role !== 'admin' && u.role !== 'superadmin').map(u => u.id);
            } else {
                filteredIds = ids.filter(uid => uid !== user.id);
            }
            await prisma.user.deleteMany({ where: { id: { in: filteredIds } } });
            return res.status(200).json({ deleted: filteredIds.length });
        }
        if (!id) return res.status(400).json({ message: 'id zorunludur.' });
        if (user.role !== 'superadmin') {
            const u = await prisma.user.findUnique({ where: { id } });
            if (!u || u.role === 'admin' || u.role === 'superadmin') return res.status(403).json({ message: 'Yetkisiz.' });
        } else if (id === user.id) {
            return res.status(403).json({ message: 'Kendi hesabınızı silemezsiniz.' });
        }
        await prisma.user.delete({ where: { id } });
        return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 