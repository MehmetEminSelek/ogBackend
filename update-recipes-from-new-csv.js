const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Doğru CSV parsing fonksiyonu
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }

    result.push(current);
    return result;
}

function parseRecipeCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const recipes = [];
    let currentRecipe = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // CSV parsing - tırnak işaretli değerleri doğru şekilde ayrıştır
        const cols = parseCSVLine(line);

        // Reçete başlığı tespiti - (UR) veya (YM) içeren ve diğer sütunları boş olan satırlar
        const isRecipeHeader = cols[0] &&
            (cols[0].includes('(UR)') || cols[0].includes('(YM)') ||
                cols[0].includes('KURABIYE') || cols[0].includes('HAMUR') ||
                cols[0].includes('SERBET') || cols[0].includes('KAYMAK')) &&
            (!cols[1] || cols[1] === '') && (!cols[2] || cols[2] === '');

        if (isRecipeHeader) {
            // Önceki reçeteyi kaydet
            if (currentRecipe && currentRecipe.ingredients.length > 0) {
                recipes.push(currentRecipe);
            }

            const recipeName = cols[0].replace('(UR)', '').replace('(YM)', '').trim();
            currentRecipe = {
                name: recipeName,
                ingredients: [],
                type: cols[0].includes('(YM)') ? 'YM' : 'UR'
            };
        }
        // Header satırını atla
        else if (cols[0] === 'Stok Adı') {
            continue;
        }
        // Malzeme satırı - Net Miktar değeri olan satırlar
        else if (currentRecipe && cols[0] && cols[1] && cols[2] &&
            cols[0] !== 'Stok Adı' &&
            !cols[0].includes('Fire') &&
            cols[0] !== '' &&
            !isNaN(parseFloat(cols[2]))) {

            const materialName = cols[0].trim();
            const unit = cols[1].trim();
            const netMiktar = parseFloat(cols[2]) || 0;
            const fire1 = cols[3] ? parseFloat(cols[3].replace('%', '')) / 100 : 0;
            const fire2 = cols[4] ? parseFloat(cols[4].replace('%', '')) / 100 : 0;
            const gerMiktar = parseFloat(cols[5]) || netMiktar;
            const gerMiktarTB = parseFloat(cols[6]) || gerMiktar;
            const sonFiyat = parseFloat(cols[7]) || 0;
            const maliyet = parseFloat(cols[8]) || 0;

            currentRecipe.ingredients.push({
                materialName: materialName,
                unit: unit,
                netMiktar: netMiktar,
                fire1: fire1,
                fire2: fire2,
                gerMiktar: gerMiktar,
                gerMiktarTB: gerMiktarTB,
                sonFiyat: sonFiyat,
                maliyet: maliyet
            });
        }
    }

    // Son reçeteyi ekle
    if (currentRecipe && currentRecipe.ingredients.length > 0) {
        recipes.push(currentRecipe);
    }

    return recipes;
}

// Malzeme adı mapping (CSV'den database'e)
function mapMaterialName(csvName) {
    const mapping = {
        'SADE YAG': 'SADEYAĞ',
        'FISTIK': 'İÇ FISTIK',
        'TOZ SEKER': 'TOZ ŞEKER',
        'GLIKOZ': 'GLİKOZ',
        'YOGURT': 'YOĞURT',
        'KARAKOYUNLU UN': 'KARAKOYUNLU UN',
        'TEKSIN UN': 'TEKSİN UN',
        'YUMURTA': 'YUMURTA',
        'SU': 'SU',
        'TUZ': 'TUZ',
        'NISASTA': 'NIŞASTA',
        'LIMON': 'LİMON',
        'SUT': 'SÜT',
        'CEVIZ': 'CEVİZ',
        'KADAYIF': 'KADAYIF',
        'MAYDANOZ': 'MAYDANOZ',
        'ANTEP PEYNIRI': 'ANTEP PEYNİRİ',
        'SODA GR': 'SODA GR',
        'IRMIK NO:0': 'IRMIK NO:0',
        'IRMIK NO:3': 'IRMIK NO:3'
    };

    return mapping[csvName.toUpperCase()] || csvName;
}

