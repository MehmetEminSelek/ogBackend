const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCariAdres() {
    try {
        const cari = await prisma.cari.findUnique({
            where: { id: 1075 },
            include: { adresler: true }
        });

        console.log('🔍 Cari detayları:');
        console.log(JSON.stringify(cari, null, 2));

        if (cari && cari.adresler) {
            console.log('\n📍 Adres detayları:');
            cari.adresler.forEach((adres, index) => {
                console.log(`${index + 1}. ID: ${adres.id}`);
                console.log(`   Tip: "${adres.tip}"`);
                console.log(`   Adres: "${adres.adres}"`);
                console.log(`   Adres uzunluğu: ${adres.adres ? adres.adres.length : 0}`);
                console.log(`   Adres null mu: ${adres.adres === null}`);
                console.log(`   Adres undefined mu: ${adres.adres === undefined}`);
                console.log('');
            });
        }

    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkCariAdres(); 