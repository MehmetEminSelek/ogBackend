import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        const teslimTarihi = req.body.teslimTarihi ? new Date(req.body.teslimTarihi) : new Date();
        const updated = await prisma.siparis.update({
            where: { id: Number(id) },
            data: {
                teslimTarihi,
                kargoDurumu: 'TESLIM_EDILDI',
            },
        });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Teslim onayı başarısız', error: err.message });
    }
} 