// Birim dönüşümü - CSV'den database'e
function convertToKgAndBirim(amount, unit) {
    const unitLower = unit.toLowerCase();

    switch (unitLower) {
        case 'gr':
            return { miktar: amount / 1000, birim: 'KG' };
        case 'kg':
            return { miktar: amount, birim: 'KG' };
        case 'ml':
            return { miktar: amount / 1000, birim: 'LITRE' };
        case 'lt':
            return { miktar: amount, birim: 'LITRE' };
        case 'adet':
            return { miktar: amount * 0.05, birim: 'KG' }; // 1 yumurta = 50g
        default:
            console.log(`⚠️  Bilinmeyen birim: ${unit}, KG olarak ayarlanıyor`);
            return { miktar: amount, birim: 'KG' };
    }
}

// Reçete adı mapping (CSV'den database'e)
function mapRecipeName(csvName) {
    const mapping = {
        'PEYNIRLI SU BOREGI': 'HAMUR_2', // Peynirli su böreği hamur_2'ye benziyorsa
        'EZME': 'EZME_3',
        'FISTIKLI KURABIYE': 'KURABIYE_4',
        'SADE KURABIYE': 'KURABIYE_5',
        'DOLAMA': 'DOLAMA_6',
        'BURMA KADAYIF': 'BURMA KADAYIF_7',
        'MIDYE': 'MIDYE_9',
        'HAVUC DILIMI': 'BAKLAVA_11',
        'SOBIYET': 'BAKLAVA_12',
        'BULBUL YUVASI': 'BAKLAVA_13',
        'OZEL KARE BAKLAVA': 'BAKLAVA_14',
        'FISTIKLI KURU BAKLAVA': 'BAKLAVA_15',
        'FISTIKLI YAS BAKLAVA': 'BAKLAVA_16',
        'CEVIZLI BAKLAVA': 'BAKLAVA_17',
        'HAMUR': 'HAMUR_2',
        'SERBET': 'SERBET_8',
        'KAYMAK': 'KAYMAK_10'
    };

    // Mapping'de bulunmazsa, ortak kelimeler arayalım
    const found = Object.keys(mapping).find(key =>
        key.toUpperCase().includes(csvName.toUpperCase()) ||
        csvName.toUpperCase().includes(key.toUpperCase())
    );

    return found ? mapping[found] : null;
}

