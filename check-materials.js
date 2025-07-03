const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const materials = await prisma.material.findMany({
            orderBy: { ad: 'asc' }
        });

        console.log('🧱 VERİTABANINDAKİ MALZEMELER:\n');
        materials.forEach((material, index) => {
            console.log(`${index + 1}. ${material.ad}`);
        });

        console.log(`\n📊 Toplam: ${materials.length} malzeme`);

    } catch (error) {
        console.error('❌ HATA:', error);
    }
}

main()
    .finally(async () => {
        await prisma.$disconnect();
    }); 