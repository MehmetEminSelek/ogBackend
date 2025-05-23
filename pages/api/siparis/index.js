// pages/api/siparis/index.js
// Bu dosya YENİ siparişleri oluşturmak (POST) içindir.

import prisma from '../../../lib/prisma'; // Prisma Client import yolunu kontrol et
import { Prisma } from '@prisma/client'; // Hata tipleri için import

// Yardımcı fonksiyon: Belirli bir tarih için ürün fiyatını bulur
async function getPriceForDate(tx, urunId, birim, tarih) { // tx parametresi eklendi
    if (!urunId || !birim || !tarih) return 0;
    // Birim KG ise KG fiyatını, değilse Adet fiyatını ara
    const targetBirim = birim.toLowerCase() === 'gram' ? 'KG' : birim; // Gram için KG fiyatı aranacak

    const fiyatKaydi = await tx.fiyat.findFirst({ // tx kullanıldı
        where: {
            urunId: urunId,
            birim: targetBirim, // KG veya Adet olarak ara
            gecerliTarih: { lte: tarih },
            // Bitiş tarihi kontrolü (şemada varsa)
            OR: [
                { bitisTarihi: null }, // Bitiş tarihi yoksa hala geçerlidir
                { bitisTarihi: { gte: tarih } } // Veya bitiş tarihi sorgu tarihine eşit veya sonra olmalı
            ]
        },
        orderBy: { gecerliTarih: 'desc' }, // En güncel geçerli fiyatı bul
    });
    console.log(`Fiyat sorgusu: urunId=${urunId}, birim=${targetBirim}, tarih=${tarih.toISOString().split('T')[0]}, bulunanFiyat=${fiyatKaydi?.fiyat}`);
    // Bulunan KG veya Adet fiyatını döndür
    return fiyatKaydi?.fiyat || 0;
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

    // Her ürün için varsayılan ambalaj bul (ilk ambalajı kullan)
    const varsayilanAmbalaj = await tx.ambalaj.findFirst({
        orderBy: { id: 'asc' }
    });

    if (!varsayilanAmbalaj) {
        throw new Error('Varsayılan ambalaj bulunamadı');
    }

    // Her ürün için sipariş kalemi oluştur
    return ozelTepsi.icindekiler.map(icerik => ({
        ambalajId: varsayilanAmbalaj.id,
        urunId: icerik.urunId,
        miktar: icerik.miktar,
        birim: 'KG'
    }));
}

