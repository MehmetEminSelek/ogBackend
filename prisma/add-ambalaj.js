const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    await prisma.ambalaj.createMany({
        data: [
            {
                ad: 'Kutu',
                kod: 'AM001',
                fiyat: 5,
                aktif: true,
                aciklama: 'Genel kutu ambalajı'
            },
            {
                ad: 'Tepsi/Tava',
                kod: 'AM002',
                fiyat: 10,
                aktif: true,
                aciklama: 'Tepsi ve tava ambalajları'
            }
        ]
    });
    console.log('✅ Ambalajlar eklendi');
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    }); 