// ===================================================================
// 🧾 REÇETELER SEED SCRIPT - FİXED VERSİON
// Raw data ile reçete ve reçete içeriklerini kaydetme
// ===================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Stok adını Material koduna eşleştirir
 */
function mapStokToMaterialKod(stokAdi) {
    const materialMap = {
        // Hammaddeler
        'SADE YAG': 'HM012',
        'ANTEP PEYNIRI': 'HM001',
        'MAYDANOZ': 'HM010',
        'FISTIK': 'HM006',
        'TOZ SEKER': 'HM017',
        'SU': 'HM014',
        'GLIKOZ': 'HM003',
        'IRMIK NO:0': 'HM004',
        'IRMIK NO:3': 'HM005',
        'YOGURT': 'HM019',
        'SODA GR': 'HM013',
        'KARAKOYUNLU UN': 'HM008',
        'KADAYIF': 'HM007',
        'CEVIZ': 'HM002',
        'TEKSIN UN': 'HM016',
        'YUMURTA': 'HM020',
        'TUZ': 'HM018',
        'NISASTA': 'HM011',
        'LIMON': 'HM009',
        'SUT': 'HM015',

        // Yarı Mamuller
        'HAMUR (YM)': 'YM001',
        'SERBET (YM)': 'YM003',
        'KAYMAK (YM)': 'YM002'
    };

    return materialMap[stokAdi] || null;
}

/**
 * Birim standardizasyonu
 */
function standardizeBirimVeMiktar(birim, miktar) {
    let standardMiktar = miktar;
    let standardBirim = 'KG';

    switch (birim) {
        case 'kg':
            standardBirim = 'KG';
            standardMiktar = miktar;
            break;
        case 'gr':
            standardBirim = 'KG';
            standardMiktar = miktar / 1000; // gram -> kg
            break;
        case 'lt':
            standardBirim = 'LITRE';
            standardMiktar = miktar;
            break;
        case 'ml':
            standardBirim = 'LITRE';
            standardMiktar = miktar / 1000; // ml -> litre
            break;
        case 'Adet':
            standardBirim = 'ADET';
            standardMiktar = miktar;
            break;
        default:
            standardBirim = 'KG';
            standardMiktar = miktar;
    }

    return { standardBirim, standardMiktar };
}

/**
 * Raw reçete datası
 */
