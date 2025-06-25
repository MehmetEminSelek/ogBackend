const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 DATABASE İÇERİK KONTROLÜ\n');

    try {
        // Şubeler
        const subeler = await prisma.sube.findMany();
        console.log(`📍 Şubeler: ${subeler.length} adet`);
        subeler.forEach(sube => console.log(`   • ${sube.kod} - ${sube.ad}`));

        // Teslimat Türleri
        const teslimatTurleri = await prisma.teslimatTuru.findMany();
        console.log(`\n🚚 Teslimat Türleri: ${teslimatTurleri.length} adet`);
        teslimatTurleri.forEach(tt => console.log(`   • ${tt.kod} - ${tt.ad} (${tt.ekstraMaliyet} TL)`));

        // Hammaddeler
        const hammaddeler = await prisma.material.findMany({
            where: { tipi: 'HAMMADDE' }
        });
        console.log(`\n🥜 Hammaddeler: ${hammaddeler.length} adet`);
        hammaddeler.slice(0, 5).forEach(h => console.log(`   • ${h.kod} - ${h.ad} (${h.birimFiyat} TL/${h.birim})`));
        if (hammaddeler.length > 5) console.log(`   ... ve ${hammaddeler.length - 5} tane daha`);

        // Yarı Mamuller
        const yariMamuller = await prisma.material.findMany({
            where: { tipi: 'YARI_MAMUL' }
        });
        console.log(`\n🥄 Yarı Mamuller: ${yariMamuller.length} adet`);
        yariMamuller.forEach(ym => console.log(`   • ${ym.kod} - ${ym.ad} (${ym.birimFiyat} TL/${ym.birim})`));

        // Kategoriler
        const kategoriler = await prisma.urunKategori.findMany();
        console.log(`\n📦 Ürün Kategorileri: ${kategoriler.length} adet`);
        kategoriler.forEach(kat => console.log(`   • ${kat.kod} - ${kat.ad}`));

        // Ürünler
        const urunler = await prisma.urun.findMany();
        console.log(`\n🍯 Ürünler: ${urunler.length} adet`);
        urunler.slice(0, 5).forEach(urun => console.log(`   • ${urun.kod} - ${urun.ad}`));
        if (urunler.length > 5) console.log(`   ... ve ${urunler.length - 5} tane daha`);

        // Fiyatlar
        const fiyatlar = await prisma.fiyat.findMany();
        console.log(`\n💰 Fiyatlar: ${fiyatlar.length} adet`);

        // Tepsi/Tava
        const tepsiTavalar = await prisma.tepsiTava.findMany();
        console.log(`\n🍽️ Tepsi/Tava: ${tepsiTavalar.length} adet`);
        tepsiTavalar.slice(0, 3).forEach(tt => console.log(`   • ${tt.kod} - ${tt.ad} (${tt.fiyat} TL)`));
        if (tepsiTavalar.length > 3) console.log(`   ... ve ${tepsiTavalar.length - 3} tane daha`);

        // Kutular
        const kutular = await prisma.kutu.findMany();
        console.log(`\n📦 Kutular: ${kutular.length} adet`);
        kutular.slice(0, 3).forEach(kutu => console.log(`   • ${kutu.kod} - ${kutu.ad} (${kutu.fiyat} TL)`));
        if (kutular.length > 3) console.log(`   ... ve ${kutular.length - 3} tane daha`);

        // Ambalajlar
        const ambalajlar = await prisma.ambalaj.findMany();
        console.log(`\n📦 Ambalajlar: ${ambalajlar.length} adet`);
        ambalajlar.forEach(amb => console.log(`   • ${amb.kod} - ${amb.ad} (${amb.fiyat} TL)`));

        console.log(`\n🎉 TOPLAM VERİ ÖZETİ:`);
        console.log(`   • ${subeler.length} şube/operasyon birimi`);
        console.log(`   • ${teslimatTurleri.length} teslimat türü`);
        console.log(`   • ${hammaddeler.length} hammadde`);
        console.log(`   • ${yariMamuller.length} yarı mamul`);
        console.log(`   • ${kategoriler.length} ürün kategorisi`);
        console.log(`   • ${urunler.length} ürün`);
        console.log(`   • ${fiyatlar.length} fiyat`);
        console.log(`   • ${tepsiTavalar.length} tepsi/tava`);
        console.log(`   • ${kutular.length} kutu`);
        console.log(`   • ${ambalajlar.length} ambalaj türü`);

    } catch (error) {
        console.error('❌ Hata:', error);
    }
}

main()
    .catch((e) => {
        console.error('❌ Script hatası:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 