// fix-cost-calculation.js
// Maliyet hesaplamasını gram bazında düzelt ve ara gramajları dikkate al

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCostCalculation() {
    try {
        console.log('💰 Maliyet hesaplama sistemi düzeltiliyor...\n');

        // 1. Mevcut ürünleri ve fiyatları kontrol et
        const urunler = await prisma.urun.findMany({
            include: {
                fiyatlar: {
                    where: { aktif: true },
                    orderBy: { gecerliTarih: 'desc' },
                    take: 1
                },
                recipes: {
                    include: {
                        ingredients: true
                    }
                }
            }
        });

        console.log(`📦 Toplam ürün sayısı: ${urunler.length}`);

        // 2. Fiyatları kontrol et ve eksikleri tamamla
        console.log('\n💰 Fiyat kontrolü:');

        const fiyatListesi = {
            'UR001': 950,   // Antep Peynirli Su Böreği
            'UR002': 1600,  // Bayram Tepsisi
            'UR003': 1450,  // Cevizli Bülbül Yuvası
            'UR004': 1450,  // Cevizli Eski Usûl Dolama
            'UR005': 1400,  // Cevizli Özel Kare
            'UR006': 1400,  // Cevizli Şöbiyet
            'UR007': 1000,  // Cevizli Yaş Baklava
            'UR008': 1600,  // Doğum Günü Tepsisi
            'UR009': 1450,  // Düz Kadayıf
            'UR010': 1700,  // Fındıklı Çikolatalı Midye
            'UR011': 1650,  // Fıstık Ezmesi
            'UR012': 1450,  // Burma Kadayıf
            'UR013': 1650,  // Bülbül Yuvası
            'UR014': 1800,  // Çikolatalı Midye
            'UR015': 1650,  // Dolama
            'UR016': 1650,  // Eski Usûl Dolama
            'UR017': 1400,  // Havuç Dilimi
            'UR018': 1500,  // Fıstıklı Kurabiye
            'UR019': 1200,  // Kuru Baklava
            'UR020': 1600,  // Midye
            'UR021': 1450,  // Özel Kare
            'UR022': 1650,  // Özel Şöbiyet
            'UR023': 1450,  // Şöbiyet
            'UR024': 1700,  // Yaprak Şöbiyet
            'UR025': 1200,  // Yaş Baklava
            'UR026': 1750,  // İç Fıstık
            'UR027': 1700,  // Kare Fıstık Ezmesi
            'UR028': 1500,  // Karışık
            'UR029': 950,   // Kaymaklı Baklava
            'UR030': 950,   // Kaymaklı Havuç Dilimi
            'UR031': 1600,  // Özel Karışık
            'UR032': 1000,  // Sade Kurabiye
            'UR033': 700,   // Sade Yağ
            'UR034': 1650,  // Sargılı Fıstık Ezmesi
            'UR035': 1200,  // Soğuk Baklava
            'UR036': 900,   // Tuzlu Antep Fıstığı
            'UR037': 1600,  // Yazılı Karışık Tepsi
            'UR038': 1600   // Yılbaşı Tepsisi
        };

        for (const urun of urunler) {
            const beklenenFiyat = fiyatListesi[urun.kodu];
            const mevcutFiyat = urun.fiyatlar[0];

            if (!mevcutFiyat && beklenenFiyat) {
                // Fiyat yok, oluştur
                await prisma.fiyat.create({
                    data: {
                        urunId: urun.id,
                        fiyat: beklenenFiyat,
                        birim: 'KG',
                        gecerliTarih: new Date(),
                        aktif: true
                    }
                });
                console.log(`   ➕ ${urun.kodu} - ${beklenenFiyat}₺/KG fiyat eklendi`);
            } else if (mevcutFiyat && beklenenFiyat && mevcutFiyat.fiyat !== beklenenFiyat) {
                // Fiyat farklı, güncelle
                await prisma.fiyat.update({
                    where: { id: mevcutFiyat.id },
                    data: { fiyat: beklenenFiyat }
                });
                console.log(`   🔄 ${urun.kodu} - ${mevcutFiyat.fiyat}₺ → ${beklenenFiyat}₺/KG güncellendi`);
            } else if (mevcutFiyat) {
                console.log(`   ✅ ${urun.kodu} - ${mevcutFiyat.fiyat}₺/KG doğru`);
            }
        }

        // 3. Maliyet hesaplama fonksiyonunu test et
        console.log('\n🧮 Maliyet hesaplama testi:');

        // Örnek hesaplamalar
        const ornekHesaplamalar = [
            { gramaj: 1000, kgFiyat: 1500, beklenen: 1500 },    // 1 KG
            { gramaj: 1250, kgFiyat: 1500, beklenen: 1875 },    // 1.25 KG
            { gramaj: 500, kgFiyat: 1500, beklenen: 750 },     // 0.5 KG
            { gramaj: 750, kgFiyat: 1200, beklenen: 900 },     // 0.75 KG
            { gramaj: 2000, kgFiyat: 1000, beklenen: 2000 }     // 2 KG
        ];

        console.log('   📊 Hesaplama örnekleri:');
        ornekHesaplamalar.forEach(ornek => {
            const hesaplanan = (ornek.gramaj * ornek.kgFiyat) / 1000;
            const dogru = hesaplanan === ornek.beklenen;
            console.log(`   ${dogru ? '✅' : '❌'} ${ornek.gramaj}g × ${ornek.kgFiyat}₺/KG = ${hesaplanan}₺ (Beklenen: ${ornek.beklenen}₺)`);
        });

        // 4. Reçeteli ürünler için maliyet hesaplama
        console.log('\n📋 Reçeteli ürünler maliyet analizi:');

        const receteliUrunler = urunler.filter(u => u.recipes.length > 0);
        console.log(`   📝 Reçeteli ürün sayısı: ${receteliUrunler.length}`);

        for (const urun of receteliUrunler) {
            console.log(`\n   🍯 ${urun.ad} (${urun.kodu}):`);

            const satiFiyati = urun.fiyatlar[0]?.fiyat || 0;
            console.log(`      💰 Satış fiyatı: ${satiFiyati}₺/KG`);

            for (const recete of urun.recipes) {
                console.log(`      📋 Reçete: ${recete.name}`);

                let toplamMaliyet = 0;
                let toplamGram = 0;

                for (const malzeme of recete.ingredients) {
                    // Malzeme maliyeti (örnek değerler - gerçek maliyetler eklenecek)
                    const malzemeMaliyeti = getMalzemeMaliyeti(malzeme.stokKod);
                    const malzemeToplam = (malzeme.miktarGram * malzemeMaliyeti) / 1000; // TL cinsinden

                    toplamMaliyet += malzemeToplam;
                    toplamGram += malzeme.miktarGram;

                    console.log(`         • ${malzeme.stokKod}: ${malzeme.miktarGram}g × ${malzemeMaliyeti}₺/KG = ${malzemeToplam.toFixed(2)}₺`);
                }

                const gramMaliyeti = toplamGram > 0 ? (toplamMaliyet * 1000) / toplamGram : 0;
                const karMarji = satiFiyati > 0 ? ((satiFiyati - gramMaliyeti) / satiFiyati * 100) : 0;

                console.log(`      📊 Toplam maliyet: ${toplamMaliyet.toFixed(2)}₺ (${toplamGram}g)`);
                console.log(`      📈 Gram maliyeti: ${gramMaliyeti.toFixed(2)}₺/KG`);
                console.log(`      💹 Kar marjı: %${karMarji.toFixed(1)}`);
            }
        }

        // 5. Ara gramaj hesaplama örnekleri
        console.log('\n⚖️ Ara gramaj hesaplama örnekleri:');

        const araGramajOrnekleri = [
            { urun: 'Fıstıklı Kurabiye', kgFiyat: 1500, gramajlar: [250, 500, 750, 1000, 1250, 1500, 2000] },
            { urun: 'Baklava', kgFiyat: 1200, gramajlar: [300, 600, 900, 1200, 1500, 1800] }
        ];

        araGramajOrnekleri.forEach(ornek => {
            console.log(`\n   🍯 ${ornek.urun} (${ornek.kgFiyat}₺/KG):`);
            ornek.gramajlar.forEach(gramaj => {
                const fiyat = (gramaj * ornek.kgFiyat) / 1000;
                console.log(`      ${gramaj}g = ${fiyat}₺`);
            });
        });

        console.log('\n🎉 Maliyet hesaplama sistemi düzeltildi!');
        console.log('\n📝 Önemli Notlar:');
        console.log('   • Tüm fiyatlar KG bazında saklanıyor');
        console.log('   • Ara gramajlar için: (gramaj × kg_fiyat) / 1000 formülü kullanılıyor');
        console.log('   • Maliyet hesaplaması gram bazında yapılıyor');
        console.log('   • Kar marjı otomatik hesaplanıyor');

    } catch (error) {
        console.error('❌ Hata oluştu:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Malzeme maliyeti hesaplama (örnek değerler)
function getMalzemeMaliyeti(stokKod) {
    const malzemeMaliyetleri = {
        // Hammaddeler (₺/KG)
        'UN': 8,           // Un
        'SEKER': 12,       // Şeker
        'TEREYAG': 45,     // Tereyağı
        'YUMURTA': 25,     // Yumurta
        'SUT': 15,         // Süt
        'ANTEP_FISTIK': 180, // Antep Fıstığı
        'CEVIZ': 80,       // Ceviz
        'FINDIK': 90,      // Fındık
        'PHYLLO': 20,      // Yufka
        'SERBETLIK_SEKER': 12, // Şerbet için şeker
        'LIMON': 8,        // Limon
        'VANILYA': 150,    // Vanilya
        'KAKAO': 35,       // Kakao
        'CIKOLATA': 60,    // Çikolata
        'PEYNIR': 40,      // Peynir
        'MAYDANOZ': 15,    // Maydanoz
        'SADE_YAG': 25     // Sade Yağ
    };

    return malzemeMaliyetleri[stokKod] || 10; // Varsayılan 10₺/KG
}

fixCostCalculation(); 