const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// CSV parsing functions (reuse from previous script)
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

        const cols = parseCSVLine(line);

        const isRecipeHeader = cols[0] &&
            (cols[0].includes('(UR)') || cols[0].includes('(YM)') ||
                cols[0].includes('KURABIYE') || cols[0].includes('HAMUR') ||
                cols[0].includes('SERBET') || cols[0].includes('KAYMAK')) &&
            (!cols[1] || cols[1] === '') && (!cols[2] || cols[2] === '');

        if (isRecipeHeader) {
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
        else if (cols[0] === 'Stok Adı') {
            continue;
        }
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

    if (currentRecipe && currentRecipe.ingredients.length > 0) {
        recipes.push(currentRecipe);
    }

    return recipes;
}

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
            return { miktar: amount * 0.05, birim: 'KG' };
        default:
            return { miktar: amount, birim: 'KG' };
    }
}

// Reçete kodu oluşturucu
function generateRecipeCode(name, type) {
    const baseName = name.toUpperCase()
        .replace(/[^A-Z\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 15);

    // Son kullanılan numarayı bul
    const lastNumber = Math.floor(Math.random() * 100) + 18; // 18'den başla

    return `${baseName}_${lastNumber}`;
}

async function main() {
    console.log('🆕 EKSİK REÇETELER OLUŞTURULUYOR...\n');

    try {
        // CSV dosyasını oku
        const csvPath = path.join(__dirname, '../veriler/Kurallar ve kodlar.xlsx - ReçetelerS.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        // CSV'yi parse et
        const csvRecipes = parseRecipeCSV(csvContent);

        // Mevcut reçeteleri ve malzemeleri al
        const [existingRecipes, materials] = await Promise.all([
            prisma.recipe.findMany(),
            prisma.material.findMany()
        ]);

        // Eksik reçeteleri tespit et
        const missingRecipes = [
            'DOLAMA',
            'MIDYE',
            'HAVUC DILIMI',
            'SOBIYET',
            'BULBUL YUVASI',
            'OZEL KARE BAKLAVA',
            'FISTIKLI KURU BAKLAVA',
            'FISTIKLI YAS BAKLAVA',
            'CEVIZLI BAKLAVA'
        ];

        console.log(`📋 ${missingRecipes.length} eksik reçete oluşturulacak:\n`);

        let createdCount = 0;
        let createdIngredientCount = 0;

        for (const missingName of missingRecipes) {
            // CSV'de bu reçeteyi bul
            const csvRecipe = csvRecipes.find(r =>
                r.name.toUpperCase() === missingName.toUpperCase()
            );

            if (!csvRecipe) {
                console.log(`⚠️  CSV'de bulunamadı: ${missingName}`);
                continue;
            }

            // Yeni reçete oluştur
            const recipeCode = generateRecipeCode(csvRecipe.name, csvRecipe.type);

            console.log(`🆕 Oluşturuluyor: ${csvRecipe.name} (${recipeCode})`);

            try {
                const newRecipe = await prisma.recipe.create({
                    data: {
                        ad: recipeCode,
                        kod: recipeCode,
                        aciklama: `${csvRecipe.name} reçetesi - CSV'den oluşturuldu`,
                        porsiyon: 1,
                        aktif: true,
                        test: false,
                        versiyon: "1.0"
                    }
                });

                let totalCost = 0;
                let ingredientCount = 0;

                // Malzemeleri ekle
                for (const csvIngredient of csvRecipe.ingredients) {
                    const mappedName = mapMaterialName(csvIngredient.materialName);

                    const material = materials.find(m =>
                        m.ad.toUpperCase() === mappedName.toUpperCase()
                    );

                    if (!material) {
                        console.log(`   ⚠️  Malzeme bulunamadı: ${mappedName}`);
                        continue;
                    }

                    const { miktar, birim } = convertToKgAndBirim(
                        csvIngredient.netMiktar,
                        csvIngredient.unit
                    );

                    await prisma.recipeIngredient.create({
                        data: {
                            recipeId: newRecipe.id,
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

                    console.log(`   ✅ ${material.ad}: ${miktar} ${birim}`);
                    if (csvIngredient.fire1 > 0) console.log(`      Fire1: ${(csvIngredient.fire1 * 100).toFixed(2)}%`);
                    if (csvIngredient.maliyet > 0) {
                        console.log(`      Maliyet: ${csvIngredient.maliyet}₺`);
                        totalCost += csvIngredient.maliyet;
                    }

                    ingredientCount++;
                    createdIngredientCount++;
                }

                // Toplam maliyeti güncelle
                if (totalCost > 0) {
                    await prisma.recipe.update({
                        where: { id: newRecipe.id },
                        data: {
                            toplamMaliyet: totalCost,
                            porsinoyonMaliyet: totalCost
                        }
                    });
                }

                console.log(`   💰 Toplam maliyet: ${totalCost.toFixed(2)}₺`);
                console.log(`   📝 ${ingredientCount} malzeme eklendi\n`);

                createdCount++;

            } catch (error) {
                console.error(`❌ ${csvRecipe.name} oluşturulurken hata:`, error.message);
            }
        }

        console.log('🎉 EKSİK REÇETELER BAŞARIYLA OLUŞTURULDU!');
        console.log(`📊 İstatistikler:`);
        console.log(`   ✅ Oluşturulan reçete: ${createdCount}`);
        console.log(`   ✅ Eklenen malzeme: ${createdIngredientCount}`);

        // Toplam reçete sayısını göster
        const totalRecipes = await prisma.recipe.count();
        console.log(`\n📋 Toplam reçete sayısı: ${totalRecipes}`);

        // Örnek yeni reçete göster
        if (createdCount > 0) {
            console.log('\n📝 Örnek yeni reçete:');
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
                },
                orderBy: { createdAt: 'desc' }
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