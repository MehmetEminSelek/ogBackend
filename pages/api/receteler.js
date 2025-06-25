import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            console.log('API /api/receteler GET isteği alındı');

            // Yeni schema ile recipes al
            const recipes = await prisma.recipe.findMany({
                where: { aktif: true },
                include: {
                    urun: { select: { id: true, ad: true, kod: true } },
                    icerikelek: {
                        include: {
                            material: {
                                select: {
                                    id: true,
                                    ad: true,
                                    kod: true,
                                    tipi: true,
                                    birim: true,
                                    birimFiyat: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            console.log('Veritabanından alınan reçete sayısı:', recipes.length);

            // Response formatını düzenle
            const enriched = recipes.map(rec => ({
                id: rec.id,
                ad: rec.ad,
                kod: rec.kod,
                name: rec.ad, // Eski API uyumluluğu için
                urunAd: rec.urun?.ad || null,
                urunId: rec.urunId,
                aciklama: rec.aciklama,
                porsiyon: rec.porsiyon,
                hazirlamaSuresi: rec.hazirlamaSuresi,
                pisirmeSuresi: rec.pisirmeSuresi,
                toplamMaliyet: rec.toplamMaliyet,
                porsinoyonMaliyet: rec.porsinoyonMaliyet,
                versiyon: rec.versiyon,
                aktif: rec.aktif,
                ingredients: rec.icerikelek.map(ing => ({
                    id: ing.id,
                    materialId: ing.materialId,
                    stokKod: ing.material.kod, // Eski API uyumluluğu için
                    stokAd: ing.material.ad,
                    stokTip: ing.material.tipi,
                    miktar: ing.miktar,
                    miktarGram: ing.miktar, // Eski API uyumluluğu için
                    birim: ing.birim,
                    birimFiyat: ing.material.birimFiyat || 0,
                    hazirlamaNotu: ing.hazirlamaNotu,
                    zorunlu: ing.zorunlu,
                    siraNo: ing.siraNo
                }))
            }));

            console.log('API /api/receteler dönen reçete sayısı:', enriched.length, 'IDler:', enriched.map(r => r.id));
            return res.status(200).json(enriched);
        } catch (error) {
            console.error('Reçeteler GET hatası:', error);
            return res.status(500).json({
                message: 'Reçeteler listelenirken hata oluştu.',
                error: error.message
            });
        }
    }

    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}