const receteData = [
    {
        ad: 'PEYNIRLI SU BOREGI (UR)',
        kod: 'RCP001',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 6.281, fire1: 0, fire2: 0, gerMiktar: 6.281 },
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 59.296, fire1: 0, fire2: 0, gerMiktar: 59.296 },
            { stokAdi: 'ANTEP PEYNIRI', birim: 'kg', miktar: 5.678, fire1: 0, fire2: 0, gerMiktar: 5.678 },
            { stokAdi: 'MAYDANOZ', birim: 'kg', miktar: 0.603, fire1: 0, fire2: 0, gerMiktar: 0.603 } // Düzeltildi: 603 -> 0.603
        ]
    },
    {
        ad: 'EZME (UR)',
        kod: 'RCP002',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 38.168, fire1: 0, fire2: 0, gerMiktar: 38.168 },
            { stokAdi: 'TOZ SEKER', birim: 'kg', miktar: 4.771, fire1: 0, fire2: 0, gerMiktar: 4.771 },
            { stokAdi: 'SU', birim: 'lt', miktar: 23.855, fire1: 0, fire2: 0, gerMiktar: 23.855 },
            { stokAdi: 'GLIKOZ', birim: 'kg', miktar: 9.542, fire1: 0, fire2: 0, gerMiktar: 9.542 }
        ]
    },
    {
        ad: 'FISTIKLI KURABIYE',
        kod: 'RCP003',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'IRMIK NO:0', birim: 'kg', miktar: 20.305, fire1: 0, fire2: 0, gerMiktar: 20.305 },
            { stokAdi: 'TOZ SEKER', birim: 'kg', miktar: 19.459, fire1: 0, fire2: 0, gerMiktar: 19.459 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 1.692, fire1: 0, fire2: 0, gerMiktar: 1.692 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 27.496, fire1: 0, fire2: 0, gerMiktar: 27.496 },
            { stokAdi: 'YOGURT', birim: 'kg', miktar: 1.785, fire1: 0, fire2: 0, gerMiktar: 1.785 },
            { stokAdi: 'SODA GR', birim: 'kg', miktar: 0.011, fire1: 0, fire2: 0, gerMiktar: 0.011 }, // 11 gr -> 0.011 kg
            { stokAdi: 'KARAKOYUNLU UN', birim: 'kg', miktar: 13.536, fire1: 0, fire2: 0, gerMiktar: 13.536 }
        ]
    },
    {
        ad: 'SADE KURABIYE',
        kod: 'RCP004',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'KARAKOYUNLU UN', birim: 'kg', miktar: 193, fire1: 0, fire2: 0, gerMiktar: 193 },
            { stokAdi: 'IRMIK NO:0', birim: 'kg', miktar: 28.951, fire1: 0, fire2: 0, gerMiktar: 28.951 },
            { stokAdi: 'TOZ SEKER', birim: 'kg', miktar: 27.744, fire1: 0, fire2: 0, gerMiktar: 27.744 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 21.713, fire1: 0, fire2: 0, gerMiktar: 21.713 },
            { stokAdi: 'YOGURT', birim: 'kg', miktar: 2.521, fire1: 0, fire2: 0, gerMiktar: 2.521 },
            { stokAdi: 'SODA GR', birim: 'kg', miktar: 0.169, fire1: 0, fire2: 0, gerMiktar: 0.169 }, // 169 gr -> 0.169 kg
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 1.809, fire1: 0, fire2: 0, gerMiktar: 1.809 }
        ]
    },
    {
        ad: 'DOLAMA (UR)',
        kod: 'RCP005',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 14.878, fire1: 0, fire2: 0, gerMiktar: 14.878 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 26.927, fire1: 0, fire2: 0, gerMiktar: 26.927 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 44.488, fire1: 0, fire2: 0, gerMiktar: 44.488 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 2.439, fire1: 0, fire2: 0, gerMiktar: 2.439 }
        ]
    },
    {
        ad: 'BURMA KADAYIF (UR)',
        kod: 'RCP006',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 32.799, fire1: 0, fire2: 0, gerMiktar: 32.778 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 33.507, fire1: 0, fire2: 0, gerMiktar: 33.507 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 33.299, fire1: 0, fire2: 0, gerMiktar: 33.299 },
            { stokAdi: 'KADAYIF', birim: 'kg', miktar: 27.263, fire1: 0, fire2: 0, gerMiktar: 27.263 }
        ]
    },
    {
        ad: 'MIDYE (UR)',
        kod: 'RCP007',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 16.256, fire1: 0, fire2: 0, gerMiktar: 16.256 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 17.241, fire1: 0, fire2: 0, gerMiktar: 17.241 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 35.961, fire1: 0, fire2: 0, gerMiktar: 35.961 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 24.631, fire1: 0, fire2: 0, gerMiktar: 24.631 },
            { stokAdi: 'KAYMAK (YM)', birim: 'kg', miktar: 10.345, fire1: 0.06, fire2: 0, gerMiktar: 10.985 }
        ]
    },
    {
        ad: 'HAVUC DILIMI (UR)',
        kod: 'RCP008',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 25.321, fire1: 0, fire2: 0, gerMiktar: 25.321 },
            { stokAdi: 'KAYMAK (YM)', birim: 'kg', miktar: 13.991, fire1: 0.06, fire2: 0, gerMiktar: 14.862 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 48.028, fire1: 0, fire2: 0, gerMiktar: 48.028 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 16.514, fire1: 0, fire2: 0, gerMiktar: 16.514 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 25.229, fire1: 0, fire2: 0, gerMiktar: 25.229 }
        ]
    },
    {
        ad: 'SOBIYET (UR)',
        kod: 'RCP009',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 18.894, fire1: 0, fire2: 0, gerMiktar: 18.894 },
            { stokAdi: 'KAYMAK (YM)', birim: 'kg', miktar: 11.779, fire1: 0.06, fire2: 0, gerMiktar: 12.548 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 27.933, fire1: 0, fire2: 0, gerMiktar: 27.933 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 20.288, fire1: 0, fire2: 0, gerMiktar: 20.288 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 24.038, fire1: 0, fire2: 0, gerMiktar: 24.038 }
        ]
    },
    {
        ad: 'BULBUL YUVASI (UR)',
        kod: 'RCP010',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 24.839, fire1: 0, fire2: 0, gerMiktar: 24.839 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 32.258, fire1: 0, fire2: 0, gerMiktar: 32.258 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 17.742, fire1: 0, fire2: 0, gerMiktar: 17.742 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 32.258, fire1: 0, fire2: 0, gerMiktar: 32.258 }
        ]
    },
    {
        ad: 'OZEL KARE BAKLAVA (UR)',
        kod: 'RCP011',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 24.019, fire1: 0, fire2: 0, gerMiktar: 24.019 },
            { stokAdi: 'KAYMAK (YM)', birim: 'kg', miktar: 12.025, fire1: 0.06, fire2: 0, gerMiktar: 12.798 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 26.028, fire1: 0, fire2: 0, gerMiktar: 26.028 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 18.362, fire1: 0, fire2: 0, gerMiktar: 18.362 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 24.389, fire1: 0, fire2: 0, gerMiktar: 24.389 }
        ]
    },
    {
        ad: 'FISTIKLI KURU BAKLAVA (UR)',
        kod: 'RCP012',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 33.516, fire1: 0, fire2: 0, gerMiktar: 33.516 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 25.089, fire1: 0, fire2: 0, gerMiktar: 25.089 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 10.953, fire1: 0, fire2: 0, gerMiktar: 10.953 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 3.854, fire1: 0, fire2: 0, gerMiktar: 3.854 }
        ]
    },
    {
        ad: 'FISTIKLI YAS BAKLAVA (UR)',
        kod: 'RCP013',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 29.443, fire1: 0, fire2: 0, gerMiktar: 29.443 },
            { stokAdi: 'KAYMAK (YM)', birim: 'kg', miktar: 12.153, fire1: 0.06, fire2: 0, gerMiktar: 12.925 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 2.204, fire1: 0, fire2: 0, gerMiktar: 2.204 },
            { stokAdi: 'FISTIK', birim: 'kg', miktar: 9.621, fire1: 0, fire2: 0, gerMiktar: 9.621 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 33.856, fire1: 0, fire2: 0, gerMiktar: 33.856 }
        ]
    },
    {
        ad: 'CEVIZLI BAKLAVA (UR)',
        kod: 'RCP014',
        tip: 'URUN',
        malzemeler: [
            { stokAdi: 'HAMUR (YM)', birim: 'kg', miktar: 29.443, fire1: 0, fire2: 0, gerMiktar: 29.443 },
            { stokAdi: 'KAYMAK (YM)', birim: 'kg', miktar: 12.153, fire1: 0.06, fire2: 0, gerMiktar: 12.925 },
            { stokAdi: 'SADE YAG', birim: 'kg', miktar: 2.204, fire1: 0, fire2: 0, gerMiktar: 2.204 },
            { stokAdi: 'CEVIZ', birim: 'kg', miktar: 9.621, fire1: 0, fire2: 0, gerMiktar: 9.621 },
            { stokAdi: 'SERBET (YM)', birim: 'kg', miktar: 33.856, fire1: 0, fire2: 0, gerMiktar: 33.856 }
        ]
    },
    // Yarı Mamuller
    {
        ad: 'HAMUR (YM)',
        kod: 'YM_RCP001',
        tip: 'YARI_MAMUL',
        malzemeler: [
            { stokAdi: 'KARAKOYUNLU UN', birim: 'gr', miktar: 339, fire1: 0, fire2: 0, gerMiktar: 339 },
            { stokAdi: 'TEKSIN UN', birim: 'gr', miktar: 339, fire1: 0, fire2: 0, gerMiktar: 339 },
            { stokAdi: 'YUMURTA', birim: 'Adet', miktar: 2.5, fire1: 0, fire2: 0, gerMiktar: 2.5 },
            { stokAdi: 'SU', birim: 'ml', miktar: 185, fire1: 0, fire2: 0, gerMiktar: 185 },
            { stokAdi: 'TUZ', birim: 'gr', miktar: 7, fire1: 0, fire2: 0, gerMiktar: 7 },
            { stokAdi: 'NISASTA', birim: 'gr', miktar: 222, fire1: 0, fire2: 0, gerMiktar: 222 }
        ]
    },
    {
        ad: 'SERBET (YM)',
        kod: 'YM_RCP002',
        tip: 'YARI_MAMUL',
        malzemeler: [
            { stokAdi: 'TOZ SEKER', birim: 'kg', miktar: 84.842, fire1: 0, fire2: 0, gerMiktar: 84.842 },
            { stokAdi: 'SU', birim: 'lt', miktar: 20.645, fire1: 0, fire2: 0, gerMiktar: 20.645 },
            { stokAdi: 'LIMON', birim: 'kg', miktar: 0.209, fire1: 0, fire2: 0, gerMiktar: 0.209 } // 209 -> 0.209 kg
        ]
    },
    {
        ad: 'KAYMAK (YM)',
        kod: 'YM_RCP003',
        tip: 'YARI_MAMUL',
        malzemeler: [
            { stokAdi: 'IRMIK NO:3', birim: 'kg', miktar: 8.957, fire1: 0, fire2: 0, gerMiktar: 8.957 },
            { stokAdi: 'SUT', birim: 'lt', miktar: 91.357, fire1: 0, fire2: 0, gerMiktar: 91.357 }
        ]
    }
];

