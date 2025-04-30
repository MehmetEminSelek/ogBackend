// pages/api/siparis/[id].js
// Bu dosya belirli bir siparişi getirmek (GET),
// GÜNCELLEMEK (PUT - kalemler veya onay durumu) ve
// SİLMEK (DELETE) içindir.

import prisma from '../../../lib/prisma'; // Prisma Client import yolunu kendi yapına göre düzelt
import { Prisma } from '@prisma/client'; // Hata tipleri için import

export default async function handler(req, res) {
    // CORS ve OPTIONS Handling
    res.setHeader('Access-Control-Allow-Origin', '*'); // Production'da domain belirt
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        console.log(`OPTIONS /api/siparis/[id] isteği yanıtlandı.`);
        return res.status(200).end();
    }

    // ID'yi al ve sayıya çevir, geçersizse hata döndür
    const idQueryParam = req.query.id;
    const id = parseInt(idQueryParam);

    if (isNaN(id)) {
        return res.status(400).json({ message: 'Geçersiz Sipariş ID.' });
    }

    // --- SİPARİŞ DETAYI GETİRME (GET) ---
    if (req.method === 'GET') {
        try {
            console.log(`GET /api/siparis/${id} isteği alındı.`);
            const siparis = await prisma.siparis.findUnique({
                where: { id },
                // İlişkili verileri detaylı olarak dahil et
                include: {
                    teslimatTuru: { select: { ad: true } },
                    sube: { select: { ad: true } },
                    gonderenAliciTipi: { select: { ad: true } },
                    kalemler: {
                        orderBy: { id: 'asc' },
                        include: {
                            urun: { select: { id: true, ad: true } },
                            ambalaj: { select: { id: true, ad: true } },
                            kutu: { select: { id: true, ad: true } },
                            tepsiTava: { select: { id: true, ad: true } }
                        }
                    }
                }
            });

            if (!siparis) {
                console.log(`Sipariş ${id} bulunamadı.`);
                return res.status(404).json({ message: 'Sipariş bulunamadı.' });
            }
            console.log(`Sipariş ${id} detayları başarıyla getirildi.`);
            return res.status(200).json(siparis);

        } catch (error) {
            console.error(`❌ GET /api/siparis/${id} HATA:`, error);
            return res.status(500).json({ message: 'Sipariş getirilirken hata oluştu.', error: error.message });
        }
    }

    // --- SİPARİŞ GÜNCELLEME (PUT - Kalemler veya Onay Durumu) ---
    if (req.method === 'PUT') {
        console.log(`PUT /api/siparis/${id} isteği alındı. Body:`, JSON.stringify(req.body, null, 2));
        // Body'den sadece beklenen alanları al, geri kalanı alma (güvenlik için)
        const { onaylandiMi, kalemler } = req.body;

        // Ne tür bir güncelleme yapıldığını belirle
        // Sadece onaylandiMi varsa ve başka bir şey yoksa onay işlemidir.
        const isApprovalOnly = typeof onaylandiMi === 'boolean' && Object.keys(req.body).length === 1;
        // kalemler dizisi varsa içerik güncellemesidir.
        const isItemsUpdate = Array.isArray(kalemler);

        // Hem onay hem kalem aynı anda gelirse veya hiçbiri gelmezse hata ver
        if ((isApprovalOnly && isItemsUpdate) || (!isApprovalOnly && !isItemsUpdate)) {
            return res.status(400).json({ message: "Geçersiz güncelleme isteği. Sadece 'onaylandiMi' veya sadece 'kalemler' güncellenebilir." });
        }

        try {
            // Transaction başlat
            const guncellenenSiparis = await prisma.$transaction(async (tx) => {
                let updatedSiparisData = {};

                // --- Sadece Onaylama İşlemi ---
                if (isApprovalOnly) {
                    console.log(`Sipariş ${id} onay durumu güncelleniyor: ${onaylandiMi}`);
                    updatedSiparisData = await tx.siparis.update({
                        where: { id },
                        data: { onaylandiMi: onaylandiMi },
                        // Güncellenen siparişin kalemlerini de döndür (frontend'de gerekebilir)
                        include: { kalemler: true }
                    });
                }
                // --- Kalemleri Güncelleme İşlemi ---
                else if (isItemsUpdate) {
                    console.log(`Sipariş ${id} kalemleri güncelleniyor...`);

                    // 1. Eski kalemleri sil
                    console.log(`Sipariş ${id} için eski kalemler siliniyor...`);
                    await tx.siparisKalemi.deleteMany({ where: { siparisId: id } });

                    // 2. Yeni (güncellenmiş) kalemleri oluştur
                    if (kalemler.length > 0) {
                        const yeniKalemVerileri = kalemler.map(kalem => {
                            // Frontend'den gelen her kalemin gerekli ID'leri içerdiğinden emin ol
                            if (kalem.ambalajId === undefined || kalem.ambalajId === null ||
                                kalem.urunId === undefined || kalem.urunId === null ||
                                kalem.miktar === undefined || kalem.miktar === null || !kalem.birim) {
                                // Önemli: Frontend'den gelen kalem objesinde ID'ler olmalı.
                                // Eğer isimler geliyorsa, burada tekrar ID bulma işlemi yapılmalı.
                                // Şimdilik ID'lerin geldiğini varsayıyoruz.
                                console.error("Eksik kalem verisi:", kalem);
                                throw new Error(`Güncellenecek kalem verisi eksik veya geçersiz.`);
                            }
                            return {
                                siparisId: id,
                                ambalajId: parseInt(kalem.ambalajId), // Ana ambalaj tipi ID'si
                                urunId: parseInt(kalem.urunId),
                                miktar: parseFloat(kalem.miktar),
                                birim: kalem.birim,
                                // Spesifik ID'ler (varsa integer, yoksa null)
                                kutuId: kalem.kutuId ? parseInt(kalem.kutuId) : null,
                                tepsiTavaId: kalem.tepsiTavaId ? parseInt(kalem.tepsiTavaId) : null,
                            };
                        });

                        console.log(`Sipariş ${id} için ${yeniKalemVerileri.length} yeni kalem ekleniyor...`);
                        await tx.siparisKalemi.createMany({
                            data: yeniKalemVerileri,
                        });
                    } else {
                        console.log(`Sipariş ${id} için tüm kalemler kaldırıldı (güncelleme sonrası).`);
                    }

                    // Ana siparişin updatedAt alanını güncelle (isteğe bağlı)
                    // await tx.siparis.update({ where: { id }, data: { updatedAt: new Date() } });

                    // Güncellenmiş siparişi al (kalemleriyle birlikte)
                    updatedSiparisData = await tx.siparis.findUnique({
                        where: { id },
                        include: { kalemler: true } // Güncellenmiş kalemleri dahil et
                    });
                }

                return updatedSiparisData; // Transaction sonucu
            }); // Transaction sonu

            console.log(`Sipariş ${id} başarıyla güncellendi.`);
            return res.status(200).json(guncellenenSiparis);

        } catch (error) {
            console.error(`❌ PUT /api/siparis/${id} HATA:`, error);
            let statusCode = 500;
            let errorMessage = 'Sipariş güncellenirken bir sunucu hatası oluştu.';

            if (error.message.includes("Geçersiz güncelleme isteği") || error.message.includes("Güncellenecek kalem verisi eksik")) {
                statusCode = 400;
                errorMessage = error.message;
            } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
                if (error.code === 'P2025') { // Kayıt bulunamadı hatası
                    statusCode = 404;
                    errorMessage = 'Güncellenecek sipariş bulunamadı.';
                } else if (error.code === 'P2003') { // Foreign key constraint hatası (geçersiz ID?)
                    statusCode = 400;
                    errorMessage = `İlişki hatası (${error.meta?.field_name}). Lütfen gönderilen ID'lerin geçerli olduğundan emin olun.`;
                }
                else {
                    errorMessage = `Veritabanı hatası: ${error.code}.`;
                }
            } else if (error instanceof Prisma.PrismaClientValidationError) {
                errorMessage = 'Veri doğrulama hatası.';
                statusCode = 400;
            }

            return res.status(statusCode).json({ message: errorMessage, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }

    // --- SİPARİŞ SİLME (DELETE) ---
    if (req.method === 'DELETE') {
        try {
            console.log(`DELETE /api/siparis/${id} isteği alındı.`);
            // İlişkili kalemler schema'da onDelete: Cascade olarak ayarlandıysa otomatik silinir.
            // Sadece ana siparişi silmek yeterli.
            await prisma.siparis.delete({ where: { id } });
            console.log(`Sipariş ${id} başarıyla silindi.`);
            return res.status(204).end(); // Başarılı silme sonrası içerik yok
        } catch (error) {
            console.error(`❌ DELETE /api/siparis/${id} HATA:`, error);
            let statusCode = 500;
            let errorMessage = 'Sipariş silinirken bir hata oluştu.';
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                statusCode = 404;
                errorMessage = 'Silinecek sipariş bulunamadı.';
            }
            return res.status(statusCode).json({ message: errorMessage, error: process.env.NODE_ENV === 'development' ? error.message : undefined });
        }
    }

    // Desteklenmeyen metot
    console.log(`Desteklenmeyen metot: ${req.method} for /api/siparis/${id}`);
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
