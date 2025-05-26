const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const fiyatlar = await prisma.fiyat.findMany({
        take: 20,
        orderBy: { id: 'asc' },
        include: { urun: true }
    });
    for (const f of fiyatlar) {
        console.log(`FiyatId: ${f.id} | urunId: ${f.urunId} | Urun: ${f.urun?.ad || '-'} | Birim: ${f.birim} | Fiyat: ${f.fiyat} | Aktif: ${f.aktif}`);
    }
    await prisma.$disconnect();
}

main(); 