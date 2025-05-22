const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createBayramTepsisi() {
    try {
        console.log('Bayram Tepsisi oluşturuluyor...');

        // Önce gerekli ürünleri bulalım
        const cevizliYasBaklava = await prisma.urun.findUnique({ where: { kodu: 'UR007' } }); // Cevizli Yaş Baklava
        const fistikliKurabiye = await prisma.urun.findUnique({ where: { kodu: 'UR018' } }); // Fıstıklı Kurabiye
        const kaymakliHavucDilimi = await prisma.urun.findUnique({ where: { kodu: 'UR030' } }); // Kaymaklı Havuç Dilimi

        if (!cevizliYasBaklava || !fistikliKurabiye || !kaymakliHavucDilimi) {
            console.error('Gerekli ürünlerden biri veya birkaçı bulunamadı!');
            return;
        }

        // Bayram Tepsisi'ni oluştur
        const bayramTepsisi = await prisma.ozelTepsi.create({
            data: {
                kod: 'OT001',
                ad: 'Bayram Tepsisi',
                aciklama: '3 KG\'lık özel karışım tepsi: 1 KG Cevizli Yaş Baklava, 1 KG Fıstıklı Kurabiye, 1 KG Kaymaklı Havuç Dilimi',
                fiyat: 1600, // Excel'deki fiyat
                toplamKg: 3,
                icindekiler: {
                    create: [
                        {
                            urunId: cevizliYasBaklava.id,
                            miktar: 1 // 1 KG
                        },
                        {
                            urunId: fistikliKurabiye.id,
                            miktar: 1 // 1 KG
                        },
                        {
                            urunId: kaymakliHavucDilimi.id,
                            miktar: 1 // 1 KG
                        }
                    ]
                }
            }
        });

        console.log('Bayram Tepsisi başarıyla oluşturuldu:', bayramTepsisi);

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createBayramTepsisi(); 