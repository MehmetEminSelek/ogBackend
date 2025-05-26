const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const urunler = await prisma.urun.findMany({
        include: { fiyatlar: true }
    });
    for (const urun of urunler) {
        console.log(`\n${urun.id} - ${urun.ad} (${urun.kodu || ''})`);
        if (!urun.fiyatlar.length) {
            console.log('  ⚠️ Fiyat yok!');
        } else {
            urun.fiyatlar.forEach(f =>
                console.log(`  Fiyat: ${f.fiyat} ${f.birim} (${f.aktif ? 'Aktif' : 'Pasif'}) [${f.fiyatTipi}]`)
            );
        }
    }
    await prisma.$disconnect();
}

main(); 