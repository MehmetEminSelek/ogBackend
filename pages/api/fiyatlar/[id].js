import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const id = parseInt(req.query.id);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Geçersiz fiyat ID.' });
    }

    if (req.method === 'PUT') {
        try {
            const { urunId, birim, fiyat, gecerliTarih } = req.body;
            if (!urunId || !birim || typeof fiyat !== 'number') {
                return res.status(400).json({ message: 'urunId, birim, fiyat (number) zorunludur.' });
            }
            const newStart = gecerliTarih ? new Date(gecerliTarih) : new Date();
            // Transactional logic
            const result = await prisma.$transaction(async (tx) => {
                // 1. Find the current price record
                const current = await tx.fiyat.findUnique({ where: { id } });
                if (!current) throw { code: 'P2025', message: 'Fiyat kaydı bulunamadı.' };
                // 2. Check for overlap: is there another price for this urunId/birim that overlaps with the new period?
                const overlap = await tx.fiyat.findFirst({
                    where: {
                        id: { not: id },
                        urunId: parseInt(urunId),
                        birim,
                        gecerliTarih: { lte: newStart },
                        OR: [
                            { bitisTarihi: null },
                            { bitisTarihi: { gte: newStart } }
                        ]
                    }
                });
                if (overlap) {
                    throw { code: 'OVERLAP', message: 'Bu ürün ve birim için bu tarihte zaten aktif bir fiyat kaydı var.' };
                }
                // 3. Close the old price (set bitisTarihi to newStart)
                await tx.fiyat.update({ where: { id }, data: { bitisTarihi: newStart } });
                // 4. Create the new price
                const created = await tx.fiyat.create({
                data: {
                        urunId: parseInt(urunId),
                        birim,
                        fiyat,
                        gecerliTarih: newStart,
                        bitisTarihi: null
                },
                include: {
                    urun: { select: { id: true, ad: true, kodu: true } }
                }
            });
                return created;
            });
            return res.status(201).json(result);
        } catch (error) {
            console.error('❌ PUT /api/fiyatlar/[id] HATA:', error);
            let status = 500;
            let message = 'Fiyat güncellenirken hata oluştu.';
            if (error.code === 'P2025') { status = 404; message = 'Fiyat kaydı bulunamadı.'; }
            if (error.code === 'OVERLAP') { status = 400; message = error.message; }
            return res.status(status).json({ message, error: error.message });
        }
    }

    if (req.method === 'DELETE') {
        try {
            await prisma.fiyat.delete({ where: { id } });
            return res.status(204).end();
        } catch (error) {
            console.error('❌ DELETE /api/fiyatlar/[id] HATA:', error);
            let status = 500;
            let message = 'Fiyat silinirken hata oluştu.';
            if (error.code === 'P2025') { status = 404; message = 'Fiyat kaydı bulunamadı.'; }
            return res.status(status).json({ message, error: error.message });
        }
    }

    // New: GET /api/fiyatlar/[id]/orders - return count and IDs of orders that used this price
    if (req.method === 'GET' && req.query.orders === 'true') {
        try {
            const price = await prisma.fiyat.findUnique({ where: { id } });
            if (!price) return res.status(404).json({ message: 'Fiyat kaydı bulunamadı.' });
            // Find orders with tarih >= gecerliTarih and (bitisTarihi is null or tarih < bitisTarihi)
            const orders = await prisma.siparis.findMany({
                where: {
                    tarih: { gte: price.gecerliTarih, ...(price.bitisTarihi ? { lt: price.bitisTarihi } : {}) },
                    kalemler: {
                        some: {
                            urunId: price.urunId,
                            birim: price.birim
                        }
                    }
                },
                select: { id: true, tarih: true }
            });
            return res.status(200).json({ count: orders.length, orders });
        } catch (error) {
            return res.status(500).json({ message: 'Siparişler sorgulanırken hata oluştu.', error: error.message });
        }
    }

    res.setHeader('Allow', ['PUT', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 