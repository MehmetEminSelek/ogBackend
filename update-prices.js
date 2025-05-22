const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const prices = [
    { kod: 'UR001', fiyat: 950 },  // Antep Peynirli Su Böreği
    { kod: 'UR002', fiyat: 1600 }, // Bayram Tepsisi
    { kod: 'UR003', fiyat: 1450 }, // Cevizli Bülbül Yuvası
    { kod: 'UR004', fiyat: 1450 }, // Cevizli Eski Usûl Dolama
    { kod: 'UR005', fiyat: 1400 }, // Cevizli Özel Kare
    { kod: 'UR006', fiyat: 1400 }, // Cevizli Şöbiyet
    { kod: 'UR007', fiyat: 1000 }, // Cevizli Yaş Baklava
    { kod: 'UR008', fiyat: 1600 }, // Doğum Günü Tepsisi
    { kod: 'UR009', fiyat: 1450 }, // Düz Kadayıf
    { kod: 'UR010', fiyat: 1700 }, // Fındıklı Çikolatalı Midy
    { kod: 'UR011', fiyat: 1650 }, // Fıstık Ezmesi
    { kod: 'UR012', fiyat: 1450 }, // Burma Kadayıf
    { kod: 'UR013', fiyat: 1650 }, // Bülbül Yuvası
    { kod: 'UR014', fiyat: 1800 }, // Çikolatalı Midye
    { kod: 'UR015', fiyat: 1650 }, // Dolama
    { kod: 'UR016', fiyat: 1650 }, // Eski Usûl Dolama
    { kod: 'UR017', fiyat: 1400 }, // Havuç Dilimi
    { kod: 'UR018', fiyat: 1500 }, // Fıstıklı Kurabiye
    { kod: 'UR019', fiyat: 1200 }, // Kuru Baklava
    { kod: 'UR020', fiyat: 1650 }, // Midye
    { kod: 'UR021', fiyat: 1450 }, // Özel Kare
    { kod: 'UR022', fiyat: 1650 }, // Özel Şöbiyet
    { kod: 'UR023', fiyat: 1450 }, // Şöbiyet
    { kod: 'UR024', fiyat: 1700 }, // Yaprak Şöbiyet
    { kod: 'UR025', fiyat: 1200 }, // Yaş Baklava
    { kod: 'UR026', fiyat: 1750 }, // İç Fıstık
    { kod: 'UR027', fiyat: 1700 }, // Kare Fıstık Ezmesi
    { kod: 'UR028', fiyat: 1500 }, // Karışık
    { kod: 'UR029', fiyat: 950 },  // Kaymaklı Baklava
    { kod: 'UR030', fiyat: 950 },  // Kaymaklı Havuç Dilimi
    { kod: 'UR031', fiyat: 1600 }, // Özel Karışık
    { kod: 'UR032', fiyat: 1000 }, // Sade Kurabiye
    { kod: 'UR033', fiyat: 700 },  // Sadeyağ
    { kod: 'UR034', fiyat: 1650 }, // Sargılı Fıstık Ezmesi
    { kod: 'UR035', fiyat: 1200 }, // Soğuk Baklava
    { kod: 'UR036', fiyat: 900 },  // Tuzlu Antep Fıstığı
    { kod: 'UR037', fiyat: 1600 }, // Yazılı Karışık Tepsi
    { kod: 'UR038', fiyat: 1600 }  // Yılbaşı Tepsisi
];

async function updatePrices() {
    try {
        console.log('Fiyat güncellemesi başlıyor...');

        for (const price of prices) {
            const urun = await prisma.urun.findUnique({
                where: { kodu: price.kod }
            });

            if (!urun) {
                console.log(`${price.kod} kodlu ürün bulunamadı.`);
                continue;
            }

            // Eski fiyatın bitiş tarihini bugün olarak ayarla
            await prisma.fiyat.updateMany({
                where: {
                    urunId: urun.id,
                    birim: 'KG',
                    bitisTarihi: null
                },
                data: {
                    bitisTarihi: new Date()
                }
            });

            // Yeni fiyatı ekle
            const yeniFiyat = await prisma.fiyat.create({
                data: {
                    urunId: urun.id,
                    fiyat: price.fiyat,
                    birim: 'KG',
                    gecerliTarih: new Date(),
                    bitisTarihi: null
                }
            });

            console.log(`${price.kod} - ${urun.ad} için yeni fiyat eklendi: ${price.fiyat} TL/KG`);
        }

        console.log('Fiyat güncellemesi tamamlandı.');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updatePrices(); 