export default async function handler(req, res) {
    // CORS ve OPTIONS Handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS'); // Sadece POST ve OPTIONS
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS /api/siparis isteği yanıtlandı.');
        return res.status(200).end();
    }

    // --- YENİ SİPARİŞ OLUŞTURMA (POST) ---
    if (req.method === 'POST') {
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
        let kargoDurumuToSet = null;
        if (teslimatTuru) {
            if (teslimatTuru.kodu === 'TT007') {
                kargoDurumuToSet = 'Şubeye Gönderilecek';
            } else if (['TT001', 'TT003', 'TT004', 'TT006'].includes(teslimatTuru.kodu)) {
                kargoDurumuToSet = 'Kargoya Verilecek';
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
                        gonderenTipiId: gonderenTipiId ? parseInt(gonderenTipiId) : null,
                        gonderenAdi,
                        gonderenTel,
                        aliciAdi: aliciAdi || null,
                        aliciTel: aliciTel || null,
                        adres: adres || null,
                        aciklama: aciklama || null,
                        gorunecekAd: gorunecekAd || null,
                        toplamTepsiMaliyeti: hesaplananToplamTepsiMaliyeti,
                        kargoUcreti: kargoUcretiStr ? parseFloat(kargoUcretiStr) : 0,
                        digerHizmetTutari: digerHizmetTutariStr ? parseFloat(digerHizmetTutariStr) : 0,
                        kargoDurumu: kargoDurumuToSet,
                        // onaylandiMi varsayılan olarak false olacak
                    },
                });
                console.log(`Ana sipariş oluşturuldu: ID ${olusturulanSiparis.id}`);

                // 3. Sipariş Kalemlerini Oluştur (Birim Fiyatlarını Hesaplayarak)
                let toplamEklenenKalem = 0;
                for (const kalem of siparisKalemleri) {
                    if (!kalem.urunId || !kalem.miktar || !kalem.birim) {
                        console.warn(`Sipariş ${olusturulanSiparis.id}, Kalem (Ambalaj ID: ${kalem.ambalajId}) içinde eksik ürün bilgisi atlandı:`, kalem);
                        continue; // Eksik bilgili ürünü atla
                    }

                    const urunId = parseInt(kalem.urunId);
                    const birim = kalem.birim; // Frontend'den gelen birim (Gram, Adet vb.)
                    const miktar = parseFloat(kalem.miktar);

                    // O anki geçerli birim fiyatı (KG veya Adet) bul
                    // Gram için KG fiyatı, Adet için Adet fiyatı aranacak
                    const fiyatBirim = birim.toLowerCase() === 'gram' ? 'KG' : birim;
                    const birimFiyat = await getPriceForDate(tx, urunId, fiyatBirim, siparisTarihi);

                    if (birimFiyat === 0) {
                        console.warn(`!!! Fiyat bulunamadı: urunId=${urunId}, birim=${fiyatBirim}, tarih=${siparisTarihi.toISOString().split('T')[0]}`);
                        // Fiyat bulunamazsa ne yapılacağına karar verilmeli.
                        // Şimdilik 0 olarak kaydediyoruz ama belki hata vermek daha iyi olabilir.
                    }

                    const siparisKalemi = {
                        siparisId: olusturulanSiparis.id,
                        ambalajId: parseInt(kalem.ambalajId),
                        urunId: urunId,
                        miktar: miktar,
                        birim: birim, // Frontend'den gelen orijinal birimi kaydet (Gram, Adet vb.)
                        birimFiyat: birimFiyat, // <<< Hesaplanan/Bulunan KG veya Adet fiyatını kaydet
                        kutuId: kalem.kutuId ? parseInt(kalem.kutuId) : null,
                        tepsiTavaId: kalem.tepsiTavaId ? parseInt(kalem.tepsiTavaId) : null,
                    };

                    console.log(`Sipariş ${olusturulanSiparis.id} için kalem ekleniyor:`, siparisKalemi);
                    await tx.siparisKalemi.create({ data: siparisKalemi });
                    toplamEklenenKalem++;
                }

                if (toplamEklenenKalem === 0) { throw new Error("Siparişe eklenecek geçerli ürün bulunamadı."); }

                // Sonuç olarak güncellenmiş siparişi döndür (kalemler dahil)
                return tx.siparis.findUnique({
                    where: { id: olusturulanSiparis.id },
                    include: { kalemler: true } // Kalemleri de yanıta ekle
                });
            }); // Transaction sonu

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

    // GET /api/siparis endpointine kargoDurumu ile filtreleme özelliği ekliyorum.
    if (req.method === 'GET') {
        try {
            const where = {};
            if (req.query.kargoDurumu) {
                where.kargoDurumu = req.query.kargoDurumu;
            }
            // Diğer filtreler (ör: status, subeId, tarih, vs.)
            // ... mevcut filtre kodları ...
            const siparisler = await prisma.siparis.findMany({
                where,
                orderBy: { tarih: 'desc' },
                include: {
                    teslimatTuru: { select: { ad: true, kodu: true } },
                    sube: true,
                    gonderenAliciTipi: true,
                    kalemler: { include: { urun: true, ambalaj: true, tepsiTava: true, kutu: true } },
                    odemeler: true,
                },
            });
            res.status(200).json(siparisler);
        } catch (err) {
            res.status(500).json({ message: 'Siparişler alınamadı', error: err.message });
        }
    }

    // Desteklenmeyen metot
    console.log(`Desteklenmeyen metot: ${req.method} for /api/siparis`);
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
