const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('🔍 Hammadde ve Yarı Mamul kontrol ediliyor...\n');

    // Toplam malzeme sayısı
    const toplamMalzeme = await prisma.material.count();
    console.log('✅ Toplam malzeme sayısı:', toplamMalzeme);

    // Hammadde sayısı
    const hammaddeSayisi = await prisma.material.count({
        where: { tipi: 'HAMMADDE' }
    });
    console.log('📦 Hammadde sayısı:', hammaddeSayisi);

    // Yarı mamul sayısı
    const yariMamulSayisi = await prisma.material.count({
        where: { tipi: 'YARI_MAMUL' }
    });
    console.log('🔧 Yarı mamul sayısı:', yariMamulSayisi);

    // Hammadde örnekleri
    console.log('\n📦 HAMMADDELER:');
    const hammaddeler = await prisma.material.findMany({
        where: { tipi: 'HAMMADDE' },
        orderBy: { kod: 'asc' }
    });

    hammaddeler.forEach(h => {
        console.log(`   ${h.kod}: ${h.ad} (${h.birim})`);
    });

    // Yarı mamul örnekleri
    console.log('\n🔧 YARI MAMULLER:');
    const yariMamuller = await prisma.material.findMany({
        where: { tipi: 'YARI_MAMUL' },
        orderBy: { kod: 'asc' }
    });

    yariMamuller.forEach(y => {
        console.log(`   ${y.kod}: ${y.ad} (${y.birim})`);
    });

    await prisma.$disconnect();
}

test().catch(console.error); 