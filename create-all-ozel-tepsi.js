const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const ozelTepsiler = [
    {
        kod: 'OT001',
        ad: 'Bayram Tepsisi',
        aciklama: '3 KG\'lık özel karışım tepsi: 1 KG Cevizli Yaş Baklava, 1 KG Fıstıklı Kurabiye, 1 KG Kaymaklı Havuç Dilimi',
        fiyat: 1600,
        icindekiler: [
            { urunKodu: 'UR007', miktar: 1 }, // Cevizli Yaş Baklava
            { urunKodu: 'UR018', miktar: 1 }, // Fıstıklı Kurabiye
            { urunKodu: 'UR030', miktar: 1 }  // Kaymaklı Havuç Dilimi
        ]
    },
    {
        kod: 'OT002',
        ad: 'Doğum Günü Tepsisi',
        aciklama: '3 KG\'lık özel karışım tepsi: 1 KG Fıstık Ezmesi, 1 KG Çikolatalı Midye, 1 KG Kuru Baklava',
        fiyat: 1600,
        icindekiler: [
            { urunKodu: 'UR011', miktar: 1 }, // Fıstık Ezmesi
            { urunKodu: 'UR014', miktar: 1 }, // Çikolatalı Midye
            { urunKodu: 'UR019', miktar: 1 }  // Kuru Baklava
        ]
    },
    {
        kod: 'OT003',
        ad: 'Özel Karışık',
        aciklama: '3 KG\'lık özel karışım tepsi: 1 KG Bülbül Yuvası, 1 KG Şöbiyet, 1 KG Yaş Baklava',
        fiyat: 1600,
        icindekiler: [
            { urunKodu: 'UR013', miktar: 1 }, // Bülbül Yuvası
            { urunKodu: 'UR023', miktar: 1 }, // Şöbiyet
            { urunKodu: 'UR025', miktar: 1 }  // Yaş Baklava
        ]
    },
    {
        kod: 'OT004',
        ad: 'Yılbaşı Tepsisi',
        aciklama: '3 KG\'lık özel karışım tepsi: 1 KG Özel Kare, 1 KG Özel Şöbiyet, 1 KG Yaprak Şöbiyet',
        fiyat: 1600,
        icindekiler: [
            { urunKodu: 'UR021', miktar: 1 }, // Özel Kare
            { urunKodu: 'UR022', miktar: 1 }, // Özel Şöbiyet
            { urunKodu: 'UR024', miktar: 1 }  // Yaprak Şöbiyet
        ]
    },
    {
        kod: 'OT005',
        ad: 'Yazılı Karışık Tepsi',
        aciklama: '3 KG\'lık özel karışım tepsi: 1 KG Dolama, 1 KG Midye, 1 KG Havuç Dilimi',
        fiyat: 1600,
        icindekiler: [
            { urunKodu: 'UR015', miktar: 1 }, // Dolama
            { urunKodu: 'UR020', miktar: 1 }, // Midye
            { urunKodu: 'UR017', miktar: 1 }  // Havuç Dilimi
        ]
    }
];

async function createAllOzelTepsi() {
    try {
        console.log('Özel tepsiler oluşturuluyor...');

        for (const tepsi of ozelTepsiler) {
            // Önce ürünleri bulalım
            const urunler = await Promise.all(
                tepsi.icindekiler.map(icerik =>
                    prisma.urun.findUnique({ where: { kodu: icerik.urunKodu } })
                )
            );

            // Eksik ürün kontrolü
            const eksikUrunler = tepsi.icindekiler.filter((_, index) => !urunler[index]);
            if (eksikUrunler.length > 0) {
                console.error(`${tepsi.kod} - ${tepsi.ad} için bazı ürünler bulunamadı:`,
                    eksikUrunler.map(i => i.urunKodu));
                continue;
            }

            // Özel tepsiyi oluştur
            const ozelTepsi = await prisma.ozelTepsi.create({
                data: {
                    kod: tepsi.kod,
                    ad: tepsi.ad,
                    aciklama: tepsi.aciklama,
                    fiyat: tepsi.fiyat,
                    toplamKg: 3, // Hepsi 3 KG
                    icindekiler: {
                        create: tepsi.icindekiler.map((icerik, index) => ({
                            urunId: urunler[index].id,
                            miktar: icerik.miktar
                        }))
                    }
                }
            });

            console.log(`${tepsi.kod} - ${tepsi.ad} başarıyla oluşturuldu.`);
        }

        console.log('Tüm özel tepsiler başarıyla oluşturuldu.');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAllOzelTepsi(); 