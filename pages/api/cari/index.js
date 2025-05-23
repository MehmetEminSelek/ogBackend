import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        // Cari listesi
        const cariler = await prisma.cari.findMany({
            orderBy: { ad: 'asc' },
            include: {
                adresler: true,
            },
        });
        return res.status(200).json(cariler);
    }
    if (req.method === 'POST') {
        // Yeni cari ekle (çoklu adres desteği)
        const { ad, telefon, email, aciklama, adresler } = req.body;
        if (!ad) return res.status(400).json({ error: 'Ad zorunlu' });
        const yeniCari = await prisma.cari.create({
            data: {
                ad,
                telefon,
                email,
                aciklama,
                adresler: adresler && Array.isArray(adresler)
                    ? {
                        create: adresler.map(a => ({ tip: a.tip || 'Genel', adres: a.adres }))
                    }
                    : undefined,
            },
            include: { adresler: true },
        });
        return res.status(201).json(yeniCari);
    }
    if (req.method === 'PUT') {
        // Cari güncelle
        const { id, adresler, ...otherData } = req.body;
        if (!id) return res.status(400).json({ error: 'ID zorunlu' });
        const updateData = { ...otherData };
        delete updateData.hareketler;
        delete updateData.siparisler;
        if (Array.isArray(adresler)) {
            updateData.adresler = {
                deleteMany: {},
                create: adresler.map(a => ({ tip: a.tip || 'Genel', adres: a.adres }))
            };
        }
        const guncellenen = await prisma.cari.update({
            where: { id: Number(id) },
            data: updateData,
            include: { adresler: true },
        });
        return res.status(200).json(guncellenen);
    }
    if (req.method === 'DELETE') {
        // Cari sil
        const { id } = req.body;
        if (!id) return res.status(400).json({ error: 'ID zorunlu' });
        await prisma.cari.delete({ where: { id: Number(id) } });
        return res.status(204).end();
    }
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
} 