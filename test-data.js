const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('🔍 Veritabanı kontrol ediliyor...\n');

    // Ürün sayısını kontrol et
    const urunSayisi = await prisma.urun.count();
    console.log('✅ Toplam ürün sayısı:', urunSayisi);

    // Fiyat sayısını kontrol et
    const fiyatSayisi = await prisma.urunFiyat.count();
    console.log('✅ Toplam ürün fiyatı sayısı:', fiyatSayisi);

    // Tepsi sayısını kontrol et
    const tepsiSayisi = await prisma.tepsiTava.count();
    console.log('✅ Toplam tepsi/tava sayısı:', tepsiSayisi);

    // Tepsi fiyat sayısını kontrol et
    const tepsiFiyatSayisi = await prisma.tepsiFiyat.count();
    console.log('✅ Toplam tepsi fiyatı sayısı:', tepsiFiyatSayisi);

    // Örnek bir ürün ve fiyatını göster
    const ornek = await prisma.urun.findFirst({
        include: {
            fiyatlar: {
                where: { aktif: true },
                orderBy: { baslangicTarihi: 'desc' }
            }
        }
    });

    if (ornek) {
        console.log('\n🎯 Örnek ürün:');
        console.log('   Ürün:', ornek.ad, '(' + ornek.kod + ')');
        if (ornek.fiyatlar[0]) {
            console.log('   Güncel fiyat:', ornek.fiyatlar[0].kgFiyati, 'TL/KG');
            console.log('   Geçerlik tarihi:', ornek.fiyatlar[0].baslangicTarihi.toLocaleDateString('tr-TR'));
            console.log('   Sebep:', ornek.fiyatlar[0].degisiklikSebebi);
        }
    }

    // Tepsi örneği
    const ornekTepsi = await prisma.tepsiTava.findFirst({
        include: {
            fiyatlar: {
                where: { aktif: true },
                orderBy: { baslangicTarihi: 'desc' }
            }
        }
    });

    if (ornekTepsi) {
        console.log('\n🥤 Örnek tepsi:');
        console.log('   Tepsi:', ornekTepsi.ad, '(' + ornekTepsi.kod + ')');
        if (ornekTepsi.fiyatlar[0]) {
            console.log('   Güncel fiyat:', ornekTepsi.fiyatlar[0].adetFiyati, 'TL/Adet');
            console.log('   Geçerlik tarihi:', ornekTepsi.fiyatlar[0].baslangicTarihi.toLocaleDateString('tr-TR'));
        }
    }

    console.log('\n🎉 Test tamamlandı!');
    await prisma.$disconnect();
}

test().catch(console.error); 