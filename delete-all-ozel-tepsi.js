const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllOzelTepsi() {
    try {
        console.log('Tüm özel tepsiler siliniyor...');

        await prisma.ozelTepsi.deleteMany({});

        console.log('Tüm özel tepsiler başarıyla silindi.');
    } catch (error) {
        console.error('Hata:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllOzelTepsi(); 