/**
 * Ana seed fonksiyonu
 */
async function main() {
    console.log('🧾 REÇETELER FIXED SEED İŞLEMİ BAŞLIYOR...\n');

    let toplamRecete = 0;
    let toplamMalzeme = 0;
    let hatalanRecete = 0;

    try {
        // Mevcut reçete ve içerikleri temizle (isteğe bağlı)
        console.log('🗑️  Mevcut reçete verilerini temizleniyor...');
        await prisma.recipeIngredient.deleteMany({});
        await prisma.recipe.deleteMany({});
        console.log('✅ Temizleme tamamlandı\n');

        // Her reçeteyi işle
        for (const recete of receteData) {
            try {
                console.log(`📝 ${recete.ad} (${recete.kod}) işleniyor...`);

                // Reçeteyi oluştur
                const savedRecipe = await prisma.recipe.create({
                    data: {
                        ad: recete.ad,
                        kod: recete.kod,
                        aciklama: `${recete.ad} reçetesi`,
                        aktif: true,
                        test: false,
                        versiyon: '1.0',
                        toplamMaliyet: 0,
                        birimMaliyet: 0
                    }
                });

                toplamRecete++;
                let receteMaliyet = 0;
                let malzemeBasarili = 0;

                // Malzemeleri ekle
                for (const malzeme of recete.malzemeler) {
                    try {
                        const materialKod = mapStokToMaterialKod(malzeme.stokAdi);

                        if (!materialKod) {
                            console.log(`      ⚠️  ${malzeme.stokAdi} için material mapping bulunamadı`);
                            continue;
                        }

                        // Material'ı bul
                        const material = await prisma.material.findUnique({
                            where: { kod: materialKod }
                        });

                        if (!material) {
                            console.log(`      ⚠️  Material bulunamadı: ${materialKod}`);
                            continue;
                        }

                        // Birim ve miktar standardizasyonu
                        const { standardBirim, standardMiktar } = standardizeBirimVeMiktar(malzeme.birim, malzeme.miktar);
                        const { standardMiktar: standardGerMiktar } = standardizeBirimVeMiktar(malzeme.birim, malzeme.gerMiktar);

                        // Malzeme maliyeti hesapla
                        const malzemeMaliyeti = standardGerMiktar * (material.birimFiyat || 0);
                        receteMaliyet += malzemeMaliyeti;

                        // RecipeIngredient oluştur
                        await prisma.recipeIngredient.create({
                            data: {
                                recipeId: savedRecipe.id,
                                materialId: material.id,
                                miktar: standardMiktar,
                                birim: standardBirim,
                                fire1: malzeme.fire1,
                                fire2: malzeme.fire2,
                                gerMiktar: standardGerMiktar,
                                sonFiyat: material.birimFiyat || 0,
                                maliyet: malzemeMaliyeti,
                                zorunlu: true
                            }
                        });

                        malzemeBasarili++;
                        toplamMalzeme++;
                        console.log(`      ✅ ${malzeme.stokAdi} -> ${materialKod} (${standardMiktar} ${standardBirim})`);

                    } catch (error) {
                        console.error(`      ❌ ${malzeme.stokAdi} eklenirken hata:`, error.message);
                    }
                }

                // Reçete toplam maliyetini güncelle
                await prisma.recipe.update({
                    where: { id: savedRecipe.id },
                    data: {
                        toplamMaliyet: receteMaliyet,
                        birimMaliyet: receteMaliyet,
                        guncellemeTarihi: new Date()
                    }
                });

                console.log(`      💰 Toplam maliyet: ${receteMaliyet.toFixed(2)} TL`);
                console.log(`      📦 ${malzemeBasarili}/${recete.malzemeler.length} malzeme başarılı\n`);

            } catch (error) {
                console.error(`❌ ${recete.ad} kaydedilirken hata:`, error.message);
                hatalanRecete++;
            }
        }

        // Final özet
        console.log('🎉 REÇETELER FIXED SEED İŞLEMİ TAMAMLANDI!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Başarılı reçete: ${toplamRecete}`);
        console.log(`✅ Başarılı malzeme bağlantısı: ${toplamMalzeme}`);
        console.log(`❌ Hatalanan reçete: ${hatalanRecete}`);
        console.log(`📋 Ürün reçeteleri: ${receteData.filter(r => r.tip === 'URUN').length}`);
        console.log(`🔧 Yarı mamul reçeteleri: ${receteData.filter(r => r.tip === 'YARI_MAMUL').length}`);
        console.log(`💰 Maliyet hesaplamaları tamamlandı`);

    } catch (error) {
        console.error('❌ Fatal Hata:', error);
        process.exit(1);
    }
}

// Script'i çalıştır
main()
    .catch((e) => {
        console.error('❌ Fatal Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 