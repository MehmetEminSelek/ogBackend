import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            const { stokId } = req.query;
            const where = stokId ? { stokId: Number(stokId) } : {};
            const hareketler = await prisma.stokHareket.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: 200,
                include: {
                    stok: { include: { hammadde: true, yariMamul: true, operasyonBirimi: true } },
                    user: { select: { ad: true, email: true, rol: true } }
                }
            });
            return res.status(200).json(hareketler);
        } catch (error) {
            return res.status(500).json({ message: 'Stok hareketleri alınamadı.', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 