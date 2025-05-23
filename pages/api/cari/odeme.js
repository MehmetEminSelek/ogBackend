import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { cariId, tutar, aciklama, vadeTarihi } = req.body;
        if (!cariId || tutar === undefined) {
            return res.status(400).json({ error: 'cariId ve tutar zorunlu' });
        }
        // Cari hareketi olarak ödeme kaydı
        const hareket = await prisma.cariHareket.create({
            data: {
                cariId: Number(cariId),
                tip: 'odeme',
                tutar: Number(tutar),
                aciklama,
                vadeTarihi: vadeTarihi ? new Date(vadeTarihi) : null,
                direction: 'alacak',
            },
        });
        // Cari bakiyesini güncelle
        await prisma.cari.update({
            where: { id: Number(cariId) },
            data: { bakiye: { increment: Number(tutar) } },
        });
        return res.status(201).json(hareket);
    }
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
} 