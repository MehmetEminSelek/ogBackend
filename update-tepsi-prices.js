const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const tepsiPrices = [
    { kod: 'TP001', fiyat: 100 },  // 1 Lt Tava
    { kod: 'TP002', fiyat: 150 },  // 1 Lt Tepsi
    { kod: 'TP003', fiyat: 200 },  // 1.5 Lt Tava
    { kod: 'TP004', fiyat: 80 },   // 1.5 Lt Tepsi
    { kod: 'TP005', fiyat: 110 },  // 1000 Ltk Tava
    { kod: 'TP006', fiyat: 90 },   // 2 Lt Tava
    { kod: 'TP007', fiyat: 160 },  // 2 Lt Tepsi
    { kod: 'TP008', fiyat: 70 },   // 2.5 Lt Tepsi
    { kod: 'TP009', fiyat: 70 },   // 3 Lt Tepsi
    { kod: 'TP010', fiyat: 130 },  // 4 Lt Tepsi
    { kod: 'TP011', fiyat: 250 },  // 5 Lt Tepsi
    { kod: 'TP012', fiyat: 140 }   // 800 Luk Tava
];

async function updateTepsiPrices() {
    try {
        console.log('Tepsi/Tava fiyat güncellemesi başlıyor...');

        for (const price of tepsiPrices) {
            const tepsi = await prisma.tepsiTava.findFirst({
                where: { kodu: price.kod }
            });

            if (!tepsi) {
                console.log(`${price.kod} kodlu tepsi/tava bulunamadı.`);
                continue;
            }

            // Fiyatı güncelle
            await prisma.tepsiTava.update({
                where: { id: tepsi.id },
                data: { fiyat: price.fiyat }
            });

            console.log(`${price.kod} - ${tepsi.ad} için yeni fiyat güncellendi: ${price.fiyat} TL`);
        }

        console.log('Tepsi/Tava fiyat güncellemesi tamamlandı.');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateTepsiPrices(); 