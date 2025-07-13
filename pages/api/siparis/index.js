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

// Yardımcı fonksiyon: Tepsi/Tava fiyatını bulur - DEVRE DIŞI
async function getTepsiTavaPrice(tx, tepsiTavaId) {
    // Şimdilik tepsi/tava fiyatlandırması devre dışı
    return 0;
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
        kargoUcreti: kargoUcretiStr,
        digerHizmetTutari: digerHizmetTutariStr,
        subeNeredenId,  // Şubeden şubeye transfer için
        subeNereyeId    // Şubeden şubeye transfer için
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
            case 'TT008': // Şubeden Şubeye (nereden-nereye)
                kargoDurumuToSet = 'SUBEDEN_SUBEYE';
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

            // Tepsi/Tava fiyat hesaplamalarını şimdilik devre dışı bırak
            // Yeni fiyatlandırma sistemi henüz tamamen entegre edilmedi
            hesaplananToplamTepsiMaliyeti = 0;
            console.log("Tepsi/Tava fiyatlandırması geçici olarak devre dışı - Toplam: 0");
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
                    kargoUcreti: kargoUcretiStr ? parseFloat(kargoUcretiStr) : 0,
                    digerHizmetTutari: digerHizmetTutariStr ? parseFloat(digerHizmetTutariStr) : 0,
                    kargoDurumu: kargoDurumuToSet, // Düzeltilmiş enum değeri
                    // subeNeredenId ve subeNereyeId geçici olarak devre dışı
                    // onaylandiMi varsayılan olarak false olacak
                },
            });
            console.log(`Ana sipariş oluşturuldu: ID ${olusturulanSiparis.id}`);

            // 3. Sipariş Kalemlerini Oluştur (Birim Fiyatlarını Hesaplayarak)
            let toplamEklenenKalem = 0;
            const processedKalemler = [];

            for (const kalem of siparisKalemleri) {
                if (!kalem.urunId || !kalem.miktar || !kalem.birim) {
                    console.warn(`Sipariş ${olusturulanSiparis.id}, Kalem (Tepsi/Kutu ID: ${kalem.tepsiTavaId || kalem.kutuId}) içinde eksik ürün bilgisi atlandı:`, kalem);
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
                    sube: true,
                    subeNereden: true,  // Nereden şube bilgisi
                    subeNereye: true,   // Nereye şube bilgisi
                    hedefSube: true     // Hedef şube bilgisi
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
        console.error('❌ POST /api/siparis HATA:');
        console.error('Error Message:', error.message);
        console.error('Error Stack:', error.stack);
        console.error('Error Type:', error.constructor.name);
        if (error.code) console.error('Error Code:', error.code);

        let errorMessage = 'Sipariş oluşturulurken bir sunucu hatası oluştu.';

        if (error.message.includes("geçerli ürün bulunamadı")) {
            errorMessage = error.message;
        }
        else if (error instanceof Prisma.PrismaClientValidationError) {
            console.error('Prisma Validation Error Details:', error.message);
            errorMessage = `Veri doğrulama hatası: ${error.message}`;
        }
        else if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error('Prisma Known Error Details:', error.message, error.meta);
            errorMessage = `Veritabanı hatası: ${error.code} - ${error.message}`;
        }
        else {
            console.error('Unexpected Error Details:', error);
            errorMessage = `Beklenmeyen hata: ${error.message}`;
        }

        return res.status(500).json({
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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
                teslimatTuru: true,
                sube: true,
                subeNereden: true,  // Nereden şube bilgisi
                subeNereye: true,   // Nereye şube bilgisi
                hedefSube: true,    // Hedef şube bilgisi
                kalemler: { 
                    include: { 
                        urun: { select: { id: true, ad: true, kod: true } }, 
                        tepsiTava: { select: { id: true, ad: true, kod: true } },
                        kutu: { select: { id: true, ad: true, kod: true } }
                    } 
                },
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
