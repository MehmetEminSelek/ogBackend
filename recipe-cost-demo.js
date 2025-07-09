const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function demo() {
    console.log('🧾 REÇETE VE MALİYET DEMO\n');

    try {
        // 1. Genel İstatistikler
        const stats = await prisma.$transaction([
            prisma.recipe.count(),
            prisma.recipeIngredient.count(),
            prisma.material.count(),
            prisma.urun.count()
        ]);

        console.log('📊 SİSTEM İSTATİSTİKLERİ:');
        console.log(`   📋 Toplam reçete: ${stats[0]}`);
        console.log(`   📦 Toplam malzeme bağlantısı: ${stats[1]}`);
        console.log(`   🧱 Toplam material: ${stats[2]}`);
        console.log(`   🍯 Toplam ürün: ${stats[3]}\n`);

        // 2. Örnek bir reçeteyi detaylı göster
        const ornekRecete = await prisma.recipe.findFirst({
            where: { kod: 'RCP005' }, // DOLAMA
            include: {
                icerikelek: {
                    include: {
                        material: {
                            select: { ad: true, kod: true, birimFiyat: true, kategori: true }
                        }
                    }
                }
            }
        });

        if (ornekRecete) {
            console.log('🎯 ÖRNEK REÇETE DETAYI:');
            console.log(`📝 ${ornekRecete.ad} (${ornekRecete.kod})`);
            console.log(`💰 Toplam Maliyet: ${ornekRecete.toplamMaliyet.toFixed(2)} TL/KG`);
            console.log(`📅 Son Güncelleme: ${ornekRecete.guncellemeTarihi || 'Bilinmiyor'}`);
            console.log(`✅ Aktif: ${ornekRecete.aktif ? 'Evet' : 'Hayır'}\n`);

            console.log('📦 MALZEMELER:');
            console.log('━'.repeat(60));

            let toplamMaliyet = 0;
            ornekRecete.icerikelek.forEach((ing, index) => {
                const material = ing.material;
                const maliyetSatiri = `${ing.gerMiktar} ${ing.birim} × ${material.birimFiyat} TL = ${ing.maliyet.toFixed(2)} TL`;

                console.log(`${index + 1}. ${material.ad} (${material.kod})`);
                console.log(`   📊 ${maliyetSatiri}`);
                console.log(`   🏷️  Kategori: ${material.kategori}`);
                if (ing.fire1 > 0) {
                    console.log(`   🔥 Fire: %${(ing.fire1 * 100).toFixed(1)}`);
                }
                console.log('');

                toplamMaliyet += ing.maliyet;
            });

            console.log('━'.repeat(60));
            console.log(`💰 TOPLAM MALİYET: ${toplamMaliyet.toFixed(2)} TL/KG\n`);

            // 3. Bu ürünün satış fiyatı ile karşılaştır
            const dolama = await prisma.urun.findFirst({
                where: {
                    OR: [
                        { ad: { contains: 'Dolama' } },
                        { ad: { contains: 'DOLAMA' } }
                    ]
                },
                include: {
                    fiyatlar: {
                        where: { aktif: true },
                        orderBy: { baslangicTarihi: 'desc' },
                        take: 1
                    }
                }
            });

            if (dolama && dolama.fiyatlar[0]) {
                const satisFiyati = dolama.fiyatlar[0].kgFiyati;
                const karMarji = satisFiyati - toplamMaliyet;
                const karOrani = (karMarji / satisFiyati) * 100;

                console.log('📈 KARLILIK ANALİZİ:');
                console.log(`🏷️  Satış Fiyatı: ${satisFiyati} TL/KG`);
                console.log(`🧮 Üretim Maliyeti: ${toplamMaliyet.toFixed(2)} TL/KG`);
                console.log(`📊 Kar Marjı: ${karMarji.toFixed(2)} TL/KG`);
                console.log(`📈 Kar Oranı: %${karOrani.toFixed(1)}`);

                if (karOrani < 20) {
                    console.log(`⚠️  DİKKAT: Kar oranı düşük!`);
                } else if (karOrani > 50) {
                    console.log(`✅ Kar oranı çok iyi!`);
                } else {
                    console.log(`✅ Kar oranı normal seviyede.`);
                }
                console.log('');
            }
        }

        // 4. En maliyetli ve en ucuz reçeteleri göster
        const pahalirReceteler = await prisma.recipe.findMany({
            where: { toplamMaliyet: { gt: 0 } },
            orderBy: { toplamMaliyet: 'desc' },
            take: 3,
            select: { ad: true, kod: true, toplamMaliyet: true }
        });

        const ucuzReceteler = await prisma.recipe.findMany({
            where: { toplamMaliyet: { gt: 0 } },
            orderBy: { toplamMaliyet: 'asc' },
            take: 3,
            select: { ad: true, kod: true, toplamMaliyet: true }
        });

        console.log('🔴 EN MALİYETLİ REÇETELER:');
        pahalirReceteler.forEach((r, i) => {
            console.log(`${i + 1}. ${r.ad}: ${r.toplamMaliyet.toFixed(2)} TL/KG`);
        });

        console.log('\n🟢 EN UCUZ REÇETELER:');
        ucuzReceteler.forEach((r, i) => {
            console.log(`${i + 1}. ${r.ad}: ${r.toplamMaliyet.toFixed(2)} TL/KG`);
        });

        // 5. Yarı mamul reçeteleri
        const yariMamuller = await prisma.recipe.findMany({
            where: { kod: { startsWith: 'YM_RCP' } },
            include: {
                icerikelek: {
                    include: {
                        material: { select: { ad: true, birimFiyat: true } }
                    }
                }
            }
        });

        console.log('\n🔧 YARI MAMUL REÇETELERİ:');
        yariMamuller.forEach(ym => {
            console.log(`📝 ${ym.ad} (${ym.kod})`);
            console.log(`   💰 Maliyet: ${ym.toplamMaliyet.toFixed(2)} TL/KG`);
            console.log(`   📦 Malzeme sayısı: ${ym.icerikelek.length}`);
        });

        console.log('\n🎉 Demo tamamlandı!');

    } catch (error) {
        console.error('❌ Hata:', error);
    }

    await prisma.$disconnect();
}

demo(); 