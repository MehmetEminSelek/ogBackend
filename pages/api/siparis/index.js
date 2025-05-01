import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req, res) {
    // CORS ve OPTIONS Handling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'POST') {
        console.log('POST /api/siparis isteği alındı. Body:', JSON.stringify(req.body, null, 2));
        const { /* ... (diğer alanlar) ... */ siparisler, /* ... */ } = req.body;
        // ... (Gerekli alan kontrolü aynı) ...

        try {
            // <<< YENİ: Tepsi/Tava ID'lerini ve fiyatlarını önceden çekelim >>>
            const tepsiTavaIds = siparisler
                .map(pkg => pkg.TepsiTavaId)
                .filter(id => id != null); // Sadece null olmayan ID'leri al

            let tepsiTavaMap = {};
            if (tepsiTavaIds.length > 0) {
                const tepsiler = await prisma.tepsiTava.findMany({
                    where: { id: { in: tepsiTavaIds.map(id => parseInt(id)) } },
                    select: { id: true, fiyat: true }
                });
                tepsiTavaMap = tepsiler.reduce((map, tepsi) => {
                    map[tepsi.id] = tepsi.fiyat || 0; // Fiyat null ise 0 kabul et
                    return map;
                }, {});
                console.log("Çekilen Tepsi/Tava Fiyatları:", tepsiTavaMap);
            }
            // <<< YENİ BİTİŞ >>>


            const yeniSiparis = await prisma.$transaction(async (tx) => {
                // <<< YENİ: Toplam tepsi maliyetini hesapla >>>
                let hesaplananToplamTepsiMaliyeti = 0;
                siparisler.forEach(paket => {
                    if (paket.TepsiTavaId && tepsiTavaMap[paket.TepsiTavaId]) {
                        hesaplananToplamTepsiMaliyeti += tepsiTavaMap[paket.TepsiTavaId];
                    }
                });
                console.log("Hesaplanan Toplam Tepsi Maliyeti:", hesaplananToplamTepsiMaliyeti);
                // <<< YENİ BİTİŞ >>>

                const olusturulanSiparis = await tx.siparis.create({
                    data: {
                        // ... (diğer sipariş alanları aynı) ...
                        tarih: new Date(req.body.tarih),
                        teslimatTuruId: parseInt(req.body.teslimatTuruId),
                        subeId: req.body.subeId ? parseInt(req.body.subeId) : null,
                        gonderenTipiId: req.body.gonderenTipiId ? parseInt(req.body.gonderenTipiId) : null,
                        gonderenAdi: req.body.gonderenAdi,
                        gonderenTel: req.body.gonderenTel,
                        aliciAdi: req.body.aliciAdi || null,
                        aliciTel: req.body.aliciTel || null,
                        adres: req.body.adres || null,
                        aciklama: req.body.aciklama || null,
                        gorunecekAd: req.body.gorunecekAd || null,
                        toplamTepsiMaliyeti: hesaplananToplamTepsiMaliyeti, // <<< YENİ: Hesaplanan değeri kaydet
                        kargoUcreti: req.body.kargoUcreti ? parseFloat(req.body.kargoUcreti) : 0, // Frontend'den gelirse
                        digerHizmetTutari: req.body.digerHizmetTutari ? parseFloat(req.body.digerHizmetTutari) : 0, // Frontend'den gelirse
                    },
                });

                console.log(`Ana sipariş oluşturuldu: ID ${olusturulanSiparis.id}`);

                let toplamEklenenKalem = 0;
                for (const paket of siparisler) {
                    // ... (paket kontrolü aynı) ...

                    // <<< YENİ: Kalemler için fiyatları topluca çek >>>
                    const urunBirimTarihList = paket.Urunler.map(u => ({
                        urunId: parseInt(u.UrunId),
                        birim: u.Birim,
                        tarih: new Date(req.body.tarih) // Sipariş tarihi
                    })).filter(u => u.urunId && u.birim); // Geçerli olanları al

                    const fiyatlarMap = {}; // urunId_birim -> fiyat
                    if (urunBirimTarihList.length > 0) {
                        const fiyatSorgulari = urunBirimTarihList.map(u =>
                            tx.fiyat.findFirst({
                                where: {
                                    urunId: u.urunId,
                                    birim: u.birim,
                                    gecerliTarih: { lte: u.tarih },
                                    // bitisTarihi alanı şemada yoksa bu kontrolü kaldır
                                    // OR: [ { bitisTarihi: null }, { bitisTarihi: { gte: u.tarih } } ]
                                },
                                orderBy: { gecerliTarih: 'desc' },
                                select: { urunId: true, birim: true, fiyat: true }
                            })
                        );
                        const bulunanFiyatlar = await Promise.all(fiyatSorgulari);
                        bulunanFiyatlar.forEach(fiyatKaydi => {
                            if (fiyatKaydi) {
                                fiyatlarMap[`${fiyatKaydi.urunId}_${fiyatKaydi.birim}`] = fiyatKaydi.fiyat;
                            }
                        });
                        console.log("Çekilen Birim Fiyatlar:", fiyatlarMap);
                    }
                    // <<< YENİ BİTİŞ >>>


                    const kalemVerileri = paket.Urunler.map(urun => {
                        // ... (urun kontrolü aynı) ...
                        const birimFiyatKey = `${parseInt(urun.UrunId)}_${urun.Birim}`;
                        const bulunanBirimFiyat = fiyatlarMap[birimFiyatKey] || 0; // Fiyatı map'ten al, yoksa 0

                        return {
                            siparisId: olusturulanSiparis.id,
                            ambalajId: parseInt(paket.AmbalajId),
                            urunId: parseInt(urun.UrunId),
                            miktar: parseFloat(urun.Miktar),
                            birim: urun.Birim,
                            birimFiyat: bulunanBirimFiyat, // <<< YENİ: Çekilen fiyatı kaydet
                            kutuId: paket.KutuId ? parseInt(paket.KutuId) : null,
                            tepsiTavaId: paket.TepsiTavaId ? parseInt(paket.TepsiTavaId) : null,
                        };
                    }).filter(item => item !== null);

                    if (kalemVerileri.length > 0) {
                        console.log(`Sipariş ${olusturulanSiparis.id} için ${kalemVerileri.length} kalem ekleniyor...`);
                        await tx.siparisKalemi.createMany({ data: kalemVerileri });
                        toplamEklenenKalem += kalemVerileri.length;
                    }
                }

                if (toplamEklenenKalem === 0) { throw new Error("Siparişe eklenecek geçerli ürün bulunamadı."); }

                // Sonuç olarak güncellenmiş siparişi döndür
                return tx.siparis.findUnique({ where: { id: olusturulanSiparis.id }, include: { kalemler: true } });
            }); // Transaction sonu

            console.log('Sipariş başarıyla kaydedildi:', yeniSiparis);
            return res.status(201).json(yeniSiparis);

        } catch (error) { /* ... hata yönetimi aynı ... */ }
    }

    // Desteklenmeyen metot
    console.log(`Desteklenmeyen metot: ${req.method} for /api/siparis`);
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}