import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            const { startDate, endDate } = req.query;
            const where = {};
            if (startDate || endDate) {
                where.createdAt = {};
                if (startDate) where.createdAt.gte = new Date(startDate);
                if (endDate) where.createdAt.lte = new Date(endDate);
            }
            // Toplamlar
            const [giris, cikis, transfer] = await Promise.all([
                prisma.stokHareket.aggregate({ _sum: { miktarGram: true }, where: { ...where, tip: 'giris' } }),
                prisma.stokHareket.aggregate({ _sum: { miktarGram: true }, where: { ...where, tip: 'cikis' } }),
                prisma.stokHareket.aggregate({ _sum: { miktarGram: true }, where: { ...where, tip: 'transfer' } })
            ]);
            // En çok hareket görenler
            const enCokGiren = await prisma.stokHareket.groupBy({
                by: ['stokId'],
                where: { ...where, tip: 'giris' },
                _sum: { miktarGram: true },
                orderBy: { _sum: { miktarGram: 'desc' } },
                take: 5
            });
            const enCokCikan = await prisma.stokHareket.groupBy({
                by: ['stokId'],
                where: { ...where, tip: 'cikis' },
                _sum: { miktarGram: true },
                orderBy: { _sum: { miktarGram: 'desc' } },
                take: 5
            });
            // Kritik stoklar
            const kritikStoklar = await prisma.stok.findMany({
                where: { miktarGram: { lt: prisma.stok.fields.minimumMiktarGram } },
                include: { hammadde: true, yariMamul: true, operasyonBirimi: true }
            });
            // Stok isimlerini ekle
            const stokIds = [...new Set([...enCokGiren, ...enCokCikan].map(x => x.stokId))];
            const stoklar = await prisma.stok.findMany({
                where: { id: { in: stokIds } },
                include: { hammadde: true, yariMamul: true, operasyonBirimi: true }
            });
            const stokMap = Object.fromEntries(stoklar.map(s => [s.id, s]));
            return res.status(200).json({
                toplamGiris: giris._sum.miktarGram || 0,
                toplamCikis: cikis._sum.miktarGram || 0,
                toplamTransfer: transfer._sum.miktarGram || 0,
                enCokGiren: enCokGiren.map(x => ({ ...x, stok: stokMap[x.stokId] })),
                enCokCikan: enCokCikan.map(x => ({ ...x, stok: stokMap[x.stokId] })),
                kritikStoklar
            });
        } catch (error) {
            return res.status(500).json({ message: 'Rapor alınamadı.', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 