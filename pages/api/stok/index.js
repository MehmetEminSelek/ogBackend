import prisma from '../../../lib/prisma';
// import { verifyAuth } from '../../../lib/auth'; // GELİŞTİRME İÇİN GEÇİCİ OLARAK KAPALI

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            // Get all materials (unified hammadde + yarimamul)
            const materials = await prisma.material.findMany({
                where: { aktif: true },
                orderBy: { updatedAt: 'desc' }
            });

            const result = materials.map(m => ({
                id: m.id,
                ad: m.ad,
                kod: m.kod,
                tipi: m.tipi,
                birim: m.birim,
                birimFiyat: m.birimFiyat,
                mevcutStok: m.mevcutStok,
                minStokSeviye: m.minStokSeviye,
                maxStokSeviye: m.maxStokSeviye,
                kritikSeviye: m.kritikSeviye,
                aciklama: m.aciklama,
                tedarikci: m.tedarikci,
                rafOmru: m.rafOmru,
                saklamaKosullari: m.saklamaKosullari,
                aktif: m.aktif,
                updatedAt: m.updatedAt
            }));

            return res.status(200).json(result);
        } catch (error) {
            return res.status(500).json({ message: 'Malzemeler listelenirken hata oluştu.', error: error.message });
        }
    }

    if (req.method === 'POST') {
        // Auth kontrolü - GELİŞTİRME İÇİN GEÇİCİ OLARAK KAPALI
        // let user;
        // try {
        //     user = verifyAuth(req);
        // } catch (e) {
        //     return res.status(401).json({ message: 'Yetkisiz.' });
        // }

        try {
            const { materialId, miktar, tip } = req.body;
            if (!materialId || !miktar || !['GIRIS', 'CIKIS'].includes(tip)) {
                return res.status(400).json({ message: 'materialId, miktar ve tip (GIRIS/CIKIS) zorunludur.' });
            }

            const material = await prisma.material.findUnique({ where: { id: materialId } });
            if (!material) return res.status(404).json({ message: 'Malzeme kaydı bulunamadı.' });

            const yeniMiktar = tip === 'GIRIS'
                ? material.mevcutStok + Number(miktar)
                : material.mevcutStok - Number(miktar);

            if (yeniMiktar < 0) return res.status(400).json({ message: 'Stok miktarı sıfırın altına inemez.' });

            const updated = await prisma.material.update({
                where: { id: materialId },
                data: { mevcutStok: yeniMiktar }
            });

            await prisma.stokHareket.create({
                data: {
                    materialId,
                    tip,
                    miktar: Number(miktar),
                    birim: material.birim,
                    aciklama: tip === 'GIRIS' ? 'Manuel giriş' : 'Manuel çıkış',
                    oncekiStok: material.mevcutStok,
                    sonrakiStok: yeniMiktar,
                    createdBy: 1 // Geçici olarak admin user ID
                }
            });

            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ message: 'Stok güncellenirken hata oluştu.', error: error.message });
        }
    }

    if (req.method === 'PATCH') {
        // Auth kontrolü - GELİŞTİRME İÇİN GEÇİCİ OLARAK KAPALI
        // let user;
        // try {
        //     user = verifyAuth(req);
        // } catch (e) {
        //     return res.status(401).json({ message: 'Yetkisiz.' });
        // }

        try {
            const { materialId, minStokSeviye } = req.body;
            if (!materialId || typeof minStokSeviye !== 'number') {
                return res.status(400).json({ message: 'materialId ve minStokSeviye zorunludur.' });
            }

            const updated = await prisma.material.update({
                where: { id: materialId },
                data: { minStokSeviye }
            });

            return res.status(200).json(updated);
        } catch (error) {
            return res.status(500).json({ message: 'Minimum stok güncellenirken hata oluştu.', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 