// pages/api/siparis/index.js
// Bu dosya YENİ siparişleri oluşturmak (POST) içindir.

import prisma from '../../../lib/prisma'; // Prisma Client import yolunu kontrol et
import { Prisma } from '@prisma/client';
import { withRBAC, PERMISSIONS } from '../../../lib/rbac'; // Hata tipleri için import
import { calculateOrderItemPrice } from '../../../lib/fiyat'; // Yeni fiyatlandırma sistemi

// Safe imports - fallback to no-op functions if not available
let notifyNewOrder = (data) => {
    console.log('🔔 Real-time notification (fallback):', data?.orderId || 'unknown');
};
let notifyOrderUpdate = (orderId, data) => {
    console.log('📱 Order update notification (fallback):', orderId);
};
let auditLogger = {
    orderCreated: (id, userId, amount) => {
        console.log(`📋 Audit Log: Order ${id} created by ${userId}, amount: ${amount}`);
    },
    orderStatusChanged: (id, status) => {
        console.log(`📋 Audit Log: Order ${id} status changed to ${status}`);
    }
};

// Socket.IO will be implemented later when needed
console.log('⚠️ Socket.IO real-time features are disabled - using fallback logging');

// Simple performance monitor for this API
const simplePerformanceMonitor = (handler) => {
    return async (req, res) => {
        const start = Date.now();
        try {
            const result = await handler(req, res);
            const duration = Date.now() - start;
            console.log(`API ${req.url} took ${duration}ms`);
            return result;
        } catch (error) {
            const duration = Date.now() - start;
            console.log(`API ${req.url} failed after ${duration}ms:`, error.message);
            throw error;
        }
    };
};

// Yardımcı fonksiyon: Yeni fiyatlandırma sistemini kullanır
async function calculateOrderPrice(urunId, miktar, birim, tarih) {
    const result = await calculateOrderItemPrice(urunId, miktar, birim, tarih);
    return result;
}

// Yardımcı fonksiyon: Tepsi/Tava fiyatını bulur
async function getTepsiTavaPrice(tx, tepsiTavaId) { // tx parametresi eklendi
    if (!tepsiTavaId) return 0;
    // schema.prisma'da TepsiTava modelinde 'fiyat' alanı olduğundan emin ol!
    const tepsi = await tx.tepsiTava.findUnique({ // tx kullanıldı
        where: { id: tepsiTavaId },
        select: { fiyat: true }
    });
    return tepsi?.fiyat || 0;
}

// Yardımcı fonksiyon: Özel tepsi içeriğini sipariş kalemleri olarak hazırla
async function getOzelTepsiKalemleri(tx, ozelTepsiId) {
    const ozelTepsi = await tx.ozelTepsi.findUnique({
        where: { id: ozelTepsiId },
        include: {
            icindekiler: {
                include: { urun: true }
            }
        }
    });

    if (!ozelTepsi) {
        throw new Error('Özel tepsi bulunamadı');
    }

    // Her ürün için sipariş kalemi oluştur (ambalaj sistemi kaldırıldı)
    return ozelTepsi.icindekiler.map(icerik => ({
        urunId: icerik.urunId,
        miktar: icerik.miktar,
        birim: 'KG'
    }));
}

// Sipariş toplam tutarını hesapla (KDV DAHİL)
function calculateOrderTotal(siparisKalemleri, toplamTepsiMaliyeti, kargoUcreti, digerHizmetTutari) {
    const urunToplami = siparisKalemleri.reduce((total, kalem) => {
        // toplamTutar KDV dahil toplam değerdir
        const kalemTutari = kalem.toplamTutar || 0;
        return total + kalemTutari;
    }, 0);

    return urunToplami + (toplamTepsiMaliyeti || 0) + (kargoUcreti || 0) + (digerHizmetTutari || 0);
}

