const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('🧾 Reçeteler ve Maliyet Sistemi Test Ediliyor...\n');

    // 1. Toplam reçete sayısı
    const toplamRecete = await prisma.recipe.count();
    console.log(`✅ Toplam reçete sayısı: ${toplamRecete}`);

    // 2. Reçete türleri
    const urunReceteler = await prisma.recipe.findMany({
        where: {
            kod: { startsWith: 'RCP' }
        }
    });

    const yariMamulReceteler = await prisma.recipe.findMany({
        where: {
            kod: { startsWith: 'YM_RCP' }
        }
    });

    console.log(`📋 Ürün reçeteleri: ${urunReceteler.length}`);
    console.log(`🔧 Yarı mamul reçeteleri: ${yariMamulReceteler.length}`);

    // 3. Örnek reçete detayı
    console.log('\n📝 ÖRNEK REÇETE DETAYI:');
    const ornekRecete = await prisma.recipe.findFirst({
        where: { kod: 'RCP001' },
        include: {
            icerikelek: {
                include: {
                    material: {
                        select: { ad: true, kod: true, birimFiyat: true }
                    }
                }
            }
        }
    });

    if (ornekRecete) {
        console.log(`🎯 ${ornekRecete.ad} (${ornekRecete.kod})`);
        console.log(`   📄 Açıklama: ${ornekRecete.aciklama}`);
        console.log(`   💰 Toplam maliyet: ${ornekRecete.toplamMaliyet} TL`);
        console.log(`   🔗 Malzeme sayısı: ${ornekRecete.icerikelek.length}`);

        console.log('\n   📦 MALZEMELER:');
        ornekRecete.icerikelek.forEach(ingredient => {
            console.log(`      • ${ingredient.material.ad} (${ingredient.material.kod})`);
            console.log(`        Miktar: ${ingredient.miktar} ${ingredient.birim}`);
            console.log(`        Fire: %${(ingredient.fire1 * 100).toFixed(1)}`);
            console.log(`        Ger. Miktar: ${ingredient.gerMiktar} ${ingredient.birim}`);
            console.log(`        Birim Fiyat: ${ingredient.material.birimFiyat} TL`);
            console.log(`        Maliyet: ${ingredient.maliyet} TL\n`);
        });
    }

    // 4. Material fiyatlarını sample olarak ayarla ve maliyet hesapla
    console.log('💰 SAMPLE FİYATLAR İLE MALİYET HESAPLAması:');

    // Bazı malzemelere sample fiyat ver
    const sampleFiyatlar = [
        { kod: 'HM001', fiyat: 45 },  // ANTEP PEYNİRİ
        { kod: 'HM002', fiyat: 80 },  // CEVİZ  
        { kod: 'HM006', fiyat: 120 }, // İÇ FISTIK
        { kod: 'HM012', fiyat: 25 },  // SADEYAĞ
        { kod: 'HM017', fiyat: 8 },   // TOZ ŞEKER
        { kod: 'YM001', fiyat: 15 },  // HAMUR (YM)
        { kod: 'YM002', fiyat: 20 },  // KAYMAK (YM) 
        { kod: 'YM003', fiyat: 12 }   // SERBET (YM)
    ];

    for (const fiyat of sampleFiyatlar) {
        await prisma.material.update({
            where: { kod: fiyat.kod },
            data: { birimFiyat: fiyat.fiyat }
        });
    }

    console.log('   ✅ Sample fiyatlar ayarlandı');

    // 5. Belirli bir reçetenin maliyetini yeniden hesapla
    const testRecete = await prisma.recipe.findFirst({
        where: { kod: 'RCP005' }, // DOLAMA
        include: {
            icerikelek: {
                include: {
                    material: true
                }
            }
        }
    });

    if (testRecete) {
        let yeniMaliyet = 0;

        console.log(`\n🧮 ${testRecete.ad} MALİYET HESAPLAMA:`);

        for (const ingredient of testRecete.icerikelek) {
            const malzemeMaliyeti = ingredient.gerMiktar * ingredient.material.birimFiyat;
            yeniMaliyet += malzemeMaliyeti;

            // Ingredient maliyetini güncelle
            await prisma.recipeIngredient.update({
                where: { id: ingredient.id },
                data: {
                    sonFiyat: ingredient.material.birimFiyat,
                    maliyet: malzemeMaliyeti
                }
            });

            console.log(`   • ${ingredient.material.ad}: ${ingredient.gerMiktar} kg × ${ingredient.material.birimFiyat} TL = ${malzemeMaliyeti.toFixed(2)} TL`);
        }

        // Reçete toplam maliyetini güncelle
        await prisma.recipe.update({
            where: { id: testRecete.id },
            data: {
                toplamMaliyet: yeniMaliyet,
                birimMaliyet: yeniMaliyet,
                guncellemeTarihi: new Date()
            }
        });

        console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`   💰 TOPLAM MALİYET: ${yeniMaliyet.toFixed(2)} TL/KG`);

        // Ürün satış fiyatı ile karşılaştır
        const urun = await prisma.urun.findFirst({
            where: { ad: { contains: 'Dolama' } },
            include: {
                fiyatlar: {
                    where: { aktif: true },
                    orderBy: { baslangicTarihi: 'desc' },
                    take: 1
                }
            }
        });

        if (urun && urun.fiyatlar[0]) {
            const satisFiyati = urun.fiyatlar[0].kgFiyati;
            const karMarji = satisFiyati - yeniMaliyet;
            const karOrani = (karMarji / satisFiyati) * 100;

            console.log(`   🏷️  Satış Fiyatı: ${satisFiyati} TL/KG`);
            console.log(`   📈 Kar Marjı: ${karMarji.toFixed(2)} TL/KG`);
            console.log(`   📊 Kar Oranı: %${karOrani.toFixed(1)}`);
        }
    }

    console.log('\n🎉 Test tamamlandı!');
    await prisma.$disconnect();
}

test().catch(console.error); 