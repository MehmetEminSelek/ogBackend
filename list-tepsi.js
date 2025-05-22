const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listTepsi() {
    try {
        console.log('Mevcut Tepsi/Tavalar:');

        const tepsiTavalar = await prisma.tepsiTava.findMany({
            orderBy: { kodu: 'asc' }
        });

        tepsiTavalar.forEach(t => console.log(`${t.kodu} - ${t.ad} - ${t.fiyat} TL`));
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listTepsi(); 