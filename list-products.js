const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listProducts() {
    try {
        console.log('Mevcut Ürünler:');

        const products = await prisma.urun.findMany({
            orderBy: { kodu: 'asc' }
        });

        products.forEach(p => console.log(`${p.kodu} - ${p.ad}`));
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

listProducts(); 