import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    const { id } = req.query;
    if (req.method !== 'PATCH') {
        return res.status(405).json({ message: 'Method not allowed' });
    }
    try {
        const updateData = {};
        const allowedFields = [
            'kargoDurumu',
            'kargoSirketi',
            'kargoTakipNo',
            'kargoNotu',
            'kargoTarihi',
            'teslimTarihi',
            'hedefSubeId',
        ];
        for (const field of allowedFields) {
            if (field in req.body) {
                updateData[field] = req.body[field];
            }
        }
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'Güncellenecek alan yok.' });
        }
        const updated = await prisma.siparis.update({
            where: { id: Number(id) },
            data: updateData,
        });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Kargo bilgisi güncellenemedi', error: err.message });
    }
} 