async function handlePost(req, res) {
    console.log('POST /api/siparis isteği alındı. Body:', JSON.stringify(req.body, null, 2));
    const {
        tarih,
        teslimatTuruId,
        subeId,
        gonderenTipiId,
        gonderenAdi,
        gonderenTel,
        aliciAdi,
        aliciTel,
        adres,
        aciklama,
        siparisler,
        ozelTepsiId,
        gorunecekAd,
        kargoUcreti: kargoUcretiStr,
        digerHizmetTutari: digerHizmetTutariStr
    } = req.body;

    if (!tarih || !teslimatTuruId || !gonderenAdi || !gonderenTel ||
        (!siparisler && !ozelTepsiId) ||
        (siparisler && !Array.isArray(siparisler)) ||
        (siparisler && siparisler.length === 0 && !ozelTepsiId)) {
        console.error('Eksik veya geçersiz veri:', { tarih, teslimatTuruId, gonderenAdi, gonderenTel, siparisler, ozelTepsiId });
        return res.status(400).json({ message: 'Eksik veya geçersiz veri. Lütfen tüm zorunlu alanları kontrol edin.' });
    }

    const siparisTarihi = new Date(tarih);
    if (isNaN(siparisTarihi.getTime())) {
        return res.status(400).json({ message: 'Geçersiz sipariş tarihi formatı.' });
    }
    siparisTarihi.setHours(0, 0, 0, 0); // Sadece tarih kısmı

    const teslimatTuru = await prisma.teslimatTuru.findUnique({ where: { id: parseInt(teslimatTuruId) } });
    let kargoDurumuToSet = 'ADRESE_TESLIMAT'; // Varsayılan değer

    if (teslimatTuru) {
        switch (teslimatTuru.kodu) {
            case 'TT001': // Evine Gönderilecek
            case 'TT003': // MTN Kargo
            case 'TT004': // Otobüs
            case 'TT006': // Yurtiçi Kargo
                kargoDurumuToSet = 'KARGOYA_VERILECEK';
                break;
            case 'TT002': // Şubeden Alacak
                kargoDurumuToSet = 'SUBEDE_TESLIM';
                break;
            case 'TT007': // Şubeye Gönderilecek
                kargoDurumuToSet = 'SUBEYE_GONDERILECEK';
                break;
            default:
                kargoDurumuToSet = 'ADRESE_TESLIMAT'; // Bilinmeyen durumlar için varsayılan
        }
    }

    try {
        const yeniSiparis = await prisma.$transaction(async (tx) => {
            let siparisKalemleri = [];

            // Eğer özel tepsi seçildiyse, onun içeriğini al
            if (ozelTepsiId) {
                siparisKalemleri = await getOzelTepsiKalemleri(tx, parseInt(ozelTepsiId));
            }

            // Normal siparişleri ekle (eğer varsa)
            if (siparisler && siparisler.length > 0) {
                siparisKalemleri = [...siparisKalemleri, ...siparisler];
            }

            // 1. Toplam Tepsi/Tava Maliyetini Hesapla
            let hesaplananToplamTepsiMaliyeti = 0;
            const tepsiTavaIds = siparisKalemleri
                .map(pkg => pkg.tepsiTavaId) // Gelen payload'daki anahtar adı büyük harfle başlıyor olabilir
                .filter(id => id != null)
                .map(id => parseInt(id));

            if (tepsiTavaIds.length > 0) {
                // ID'lerin geçerli olup olmadığını kontrol et (opsiyonel ama iyi pratik)
                const validTepsiler = await tx.tepsiTava.findMany({
                    where: { id: { in: tepsiTavaIds } },
                    select: { id: true, fiyat: true }
                });
                const validTepsiMap = validTepsiler.reduce((map, tepsi) => {
                    map[tepsi.id] = tepsi.fiyat || 0;
                    return map;
                }, {});

                siparisKalemleri.forEach(paket => {
                    if (paket.tepsiTavaId && validTepsiMap[paket.tepsiTavaId] !== undefined) {
                        hesaplananToplamTepsiMaliyeti += validTepsiMap[paket.tepsiTavaId];
                    }
                });
            }
            console.log("Hesaplanan Toplam Tepsi Maliyeti:", hesaplananToplamTepsiMaliyeti);

            // 2. Ana Sipariş kaydını oluştur
            const olusturulanSiparis = await tx.siparis.create({
                data: {
                    tarih: siparisTarihi,
                    teslimatTuruId: parseInt(teslimatTuruId),
                    subeId: subeId ? parseInt(subeId) : null,
                    // gonderenTipiId alanı schema'da yok, bu sadece frontend UI logic için kullanılıyor
                    gonderenAdi,
                    gonderenTel,
                    aliciAdi: aliciAdi || null,
                    aliciTel: aliciTel || null,
                    teslimatAdresi: adres || null,  // schema'da adres değil teslimatAdresi var
                    siparisNotu: aciklama || null,  // schema'da aciklama değil siparisNotu var
                    // gorunecekAd alanı schema'da yok - kaldırıldı
                    // toplamTepsiMaliyeti alanı schema'da yok - kaldırıldı  
                    kargoUcreti: kargoUcretiStr ? parseFloat(kargoUcretiStr) : 0,
                    digerHizmetTutari: digerHizmetTutariStr ? parseFloat(digerHizmetTutariStr) : 0,
                    kargoDurumu: kargoDurumuToSet, // Düzeltilmiş enum değeri
                    // onaylandiMi varsayılan olarak false olacak
                },
            });
            console.log(`Ana sipariş oluşturuldu: ID ${olusturulanSiparis.id}`);

            // 3. Sipariş Kalemlerini Oluştur (Birim Fiyatlarını Hesaplayarak)
            let toplamEklenenKalem = 0;
            const processedKalemler = [];

            for (const kalem of siparisKalemleri) {
                if (!kalem.urunId || !kalem.miktar || !kalem.birim) {
                    console.warn(`Sipariş ${olusturulanSiparis.id}, Kalem (Ambalaj ID: ${kalem.ambalajId}) içinde eksik ürün bilgisi atlandı:`, kalem);
                    continue; // Eksik bilgili ürünü atla
                }

                const urunId = parseInt(kalem.urunId);
                const birim = kalem.birim.toUpperCase();
                const miktar = parseFloat(kalem.miktar);

                // Ürün bilgisini al (ad ve kod için)
                const urun = await tx.urun.findUnique({
                    where: { id: urunId },
                    select: { ad: true, kod: true }
                });

                if (!urun) {
                    console.warn(`Ürün bulunamadı: urunId=${urunId}`);
                    continue; // Bu kalemi atla
                }

                // Yeni fiyatlandırma sistemi kullan - KDV dahil
                const priceResult = await calculateOrderPrice(urunId, miktar, birim, siparisTarihi);
                const birimFiyat = priceResult.birimFiyat;
                const araToplam = priceResult.araToplam;
                const kdvOrani = priceResult.kdvOrani;
                const kdvTutari = priceResult.kdvTutari;
                const iskonto = 0; // Şimdilik iskonto yok
                const toplamTutar = priceResult.toplamFiyat - iskonto;

                if (birimFiyat === 0) {
                    console.warn(`!!! Fiyat bulunamadı: urunId=${urunId}, birim=${birim}, tarih=${siparisTarihi.toISOString().split('T')[0]}`);
                }

                const siparisKalemi = {
                    siparisId: olusturulanSiparis.id,
                    urunId: urunId,
                    urunAdi: urun.ad,
                    urunKodu: urun.kod,
                    miktar: miktar,
                    birim: birim,
                    birimFiyat: birimFiyat,
                    kdvOrani: kdvOrani,
                    iskonto: iskonto,
                    araToplam: araToplam,
                    kdvTutari: kdvTutari,
                    toplamTutar: toplamTutar,
                    kutuId: kalem.kutuId ? parseInt(kalem.kutuId) : null,
                    tepsiTavaId: kalem.tepsiTavaId ? parseInt(kalem.tepsiTavaId) : null,
                };

                console.log(`Sipariş ${olusturulanSiparis.id} için kalem ekleniyor:`, siparisKalemi);
                const createdKalem = await tx.siparisKalemi.create({ data: siparisKalemi });
                processedKalemler.push(createdKalem);
                toplamEklenenKalem++;
            }

            if (toplamEklenenKalem === 0) { throw new Error("Siparişe eklenecek geçerli ürün bulunamadı."); }

            // Sipariş toplamlarını hesapla ve güncelle
            const araToplam = processedKalemler.reduce((sum, kalem) => sum + parseFloat(kalem.araToplam || 0), 0);
            const kdvToplam = processedKalemler.reduce((sum, kalem) => sum + parseFloat(kalem.kdvTutari || 0), 0);
            const kargoUcretiFloat = parseFloat(kargoUcretiStr || 0);
            const digerHizmetTutariFloat = parseFloat(digerHizmetTutariStr || 0);

            const toplamTutar = araToplam + kdvToplam + hesaplananToplamTepsiMaliyeti + kargoUcretiFloat + digerHizmetTutariFloat;

            await tx.siparis.update({
                where: { id: olusturulanSiparis.id },
                data: {
                    araToplam: araToplam,
                    kdvToplam: kdvToplam,
                    toplamTutar: toplamTutar
                }
            });

            // Sonuç olarak güncellenmiş siparişi döndür (kalemler dahil)
            return tx.siparis.findUnique({
                where: { id: olusturulanSiparis.id },
                include: {
                    kalemler: {
                        include: {
                            urun: true,
                            tepsiTava: true,
                            kutu: true
                        }
                    },
                    teslimatTuru: true,
                    sube: true
                } // Kalemleri de yanıta ekle
            });
        }); // Transaction sonu

        // Audit log
        auditLogger.orderCreated(yeniSiparis.id, req.user?.id || null, yeniSiparis.toplamTutar);

        // Real-time notification
        notifyNewOrder({
            orderId: yeniSiparis.id,
            customerName: yeniSiparis.gonderenAdi,
            amount: yeniSiparis.toplamTutar,
            status: 'pending',
            delivery: yeniSiparis.teslimatTuru?.ad
        });

        console.log('Sipariş başarıyla kaydedildi:', yeniSiparis);
        return res.status(201).json(yeniSiparis);

    } catch (error) {
        console.error('❌ POST /api/siparis HATA:', error);
        let errorMessage = 'Sipariş oluşturulurken bir sunucu hatası oluştu.';
        // ... (Diğer hata kontrolleri aynı) ...
        if (error.message.includes("geçerli ürün bulunamadı")) { errorMessage = error.message; }
        else if (error instanceof Prisma.PrismaClientValidationError) { errorMessage = 'Veri doğrulama hatası.'; }
        else if (error instanceof Prisma.PrismaClientKnownRequestError) { errorMessage = `Veritabanı hatası: ${error.code}.`; }
        return res.status(500).json({ message: errorMessage });
    }
}

