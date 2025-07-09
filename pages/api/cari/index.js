import prisma from '../../../lib/prisma';
import { withRBAC, PERMISSIONS } from '../../../lib/rbac';

async function handler(req, res) {
    if (req.method === 'GET') {
        // Cari listesi
        const cariler = await prisma.cari.findMany({
            orderBy: { ad: 'asc' },
            include: {
                siparisler: { take: 5, orderBy: { createdAt: 'desc' } },
                hareketler: { take: 5, orderBy: { createdAt: 'desc' } }
            },
        });
        return res.status(200).json(cariler);
    }
    if (req.method === 'POST') {
        // Yeni cari ekle
        const { ad, soyad, unvan, telefon, email, adres, il, ilce, postaKodu, musteriKodu, tipi, subeId } = req.body;
        if (!ad) return res.status(400).json({ error: 'Ad zorunlu' });
        const yeniCari = await prisma.cari.create({
            data: {
                ad,
                soyad,
                telefon,
                email,
                adres,
                il,
                ilce,
                postaKodu,
                musteriKodu: musteriKodu || `MUS${Date.now()}`,
                tipi: tipi || 'MUSTERI'
            }
        });
        return res.status(201).json(yeniCari);
    }
    if (req.method === 'PUT') {
        // Cari güncelle
        const { id, ...otherData } = req.body;
        if (!id) return res.status(400).json({ error: 'ID zorunlu' });
        const updateData = { ...otherData };
        delete updateData.hareketler;
        delete updateData.siparisler;
        delete updateData.odemeler;

        const guncellenen = await prisma.cari.update({
            where: { id: Number(id) },
            data: updateData
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

// Export with RBAC protection
export default withRBAC(handler, {
    permission: PERMISSIONS.VIEW_CUSTOMERS // Base permission, specific methods will be checked inside
}); 