async function main() {
    console.log('📊 YENİ CSV VERİLERİNDEN REÇETE MİKTARLARI GÜNCELLENİYOR...\n');

    try {
        // CSV dosyasını oku
        const csvPath = path.join(__dirname, '../veriler/Kurallar ve kodlar.xlsx - ReçetelerS.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        // CSV'yi parse et
        const csvRecipes = parseRecipeCSV(csvContent);
        console.log(`📋 ${csvRecipes.length} reçete CSV'den okundu:`);
        csvRecipes.forEach((r, i) => {
            console.log(`   ${i + 1}. ${r.name} (${r.type}) - ${r.ingredients.length} malzeme`);
        });

        // Mevcut reçeteleri ve malzemeleri al
        const [recipes, materials] = await Promise.all([
            prisma.recipe.findMany({
                include: {
                    icerikelek: {
                        include: {
                            material: true
                        }
                    }
                }
            }),
            prisma.material.findMany()
        ]);

        console.log(`\n🔍 ${recipes.length} reçete, ${materials.length} malzeme veritabanında mevcut\n`);

        let updatedRecipeCount = 0;
        let updatedIngredientCount = 0;
        let notFoundRecipes = [];
        let notFoundMaterials = [];

        for (const csvRecipe of csvRecipes) {
            try {
                // Reçeteyi veritabanında bul
                const mappedRecipeName = mapRecipeName(csvRecipe.name);
                let dbRecipe = null;

                if (mappedRecipeName) {
                    dbRecipe = recipes.find(r => r.ad === mappedRecipeName);
                }

                if (!dbRecipe) {
                    // Direkt isim arayalım
                    dbRecipe = recipes.find(r =>
                        r.ad.toUpperCase().includes(csvRecipe.name.toUpperCase()) ||
                        csvRecipe.name.toUpperCase().includes(r.ad.toUpperCase()) ||
                        r.ad.toUpperCase().replace(/[_\d]/g, '').includes(csvRecipe.name.toUpperCase())
                    );
                }

                if (!dbRecipe) {
                    console.log(`⚠️  Reçete bulunamadı: ${csvRecipe.name}`);
                    notFoundRecipes.push(csvRecipe.name);
                    continue;
                }

                console.log(`🔄 Güncelleniyor: ${csvRecipe.name} -> ${dbRecipe.ad}`);
                let recipeUpdated = false;

                // Malzemeleri güncelle
                for (const csvIngredient of csvRecipe.ingredients) {
                    const mappedName = mapMaterialName(csvIngredient.materialName);

                    // Malzemeyi bul
                    const material = materials.find(m =>
                        m.ad.toUpperCase() === mappedName.toUpperCase()
                    );

                    if (!material) {
                        console.log(`   ⚠️  Malzeme bulunamadı: ${mappedName}`);
                        if (!notFoundMaterials.includes(mappedName)) {
                            notFoundMaterials.push(mappedName);
                        }
                        continue;
                    }

                    // Reçetedeki bu malzemeyi bul veya oluştur
                    let dbIngredient = dbRecipe.icerikelek.find(ing =>
                        ing.materialId === material.id
                    );

                    // Miktar ve birim dönüşümü
                    const { miktar, birim } = convertToKgAndBirim(
                        csvIngredient.netMiktar,
                        csvIngredient.unit
                    );

                    if (dbIngredient) {
                        // Mevcut malzemeyi güncelle
                        await prisma.recipeIngredient.update({
                            where: { id: dbIngredient.id },
                            data: {
                                miktar: miktar,
                                birim: birim,
                                fire1: csvIngredient.fire1,
                                fire2: csvIngredient.fire2,
                                gerMiktar: csvIngredient.gerMiktar,
                                gerMiktarTB: csvIngredient.gerMiktarTB,
                                sonFiyat: csvIngredient.sonFiyat,
                                maliyet: csvIngredient.maliyet
                            }
                        });
                    } else {
                        // Yeni malzeme ekle
                        await prisma.recipeIngredient.create({
                            data: {
                                recipeId: dbRecipe.id,
                                materialId: material.id,
                                miktar: miktar,
                                birim: birim,
                                fire1: csvIngredient.fire1,
                                fire2: csvIngredient.fire2,
                                gerMiktar: csvIngredient.gerMiktar,
                                gerMiktarTB: csvIngredient.gerMiktarTB,
                                sonFiyat: csvIngredient.sonFiyat,
                                maliyet: csvIngredient.maliyet
                            }
                        });
                        console.log(`   ➕ Yeni malzeme eklendi: ${material.ad}`);
                    }

                    console.log(`   ✅ ${material.ad}: ${miktar} ${birim} (CSV: ${csvIngredient.netMiktar} ${csvIngredient.unit})`);
                    if (csvIngredient.fire1 > 0) console.log(`      Fire1: ${(csvIngredient.fire1 * 100).toFixed(2)}%`);
                    if (csvIngredient.fire2 > 0) console.log(`      Fire2: ${(csvIngredient.fire2 * 100).toFixed(2)}%`);
                    if (csvIngredient.maliyet > 0) console.log(`      Maliyet: ${csvIngredient.maliyet}₺`);

                    updatedIngredientCount++;
                    recipeUpdated = true;
                }

                if (recipeUpdated) {
                    // Reçete maliyetini yeniden hesapla
                    const updatedRecipe = await prisma.recipe.findUnique({
                        where: { id: dbRecipe.id },
                        include: {
                            icerikelek: {
                                include: {
                                    material: true
                                }
                            }
                        }
                    });

                    let toplamMaliyet = 0;
                    for (const ingredient of updatedRecipe.icerikelek) {
                        // CSV'den gelen maliyet varsa onu kullan, yoksa hesapla
                        if (ingredient.maliyet && ingredient.maliyet > 0) {
                            toplamMaliyet += ingredient.maliyet;
                        } else {
                            const materialPrice = ingredient.material.birimFiyat || 0;
                            let ingredientCost = 0;

                            if (ingredient.birim === 'GRAM') {
                                ingredientCost = (ingredient.miktar / 1000) * materialPrice;
                            } else if (ingredient.birim === 'ML') {
                                ingredientCost = (ingredient.miktar / 1000) * materialPrice;
                            } else {
                                ingredientCost = ingredient.miktar * materialPrice;
                            }

                            toplamMaliyet += ingredientCost;
                        }
                    }

                    await prisma.recipe.update({
                        where: { id: dbRecipe.id },
                        data: {
                            toplamMaliyet: toplamMaliyet,
                            porsinoyonMaliyet: toplamMaliyet / (updatedRecipe.porsiyon || 1)
                        }
                    });

                    updatedRecipeCount++;
                }

            } catch (error) {
                console.error(`❌ ${csvRecipe.name} güncellenirken hata:`, error.message);
            }
        }

        console.log('\n🎉 REÇETE MİKTARLARI YENİ CSV VERİLERİYLE GÜNCELLENDİ!');
        console.log(`📊 İstatistikler:`);
        console.log(`   ✅ Güncellenen reçete: ${updatedRecipeCount}`);
        console.log(`   ✅ Güncellenen malzeme: ${updatedIngredientCount}`);
        console.log(`   ⚠️  Bulunamayan reçete: ${notFoundRecipes.length}`);
        console.log(`   ⚠️  Bulunamayan malzeme: ${notFoundMaterials.length}`);

        if (notFoundRecipes.length > 0) {
            console.log(`\n❌ Bulunamayan reçeteler:`);
            notFoundRecipes.forEach(name => console.log(`   - ${name}`));
        }

        if (notFoundMaterials.length > 0) {
            console.log(`\n❌ Bulunamayan malzemeler:`);
            notFoundMaterials.forEach(name => console.log(`   - ${name}`));
        }

        // Örnek güncellenmiş reçete göster
        console.log('\n📝 Örnek güncellenmiş reçete:');
        const sampleRecipe = await prisma.recipe.findFirst({
            include: {
                icerikelek: {
                    include: {
                        material: true
                    }
                }
            },
            where: {
                toplamMaliyet: { gt: 0 }
            }
        });

        if (sampleRecipe) {
            console.log(`🍰 ${sampleRecipe.ad}:`);
            console.log(`   💰 Toplam maliyet: ${sampleRecipe.toplamMaliyet?.toFixed(2) || 0}₺`);
            console.log(`   🥄 Malzemeler:`);
            sampleRecipe.icerikelek.slice(0, 5).forEach(ing => {
                const fireInfo = ing.fire1 > 0 ? ` (Fire1: ${(ing.fire1 * 100).toFixed(1)}%)` : '';
                const maliyetInfo = ing.maliyet > 0 ? ` - Maliyet: ${ing.maliyet}₺` : '';
                console.log(`      • ${ing.material.ad}: ${ing.miktar} ${ing.birim}${fireInfo}${maliyetInfo}`);
            });
        }

    } catch (error) {
        console.error('❌ HATA:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 