async function handleGet(req, res) {
    try {
        const where = {};
        if (req.query.kargoDurumu) {
            where.kargoDurumu = req.query.kargoDurumu;
        }
        if (req.query.onaylandiMi !== undefined) {
            where.onaylandiMi = req.query.onaylandiMi === 'true';
        }
        if (req.query.hazirlanmaDurumu) {
            where.hazirlanmaDurumu = req.query.hazirlanmaDurumu;
        }

        const siparisler = await prisma.siparis.findMany({
            where,
            orderBy: { tarih: 'desc' },
            include: {
                teslimatTuru: { select: { ad: true, kodu: true } },
                sube: true,
                gonderenAliciTipi: true,
                kalemler: { include: { urun: true, tepsiTava: true, kutu: true } },
                odemeler: true,
            },
        });
        res.status(200).json(siparisler);
    } catch (err) {
        res.status(500).json({ message: 'Siparişler alınamadı', error: err.message });
    }
}

async function handler(req, res) {
    // CORS ve OPTIONS Handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Sadece GET, POST ve OPTIONS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS /api/siparis isteği yanıtlandı.');
        return res.status(200).end();
    }

    // Performance monitoring wrap
    return simplePerformanceMonitor(async (req, res) => {
        if (req.method === 'POST') {
            return handlePost(req, res);
        } else if (req.method === 'GET') {
            return handleGet(req, res);
        } else {
            console.log(`Desteklenmeyen metot: ${req.method} for /api/siparis`);
            res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
            return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
        }
    })(req, res);
}

// Export with RBAC protection
export default withRBAC(handler, {
    permission: PERMISSIONS.VIEW_ORDERS // Base permission, specific methods will be checked inside
});
