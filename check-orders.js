const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrders() {
    try {
        const orderCount = await prisma.siparis.count();
        const orderItemCount = await prisma.siparisKalemi.count();

        console.log('Mevcut sipariş sayısı:', orderCount);
        console.log('Mevcut sipariş kalemi sayısı:', orderItemCount);

        if (orderCount > 0) {
            const latestOrders = await prisma.siparis.findMany({
                take: 3,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    siparisNo: true,
                    durum: true,
                    createdAt: true
                }
            });
            console.log('Son 3 sipariş:', latestOrders);
        }

    } catch (error) {
        console.error('Hata:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkOrders(); 