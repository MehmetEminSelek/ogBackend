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
            const { urunId, birim, tarih, miktar } = req.query;

            if (!urunId || !birim || !tarih) {
                return res.status(400).json({
                    error: 'urunId, birim ve tarih parametreleri zorunludur'
                });
            }

            const siparisTarihi = new Date(tarih);
            const normalizedBirim = birim.toUpperCase();
            const testMiktar = parseFloat(miktar) || 1;

            console.log(`🔍 Fiyat hesaplama debug: urunId=${urunId}, birim=${birim}, tarih=${tarih}, miktar=${testMiktar}`);

            // 1. Ürün bilgisini al
            const urun = await prisma.urun.findUnique({
                where: { id: parseInt(urunId) },
                select: { id: true, ad: true, kod: true }
            });

            if (!urun) {
                return res.status(404).json({ error: 'Ürün bulunamadı' });
            }

            // 2. Mevcut fiyatları listele
            const mevcutFiyatlar = await prisma.fiyat.findMany({
                where: { urunId: parseInt(urunId) },
                orderBy: { gecerliTarih: 'desc' }
            });

            // 3. Fiyat hesaplama simülasyonu
            let targetBirimler = [];

            if (normalizedBirim === 'GRAM') {
                targetBirimler = ['GRAM', 'KG'];
            } else if (normalizedBirim === 'KG') {
                targetBirimler = ['KG'];
            } else {
                targetBirimler = [normalizedBirim];
            }

            let fiyatKaydi = null;
            let foundBirim = null;
            let hesaplamaAdimlari = [];

            // Hedef birimleri sırasıyla dene
            for (const targetBirim of targetBirimler) {
                hesaplamaAdimlari.push(`🔍 ${targetBirim} biriminde fiyat aranıyor...`);

                fiyatKaydi = await prisma.fiyat.findFirst({
                    where: {
                        urunId: parseInt(urunId),
                        birim: targetBirim,
                        gecerliTarih: { lte: siparisTarihi },
                        OR: [
                            { bitisTarihi: null },
                            { bitisTarihi: { gte: siparisTarihi } }
                        ]
                    },
                    orderBy: { gecerliTarih: 'desc' },
                });

                if (fiyatKaydi) {
                    foundBirim = targetBirim;
                    hesaplamaAdimlari.push(`✅ ${targetBirim} fiyatı bulundu: ${fiyatKaydi.fiyat}₺`);
                    break;
                } else {
                    hesaplamaAdimlari.push(`❌ ${targetBirim} fiyatı bulunamadı`);
                }
            }

            // 4. Birim dönüşümü hesaplama
            let finalPrice = 0;
            let birimDonusumu = null;

            if (fiyatKaydi) {
                finalPrice = fiyatKaydi.fiyat;

                if (normalizedBirim === 'GRAM' && foundBirim === 'KG') {
                    finalPrice = fiyatKaydi.fiyat / 1000;
                    birimDonusumu = `KG fiyatı ${fiyatKaydi.fiyat}₺ -> Gram başına ${finalPrice}₺`;
                } else if (normalizedBirim === 'KG' && foundBirim === 'GRAM') {
                    finalPrice = fiyatKaydi.fiyat * 1000;
                    birimDonusumu = `GRAM fiyatı ${fiyatKaydi.fiyat}₺ -> KG başına ${finalPrice}₺`;
                } else {
                    birimDonusumu = 'Birim dönüşümü gerekmiyor';
                }

                hesaplamaAdimlari.push(`🔄 ${birimDonusumu}`);
            }

            // 5. Toplam hesaplama
            const araToplam = testMiktar * finalPrice;
            const kdvTutari = araToplam * 0.18;
            const toplamTutar = araToplam + kdvTutari;

            const sonuc = {
                urun: {
                    id: urun.id,
                    ad: urun.ad,
                    kod: urun.kod
                },
                parametreler: {
                    urunId: parseInt(urunId),
                    birim: birim,
                    normalizedBirim: normalizedBirim,
                    tarih: tarih,
                    testMiktar: testMiktar
                },
                mevcutFiyatlar: mevcutFiyatlar.map(f => ({
                    id: f.id,
                    birim: f.birim,
                    fiyat: f.fiyat,
                    gecerliTarih: f.gecerliTarih,
                    bitisTarihi: f.bitisTarihi,
                    aktif: f.aktif
                })),
                hesaplamaAdimlari: hesaplamaAdimlari,
                sonuc: {
                    bulunanFiyat: fiyatKaydi ? fiyatKaydi.fiyat : null,
                    bulunanBirim: foundBirim,
                    birimDonusumu: birimDonusumu,
                    finalPrice: finalPrice,
                    araToplam: araToplam,
                    kdvTutari: kdvTutari,
                    toplamTutar: toplamTutar
                },
                debug: {
                    targetBirimler: targetBirimler,
                    fiyatBulundu: !!fiyatKaydi,
                    hesaplamaBasarili: finalPrice > 0
                }
            };

            return res.status(200).json(sonuc);

        } catch (error) {
            console.error('❌ Fiyat hesaplama debug hatası:', error);
            return res.status(500).json({
                error: 'Fiyat hesaplama debug sırasında hata oluştu',
                details: error.message
            });
        }
    }

    console.log(`Desteklenmeyen metot: ${req.method} for /api/debug-fiyat-hesaplama`);
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 