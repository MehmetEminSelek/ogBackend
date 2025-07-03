// pages/api/siparis/[id].js
import prisma from '../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { calculateOrderItemPrice } from '../../../lib/fiyat'; // Yeni fiyatlandırma sistemi

// Helper fonksiyonlar - YENİ FİYATLANDIRMA SİSTEMİ
async function getPriceForDate(tx, urunId, birim, tarih) {
    // Yeni merkezi fiyatlandırma sistemini kullan
    const result = await calculateOrderItemPrice(urunId, 1, birim, tarih);
    return result.birimFiyat;
}
async function getTepsiTavaPrice(tx, tepsiTavaId) {
    if (!tepsiTavaId) return 0;
    const tepsi = await tx.tepsiTava.findUnique({ where: { id: tepsiTavaId }, select: { fiyat: true } });
    return tepsi?.fiyat || 0;
}

// Helper: Stoktan düşüm fonksiyonu
async function dusStokFromRecete(tx, siparisId) {
    // 1. Sipariş ve kalemlerini çek
    const siparis = await tx.siparis.findUnique({
        where: { id: siparisId },
        include: { kalemler: { include: { urun: true } } }
    });
    if (!siparis) throw new Error('Sipariş bulunamadı');

    // OperasyonBirimi kontrolü kaldırıldı - Material modelini direkt kullanıyoruz

    // 2. Daha önce stok düşümü yapılmış mı kontrolü
    if (siparis.siparisNotu && siparis.siparisNotu.includes('[STOK DÜŞÜLDÜ]')) {
        throw new Error('Bu sipariş için daha önce stok düşümü yapılmış');
    }

    const stokHatalari = [];

    // 3. Her kalem için reçeteyi bul ve stoktan düş
    for (const kalem of siparis.kalemler) {
        // Ürünle ilişkili reçeteyi bul
        const recipe = await tx.recipe.findFirst({
            where: { urunId: kalem.urun.id },
            include: {
                icerikelek: {
                    include: {
                        material: true
                    }
                }
            }
        });

        if (!recipe) {
            stokHatalari.push(`Ürün ${kalem.urun.ad} için reçete bulunamadı`);
            continue;
        }

        // Sipariş miktarını kilogram cinsine çevir
        const siparisKg = kalem.birim.toLowerCase() === 'gram' ?
            kalem.miktar / 1000 : // gram -> kg
            kalem.miktar; // zaten kg

        for (const ing of recipe.icerikelek) {  // Schema'da ingredients değil icerikelek
            // Material modelini kullan (Schema'da hammadde/yariMamul yok)
            const material = await tx.material.findUnique({ where: { kod: ing.material.kod } });

            // Reçetedeki miktar gram, sipariş kg cinsinden. Toplam düşülecek miktarı hesapla
            const dusulecekGram = ing.miktar * siparisKg; // Schema'da miktarGram değil miktar

            if (material) {
                console.log(`${material.ad} için ${dusulecekGram}g stok düşülecek`);
                // Material modelinde stok direkt mevcutStok alanında
                if (material.mevcutStok < dusulecekGram) {
                    stokHatalari.push(
                        `${material.ad} için yetersiz stok. Gereken: ${dusulecekGram}g, Mevcut: ${material.mevcutStok}g`
                    );
                } else {
                    // Material tablosundaki mevcutStok alanını güncelle
                    await tx.material.update({
                        where: { id: material.id },
                        data: { mevcutStok: { decrement: dusulecekGram } }
                    });
                }
            } else {
                stokHatalari.push(`${ing.material.kod} kodlu malzeme bulunamadı`);
            }
        }
    }

    // Eğer herhangi bir hata varsa işlemi iptal et
    if (stokHatalari.length > 0) {
        throw new Error('Stok düşme işlemi başarısız:\n' + stokHatalari.join('\n'));
    }

    // 4. Sipariş açıklamasına işaret ekle
    await tx.siparis.update({
        where: { id: siparisId },
        data: { siparisNotu: (siparis.siparisNotu || '') + ' [STOK DÜŞÜLDÜ]' }
    });
}

