// pages/api/siparis/index.js
// Bu dosya YENİ siparişleri oluşturmak (POST) ve
// ONAYLANMAMIŞ siparişleri listelemek (GET) içindir.

import prisma from '../../../lib/prisma'; // Prisma Client import yolunu kontrol et
import { Prisma } from '@prisma/client'; // Hata tipleri için import

export default async function handler(req, res) {
    // CORS ve OPTIONS Handling
    res.setHeader('Access-Control-Allow-Origin', '*'); // Production'da domain belirt
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        console.log('OPTIONS /api/siparis isteği yanıtlandı.');
        return res.status(200).end();
    }

    // --- YENİ SİPARİŞ OLUŞTURMA (POST - Değişiklik yok) ---
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
            gorunecekAd,
        } = req.body;

        if (!tarih || !teslimatTuruId || !gonderenAdi || !gonderenTel || !siparisler || !Array.isArray(siparisler) || siparisler.length === 0) {
            console.error('Eksik veya geçersiz veri:', { tarih, teslimatTuruId, gonderenAdi, gonderenTel, siparisler });
            return res.status(400).json({ message: 'Eksik veya geçersiz veri. Lütfen tüm zorunlu alanları kontrol edin.' });
        }

        try {
            const yeniSiparis = await prisma.$transaction(async (tx) => {
                const olusturulanSiparis = await tx.siparis.create({
                    data: {
                        tarih: new Date(tarih),
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
                        // onaylandiMi: false, // @default(false) sayesinde otomatik
                    },
                });

                console.log(`Ana sipariş oluşturuldu: ID ${olusturulanSiparis.id}`);

                let toplamEklenenKalem = 0;
                for (const paket of siparisler) {
                    if (!paket.Urunler || !Array.isArray(paket.Urunler) || paket.Urunler.length === 0) {
                        console.warn(`Sipariş ${olusturulanSiparis.id} için boş ürün listesi olan paket atlandı (Ambalaj ID: ${paket.AmbalajId})`);
                        continue;
                    }
                    if (!paket.AmbalajId) {
                        console.warn(`Sipariş ${olusturulanSiparis.id} için AmbalajId eksik olan paket atlandı.`);
                        continue;
                    }

                    const kalemVerileri = paket.Urunler.map(urun => {
                        if (!urun.UrunId || !urun.Miktar || !urun.Birim) {
                            console.warn(`Sipariş ${olusturulanSiparis.id}, Paket (Ambalaj ID: ${paket.AmbalajId}) içinde eksik ürün bilgisi atlandı:`, urun);
                            return null;
                        }
                        return {
                            siparisId: olusturulanSiparis.id,
                            ambalajId: parseInt(paket.AmbalajId),
                            urunId: parseInt(urun.UrunId),
                            miktar: parseFloat(urun.Miktar),
                            birim: urun.Birim,
                            kutuId: paket.KutuId ? parseInt(paket.KutuId) : null,
                            tepsiTavaId: paket.TepsiTavaId ? parseInt(paket.TepsiTavaId) : null,
                        };
                    }).filter(item => item !== null);

                    if (kalemVerileri.length > 0) {
                        console.log(`Sipariş ${olusturulanSiparis.id} için ${kalemVerileri.length} kalem ekleniyor (Ambalaj ID: ${paket.AmbalajId}, Kutu ID: ${paket.KutuId}, TepsiTava ID: ${paket.TepsiTavaId})`);
                        await tx.siparisKalemi.createMany({
                            data: kalemVerileri,
                        });
                        toplamEklenenKalem += kalemVerileri.length;
                    }
                }

                if (toplamEklenenKalem === 0) {
                    throw new Error("Siparişe eklenecek geçerli ürün bulunamadı.");
                }

                return tx.siparis.findUnique({
                    where: { id: olusturulanSiparis.id },
                    include: {
                        kalemler: {
                            include: {
                                urun: { select: { ad: true } },
                                ambalaj: { select: { ad: true } },
                                kutu: { select: { ad: true } },
                                tepsiTava: { select: { ad: true } }
                            }
                        }
                    },
                });
            });

            console.log('Sipariş başarıyla kaydedildi:', yeniSiparis);
            return res.status(201).json(yeniSiparis);

        } catch (error) {
            console.error('❌ POST /api/siparis HATA:', error);
            let errorMessage = 'Sipariş oluşturulurken bir sunucu hatası oluştu.';
            if (error.message.includes("geçerli ürün bulunamadı")) {
                errorMessage = error.message;
            } else if (error instanceof Prisma.PrismaClientValidationError) {
                errorMessage = 'Veri doğrulama hatası. Lütfen gönderilen verileri kontrol edin.';
            } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
                errorMessage = `Veritabanı hatası: ${error.code}. Lütfen ID'lerin doğru olduğundan emin olun.`;
            }
            return res.status(500).json({ message: errorMessage });
        }
    }

    // --- ONAYLANMAMIŞ SİPARİŞLERİ LİSTELEME (GET - GÜNCELLENDİ) ---
    if (req.method === 'GET') {
        try {
            console.log('GET /api/siparis isteği alındı (onaylanmamışları listeleme)...');

            // Query parametrelerini kontrol et (ileride farklı view'ler eklenirse diye)
            const { view } = req.query;

            // Varsayılan olarak veya view=pending ise onaylanmamışları getir
            // (Şimdilik sadece bu mantığı ekliyoruz)
            const whereClause = {
                onaylandiMi: false
            };

            // İleride eklenebilecek diğer view'ler için:
            // if (view === 'daily_pending') {
            //   // Dünün tarihini hesapla ve ona göre filtrele...
            // } else if (view === 'date_range') {
            //   // startDate ve endDate'e göre filtrele...
            // }

            const siparisler = await prisma.siparis.findMany({
                where: whereClause, // <<< FİLTRE EKLENDİ
                orderBy: { createdAt: 'asc' }, // En eskiden yeniye sırala (onay sırası için mantıklı olabilir)
                include: { // <<< İLİŞKİLİ VERİLERİ DAHİL ET
                    teslimatTuru: { select: { ad: true } }, // Sadece adı al
                    sube: { select: { ad: true } },         // Sadece adı al
                    gonderenAliciTipi: { select: { ad: true } }, // Sadece adı al
                    kalemler: { // Kalemleri ve onların ilişkili verilerini dahil et
                        orderBy: { id: 'asc' }, // Kalemleri kendi içinde sırala
                        include: {
                            urun: { select: { id: true, ad: true } }, // Ürün ID ve Adı
                            ambalaj: { select: { id: true, ad: true } }, // Ana Ambalaj ID ve Adı
                            kutu: { select: { id: true, ad: true } }, // Spesifik Kutu ID ve Adı (varsa)
                            tepsiTava: { select: { id: true, ad: true } } // Spesifik Tepsi/Tava ID ve Adı (varsa)
                        }
                    }
                }
            });

            console.log(`${siparisler.length} adet onaylanmamış sipariş bulundu.`);
            return res.status(200).json(siparisler); // Filtrelenmiş ve detaylı siparişleri döndür

        } catch (error) {
            console.error('❌ GET /api/siparis HATA:', error);
            return res.status(500).json({ message: 'Siparişler listelenirken hata oluştu.', error: error.message });
        }
    }

    // Desteklenmeyen diğer metotlar için 405 hatası
    console.log(`Desteklenmeyen metot: ${req.method} for /api/siparis`);
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
