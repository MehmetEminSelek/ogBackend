// pages/api/siparis/[id].js
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

// Helper fonksiyonlar
async function getPriceForDate(tx, urunId, birim, tarih) {
    if (!urunId || !birim || !tarih) return 0;
    const targetBirim = birim.toLowerCase() === 'gram' ? 'KG' : birim;
    const fiyatKaydi = await tx.fiyat.findFirst({
        where: {
            urunId: urunId,
            birim: targetBirim,
            gecerliTarih: { lte: tarih },
            OR: [{ bitisTarihi: null }, { bitisTarihi: { gte: tarih } }]
        },
        orderBy: { gecerliTarih: 'desc' },
    });
    return fiyatKaydi?.fiyat || 0;
}
async function getTepsiTavaPrice(tx, tepsiTavaId) {
    if (!tepsiTavaId) return 0;
    const tepsi = await tx.tepsiTava.findUnique({ where: { id: tepsiTavaId }, select: { fiyat: true } });
    return tepsi?.fiyat || 0;
}

export default async function handler(req, res) {
    // CORS ve OPTIONS Handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') { return res.status(200).end(); }

    const idQueryParam = req.query.id;
    const id = parseInt(idQueryParam);
    if (isNaN(id)) { return res.status(400).json({ message: 'Geçersiz Sipariş ID.' }); }

    // --- GET ve DELETE metodları ---
    if (req.method === 'GET') { /* ... önceki GET kodu ... */ }
    if (req.method === 'DELETE') { /* ... önceki DELETE kodu ... */ }

    // --- SİPARİŞ GÜNCELLEME (PUT) ---
    if (req.method === 'PUT') {
        console.log(`PUT /api/siparis/${id} isteği alındı. Body:`, JSON.stringify(req.body, null, 2));
        const { onaylandiMi, kalemler, hazirlanmaDurumu } = req.body;

        const isApprovalOnly = typeof onaylandiMi === 'boolean' && kalemler === undefined && hazirlanmaDurumu === undefined;
        // Hazırlanma durumu güncellemesi HER ZAMAN kalemleri de içermeli (frontend öyle gönderiyor)
        const isPreparationUpdate = hazirlanmaDurumu === "Hazırlandı" && Array.isArray(kalemler);
        // Sadece kalem güncellemesi (Onay sayfasından gelen)
        const isItemsOnlyUpdate = Array.isArray(kalemler) && onaylandiMi === undefined && hazirlanmaDurumu === undefined;

        if (!isApprovalOnly && !isPreparationUpdate && !isItemsOnlyUpdate) {
            return res.status(400).json({ message: "Geçersiz güncelleme isteği." });
        }

        try {
            const guncellenenSiparis = await prisma.$transaction(async (tx) => {

                const mevcutSiparis = await tx.siparis.findUnique({ where: { id }, select: { tarih: true } });
                if (!mevcutSiparis) { throw new Error('P2025'); }
                const siparisTarihi = mevcutSiparis.tarih;

                // --- Sadece Onaylama İşlemi ---
                if (isApprovalOnly) {
                    console.log(`Sipariş ${id} onay durumu güncelleniyor: ${onaylandiMi}`);
                    return tx.siparis.update({ where: { id }, data: { onaylandiMi: onaylandiMi }, include: { kalemler: true } });
                }

                // --- Kalem Güncelleme (veya Hazırlandı İşaretleme) ---
                // (isItemsOnlyUpdate || isPreparationUpdate) koşulu geçerli
                else {
                    console.log(`Sipariş ${id} kalemleri güncelleniyor...`);

                    if (!kalemler) { // Kalemler dizisi gelmediyse hata (hazırlanma durumuyla birlikte gelmeli)
                        throw new Error("Kalem bilgileri eksik.");
                    }
                    if (kalemler.length === 0 && isPreparationUpdate) {
                        console.log(`Sipariş ${id} için güncellenecek kalem yok, sadece durum güncelleniyor.`);
                        // Sadece durumu güncelle
                        return tx.siparis.update({ where: { id }, data: { hazirlanmaDurumu: "Hazırlandı", updatedAt: new Date() }, include: { kalemler: true } });
                    }
                    if (kalemler.length === 0 && isItemsOnlyUpdate) {
                        console.log(`Sipariş ${id} için tüm kalemler kaldırılıyor.`);
                        await tx.siparisKalemi.deleteMany({ where: { siparisId: id } });
                        // Tepsi maliyetini sıfırla ve updatedAt güncelle
                        await tx.siparis.update({ where: { id }, data: { toplamTepsiMaliyeti: 0, updatedAt: new Date() } });
                        return tx.siparis.findUnique({ where: { id }, include: { kalemler: true } });
                    }


                    // Kalem miktarlarını güncelle
                    const updatePromises = kalemler.map(kalem => {
                        const kalemId = parseInt(kalem.id);
                        const yeniMiktar = parseFloat(kalem.miktar);
                        if (isNaN(kalemId) || kalemId <= 0 || isNaN(yeniMiktar) || yeniMiktar < 0) {
                            throw new Error(`Güncellenecek kalem verisi eksik veya geçersiz (ID: ${kalem.id})`);
                        }
                        // Sadece miktarı güncellemek için updateMany yerine update kullanalım
                        // (veya updateMany daha performanslı olabilir ama daha karmaşık where gerektirir)
                        return tx.siparisKalemi.update({
                            where: { id: kalemId },
                            data: { miktar: yeniMiktar }
                        });
                    });
                    await Promise.all(updatePromises);
                    console.log(`Sipariş ${id} için ${kalemler.length} kalemin miktarı güncellendi.`);

                    // Ana sipariş verisini güncelle
                    const updateData = { updatedAt: new Date() };
                    if (isPreparationUpdate) {
                        updateData.hazirlanmaDurumu = "Hazırlandı";
                    }

                    // Tepsi maliyetini yeniden hesapla
                    let yeniToplamTepsiMaliyeti = 0;
                    // Güncellenecek kalemlerin ID'lerini alalım
                    const kalemIds = kalemler.map(k => parseInt(k.id)).filter(id => !isNaN(id));
                    if (kalemIds.length > 0) {
                        const guncellenecekKalemler = await tx.siparisKalemi.findMany({
                            where: { id: { in: kalemIds } },
                            select: { tepsiTavaId: true } // Sadece tepsi ID'lerini al
                        });
                        const guncelTepsiIdsFromDb = guncellenecekKalemler
                            .map(k => k.tepsiTavaId)
                            .filter(id => id != null); // null olmayanları al

                        if (guncelTepsiIdsFromDb.length > 0) {
                            const tepsiFiyatlari = await Promise.all(
                                [...new Set(guncelTepsiIdsFromDb)].map(id => getTepsiTavaPrice(tx, id))
                            );
                            yeniToplamTepsiMaliyeti = tepsiFiyatlari.reduce((sum, price) => sum + price, 0);
                        }
                    }
                    updateData.toplamTepsiMaliyeti = yeniToplamTepsiMaliyeti; // Hesaplanan maliyeti ekle
                    console.log("Güncelleme sonrası yeni Toplam Tepsi Maliyeti:", yeniToplamTepsiMaliyeti);

                    // Ana siparişi güncelle
                    await tx.siparis.update({ where: { id }, data: updateData });
                    console.log(`Sipariş ${id} ana verisi güncellendi.`);

                    // Güncellenmiş siparişi döndür
                    return tx.siparis.findUnique({ where: { id }, include: { kalemler: true } });
                }
                // return null; // Buraya ulaşmaması lazım
            }); // Transaction sonu

            console.log(`Sipariş ${id} başarıyla güncellendi.`);
            return res.status(200).json(guncellenenSiparis);

        } catch (error) { /* ... önceki hata yönetimi aynı ... */ }
    }

    // --- DELETE Metodu ---
    if (req.method === 'DELETE') { /* ... */ }

    // Desteklenmeyen metot
    console.log(`Desteklenmeyen metot: ${req.method} for /api/siparis/${id}`);
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