export default async function handler(req, res) {
    // CORS, OPTIONS, ID kontrolü...
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { return res.status(200).end(); }
    const idQueryParam = req.query.id;
    const id = parseInt(idQueryParam);
    if (isNaN(id)) { return res.status(400).json({ message: 'Geçersiz Sipariş ID.' }); }


    // --- GET ve DELETE metodları ---
    if (req.method === 'GET') {
        try {
            console.log(`GET /api/siparis/${id} isteği alındı.`);
            const siparis = await prisma.siparis.findUnique({
                where: { id },
                include: { // İlişkili verileri detaylı olarak dahil et
                    teslimatTuru: { select: { ad: true } },
                    sube: { select: { ad: true } },
                    // gonderenAliciTipi: { select: { ad: true } }, // Schema'da yok
                    odemeler: true, // Ödemeleri dahil et
                    kalemler: {
                        orderBy: { id: 'asc' },
                        select: { // Kalem detaylarını seç
                            id: true, miktar: true, birim: true, birimFiyat: true,
                            urun: { select: { id: true, ad: true } },
                            ambalaj: { select: { id: true, ad: true } },
                            kutu: { select: { id: true, ad: true } },
                            tepsiTava: { select: { id: true, ad: true, fiyat: true } } // Tepsi fiyatını da al
                        }
                    }
                }
            });
            if (!siparis) { return res.status(404).json({ message: 'Sipariş bulunamadı.' }); }
            console.log(`Sipariş ${id} detayları başarıyla getirildi.`);
            return res.status(200).json(siparis);
        } catch (error) {
            console.error(`❌ GET /api/siparis/${id} HATA:`, error);
            return res.status(500).json({ message: 'Sipariş getirilirken hata oluştu.', error: error.message });
        }
    }

    // --- SİPARİŞ SİLME (DELETE) ---
    if (req.method === 'DELETE') {
        try {
            console.log(`DELETE /api/siparis/${id} isteği alındı.`);
            // İlişkili kalemler ve ödemeler onDelete: Cascade ile otomatik silinmeli (şemayı kontrol et)
            await prisma.siparis.delete({ where: { id } });
            console.log(`Sipariş ${id} başarıyla silindi.`);
            return res.status(204).end(); // Başarılı silme sonrası içerik yok
        } catch (error) {
            console.error(`❌ DELETE /api/siparis/${id} HATA:`, error);
            let statusCode = 500;
            let errorMessage = 'Sipariş silinirken bir hata oluştu.';
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                statusCode = 404; errorMessage = 'Silinecek sipariş bulunamadı.';
            }
            return res.status(statusCode).json({ message: errorMessage, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }

    if (req.method === 'PUT') {
        console.log(`PUT /api/siparis/${id} isteği alındı. Body:`, JSON.stringify(req.body, null, 2));
        const { onaylandiMi, kalemler, hazirlanmaDurumu, kargoUcreti, digerHizmetTutari } = req.body;

        try {
            // Flag'leri tanımla
            const isApprovalUpdate = typeof onaylandiMi === 'boolean';
            const isPreparationUpdate = hazirlanmaDurumu === "Hazırlandı";
            const isItemsUpdate = Array.isArray(kalemler);
            const isExtraChargesUpdate = typeof kargoUcreti === 'number' || typeof digerHizmetTutari === 'number';

            // <<< DÜZELTİLMİŞ KONTROL: Geçerli kombinasyonları kontrol et >>>
            const isValid =
                // Senaryo 1: Sadece Onay
                (isApprovalUpdate && !isItemsUpdate && !isPreparationUpdate && !isExtraChargesUpdate) ||
                // Senaryo 2: Sadece Ekstra Ücret
                (isExtraChargesUpdate && !isApprovalUpdate && !isItemsUpdate && !isPreparationUpdate) ||
                // Senaryo 3: Sadece Kalemler (Onay sayfasından)
                (isItemsUpdate && !isApprovalUpdate && !isPreparationUpdate && !isExtraChargesUpdate) ||
                // Senaryo 4: Kalemler + Hazırlandı (Hazırlanacaklar sayfasından)
                (isItemsUpdate && isPreparationUpdate && !isApprovalUpdate && !isExtraChargesUpdate) ||
                // Senaryo 5: Kalemler + Onay (Onay sayfasındaki birleşik buton) <<< YENİ İZİN >>>
                (isItemsUpdate && isApprovalUpdate && !isPreparationUpdate && !isExtraChargesUpdate);

            if (!isValid) {
                console.error("Geçersiz güncelleme kombinasyonu:", req.body);
                return res.status(400).json({ message: "Geçersiz güncelleme kombinasyonu." });
            }
            // <<< KONTROL SONU >>>


            const guncellenenSiparis = await prisma.$transaction(async (tx) => {
                const mevcutSiparis = await tx.siparis.findUnique({ where: { id }, select: { tarih: true } });
                if (!mevcutSiparis) { throw new Error('P2025'); }
                // const siparisTarihi = mevcutSiparis.tarih; // Fiyat hesaplaması burada yapılmıyor

                let updatedSiparisResult;
                const updateDataSiparis = { updatedAt: new Date() }; // Güncellenecek ana sipariş verisi

                // --- Kalemleri Güncelle (Eğer geldiyse) ---
                if (isItemsUpdate) {
                    console.log(`Sipariş ${id} kalemleri güncelleniyor...`);
                    if (!kalemler) { throw new Error("Kalem bilgileri eksik."); }

                    const mevcutKalemler = await tx.siparisKalemi.findMany({ where: { siparisId: id }, select: { id: true } });
                    const mevcutKalemIds = mevcutKalemler.map(k => k.id);
                    const updatePromises = [];
                    const gelenKalemIdleri = new Set();

                    for (const kalem of kalemler) {
                        const kalemId = parseInt(kalem.id);
                        const yeniMiktar = parseFloat(kalem.miktar);
                        if (isNaN(kalemId) || kalemId <= 0 || isNaN(yeniMiktar) || yeniMiktar < 0) {
                            console.warn(`Geçersiz kalem verisi atlanıyor (ID: ${kalem.id}, Miktar: ${kalem.miktar})`);
                            continue;
                        }
                        gelenKalemIdleri.add(kalemId);
                        updatePromises.push(tx.siparisKalemi.updateMany({ where: { id: kalemId, siparisId: id }, data: { miktar: yeniMiktar } }));
                    }

                    // Silinecek kalemleri bul ve sil (Sadece kalem güncelleme senaryosunda)
                    let deletePromise = Promise.resolve();
                    // <<< DÜZELTME: Sadece isItemsOnlyUpdate değil, isPreparationUpdate durumunda da silme OLMAMALI >>>
                    // Silme işlemi sadece Onay Bekleyenler sayfasındaki "İçeriği Düzenle" -> "Kaydet" ile yapılmalı.
                    // Hazırlanacaklar sayfasındaki "Kaydet ve Hazırlandı" silme yapmamalı.
                    // Onay sayfasındaki "Kabul et ve Onayla" da silme yapmamalı.
                    // Bu yüzden silme mantığını şimdilik tamamen kaldıralım veya ayrı bir endpoint'e taşıyalım.
                    /*
                    if (isItemsOnlyUpdate) { // Bu kontrol yeterli değil
                         const silinecekKalemIdleri = mevcutKalemIds.filter(mevcutId => !gelenKalemIdleri.has(mevcutId));
                         if (silinecekKalemIdleri.length > 0) {
                             console.log(`Sipariş ${id} için ${silinecekKalemIdleri.length} kalem siliniyor... ID'ler:`, silinecekKalemIdleri);
                             deletePromise = tx.siparisKalemi.deleteMany({ where: { id: { in: silinecekKalemIdleri } } });
                         } else { console.log(`Sipariş ${id} için silinecek kalem bulunamadı.`); }
                    }
                    */

                    await Promise.all([...updatePromises /*, deletePromise */]); // deletePromise kaldırıldı
                    console.log(`Sipariş ${id} için kalem işlemleri tamamlandı (güncelleme).`);

                    // Tepsi maliyetini yeniden hesapla (şimdilik devre dışı - schema'da alan yok)
                    // let yeniToplamTepsiMaliyeti = 0;
                    // const guncelKalemlerDb = await tx.siparisKalemi.findMany({ where: { siparisId: id }, select: { tepsiTavaId: true } }); 
                    // const guncelTepsiIdsFromDb = guncelKalemlerDb.map(k => k.tepsiTavaId).filter(id => id != null);
                    // if (guncelTepsiIdsFromDb.length > 0) {
                    //     const tepsiFiyatlari = await Promise.all([...new Set(guncelTepsiIdsFromDb)].map(id => getTepsiTavaPrice(tx, id)));
                    //     yeniToplamTepsiMaliyeti = tepsiFiyatlari.reduce((sum, price) => sum + price, 0);
                    // }
                    // updateDataSiparis.toplamTepsiMaliyeti = yeniToplamTepsiMaliyeti;  // Schema'da yok
                    console.log("Kalemler güncellendi");
                }

                // --- Durumları Güncelle (Eğer geldiyse) ---
                if (isApprovalUpdate) {
                    console.log(`Sipariş ${id} onay durumu güncelleniyor: ${onaylandiMi}`);
                    // Schema'da onaylandiMi yok, durum enum'u kullan
                    if (onaylandiMi === true) {
                        updateDataSiparis.durum = "HAZIRLLANACAK"; // Onaylanınca Hazırlanacak'a çek
                    } else {
                        updateDataSiparis.durum = "ONAY_BEKLEYEN"; // Onay bekleniyor
                    }
                }
                if (isPreparationUpdate) {
                    console.log(`Sipariş ${id} hazırlanma durumu güncelleniyor: ${hazirlanmaDurumu}`);
                    // Schema'da hazirlanmaDurumu yok, durum enum'u kullan
                    updateDataSiparis.durum = "HAZIRLANDI"; // Hazırlandı durumuna çek
                    // Stoktan düşüm (geçici olarak devre dışı - modeller eksik olabilir)
                    try {
                        await dusStokFromRecete(tx, id);
                    } catch (stockError) {
                        console.warn(`Stok düşümü yapılamadı (${id}):`, stockError.message);
                        // Stok hatası varsa da devam et, sadece durum güncellemesi yap
                    }
                }
                if (isExtraChargesUpdate) {
                    console.log(`Sipariş ${id} kargo/diğer ücret güncelleniyor...`);
                    if (typeof kargoUcreti === 'number' && kargoUcreti >= 0) updateDataSiparis.kargoUcreti = kargoUcreti;
                    if (typeof digerHizmetTutari === 'number' && digerHizmetTutari >= 0) updateDataSiparis.digerHizmetTutari = digerHizmetTutari;
                }

                // Ana siparişi tek seferde güncelle (eğer güncellenecek alan varsa)
                if (Object.keys(updateDataSiparis).length > 1) { // updatedAt dışında değişiklik varsa
                    updatedSiparisResult = await tx.siparis.update({
                        where: { id },
                        data: updateDataSiparis,
                        include: { kalemler: true, odemeler: true }
                    });
                    console.log(`Sipariş ${id} ana verisi güncellendi.`);
                } else if (isItemsUpdate) { // Sadece kalemler güncellendiyse bile sonucu döndür
                    updatedSiparisResult = await tx.siparis.findUnique({ where: { id }, include: { kalemler: true, odemeler: true } });
                } else {
                    // Sadece onaylama veya ekstra ücret durumu (yukarıda handle edildi)
                    // Bu bloğa normalde girilmemeli, ama güvenlik için
                    updatedSiparisResult = await tx.siparis.findUnique({ where: { id }, include: { kalemler: true, odemeler: true } });
                }


                return updatedSiparisResult;

            }); // Transaction sonu

            console.log(`Sipariş ${id} başarıyla güncellendi.`);
            return res.status(200).json(guncellenenSiparis);

        } catch (error) {
            console.error(`❌ PUT /api/siparis/${id} HATA:`, error);
            let statusCode = 500;
            let errorMessage = 'Sipariş güncellenirken bir sunucu hatası oluştu.';
            if (error.message.includes("Geçersiz güncelleme") || error.message.includes("eksik veya geçersiz")) { statusCode = 400; errorMessage = error.message; }
            else if (error instanceof Prisma.PrismaClientKnownRequestError) { if (error.code === 'P2025') { statusCode = 404; errorMessage = 'Güncellenecek sipariş veya kalem bulunamadı.'; } else { errorMessage = `Veritabanı hatası: ${error.code}.`; } }
            else if (error instanceof Prisma.PrismaClientValidationError) { errorMessage = 'Veri doğrulama hatası.'; statusCode = 400; }
            return res.status(statusCode).json({ message: errorMessage, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }
    // Desteklenmeyen metot
    console.log(`Desteklenmeyen metot: ${req.method} for /api/siparis/${id}`);
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
