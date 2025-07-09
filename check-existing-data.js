const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkExistingData() {
    console.log('📊 MEVCUT DROPDOWN VERİLERİ KONTROL EDİLİYOR...\n');

    try {
        // Sayıları al
        const counts = await prisma.$transaction([
            prisma.teslimatTuru.count(),
            prisma.tepsiTava.count(),
            prisma.kutu.count(),
            prisma.urun.count()
        ]);

        console.log('📊 MEVCUT VERİ SAYILARI:');
        console.log(`🚚 TeslimatTuru: ${counts[0]} adet`);
        console.log(`🍯 TepsiTava: ${counts[1]} adet`);
        console.log(`📦 Kutu: ${counts[2]} adet`);
        console.log(`🍯 Urun: ${counts[3]} adet\n`);

        // Teslimat türlerini listele
        const teslimatTurleri = await prisma.teslimatTuru.findMany({
            select: { kod: true, ad: true, aktif: true },
            orderBy: { kod: 'asc' }
        });

        console.log('🚚 MEVCUT TESLİMAT TÜRLERİ:');
        teslimatTurleri.forEach(t => {
            console.log(`   ${t.kod}: ${t.ad} ${t.aktif ? '✅' : '❌'}`);
        });

        // Tepsi/Tava örnekleri
        const tepsiler = await prisma.tepsiTava.findMany({
            select: { kod: true, ad: true, aktif: true },
            orderBy: { kod: 'asc' },
            take: 10
        });

        console.log('\n🍯 MEVCUT TEPSİ/TAVA ÖRNEKLERİ (İlk 10):');
        tepsiler.forEach(t => {
            console.log(`   ${t.kod}: ${t.ad} ${t.aktif ? '✅' : '❌'}`);
        });

        // Kutu örnekleri
        const kutular = await prisma.kutu.findMany({
            select: { kod: true, ad: true, aktif: true },
            orderBy: { kod: 'asc' },
            take: 10
        });

        console.log('\n📦 MEVCUT KUTU ÖRNEKLERİ (İlk 10):');
        kutular.forEach(k => {
            console.log(`   ${k.kod}: ${k.ad} ${k.aktif ? '✅' : '❌'}`);
        });

        // Ürün örnekleri
        const urunler = await prisma.urun.findMany({
            select: { kod: true, ad: true, aktif: true },
            orderBy: { kod: 'asc' },
            take: 10
        });

        console.log('\n🍯 MEVCUT ÜRÜN ÖRNEKLERİ (İlk 10):');
        urunler.forEach(u => {
            console.log(`   ${u.kod}: ${u.ad} ${u.aktif ? '✅' : '❌'}`);
        });

        console.log('\n🎯 ANALİZ:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // CSV ile karşılaştırma
        const csvTeslimatSayisi = 6;
        const csvTepsiSayisi = 12;
        const csvKutuSayisi = 15;
        const csvUrunSayisi = 38;

        console.log(`📋 CSV'de ${csvTeslimatSayisi} teslimat türü var, DB'de ${counts[0]} var`);
        console.log(`📋 CSV'de ${csvTepsiSayisi} tepsi/tava var, DB'de ${counts[1]} var`);
        console.log(`📋 CSV'de ${csvKutuSayisi} kutu var, DB'de ${counts[2]} var`);
        console.log(`📋 CSV'de ${csvUrunSayisi} ürün var, DB'de ${counts[3]} var`);

        console.log('\n💡 SONUÇ:');
        if (counts[0] < csvTeslimatSayisi) console.log('🔴 Teslimat türleri eksik - eklenmeli');
        if (counts[1] < csvTepsiSayisi) console.log('🔴 Tepsi/Tava eksik - eklenmeli');
        if (counts[2] < csvKutuSayisi) console.log('🔴 Kutu eksik - eklenmeli');
        if (counts[3] < csvUrunSayisi) console.log('🔴 Ürün eksik - eklenmeli');

        if (counts[0] >= csvTeslimatSayisi && counts[1] >= csvTepsiSayisi &&
            counts[2] >= csvKutuSayisi && counts[3] >= csvUrunSayisi) {
            console.log('✅ Tüm dropdown verileri yeterli görünüyor!');
        }

    } catch (error) {
        console.error('❌ Hata:', error);
    }

    await prisma.$disconnect();
}

checkExistingData(); 