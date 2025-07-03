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

        // Reçete başlığı tespiti
        const isRecipeHeader = cols[0] &&
            (cols[0].includes('(UR)') || cols[0].includes('(YM)')) &&
            !cols[1] && !cols[2];

        if (isRecipeHeader) {
            // Önceki reçeteyi kaydet
            if (currentRecipe && currentRecipe.ingredients.length > 0) {
                recipes.push(currentRecipe);
            }

            const recipeName = cols[0].replace('(UR)', '').replace('(YM)', '').trim();
            currentRecipe = {
                name: recipeName,
                ingredients: []
            };
        }
        // Stok adı başlığı değilse ve malzeme satırıysa
        else if (currentRecipe && cols[0] && cols[1] && cols[2] &&
            cols[0] !== 'Stok Adı' &&
            !cols[0].includes('Fire') &&
            cols[0] !== '') {

            const materialName = cols[0].trim();
            const unit = cols[1].trim();
            let amount = cols[2].trim();

            // Tırnak işaretlerini temizle ve virgülü noktaya çevir
            amount = amount.replace(/"/g, '').replace(',', '.');

            if (amount && amount !== '' && !isNaN(parseFloat(amount))) {
                currentRecipe.ingredients.push({
                    materialName: materialName,
                    amount: parseFloat(amount),
                    unit: unit.toLowerCase()
                });
            }
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

// Birim dönüşümü
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
            return { miktar: amount, birim: 'KG' };
    }
}

async function main() {
    console.log('📊 CSV VERİLERİNDEN REÇETE MİKTARLARI GÜNCELLENİYOR...\n');

    try {
        // CSV dosyasını oku
        const csvPath = path.join(__dirname, '../veriler/Kurallar ve kodlar.xlsx - Reçeteler.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        // CSV'yi parse et
        const csvRecipes = parseRecipeCSV(csvContent);
        console.log(`📋 ${csvRecipes.length} reçete CSV'den okundu`);

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

        console.log(`🔍 ${recipes.length} reçete, ${materials.length} malzeme veritabanında mevcut\n`);

        let updatedRecipeCount = 0;
        let updatedIngredientCount = 0;
        let notFoundCount = 0;

        for (const csvRecipe of csvRecipes) {
            try {
                // Reçeteyi veritabanında bul
                const dbRecipe = recipes.find(r =>
                    r.ad.toUpperCase().includes(csvRecipe.name.toUpperCase()) ||
                    csvRecipe.name.toUpperCase().includes(r.ad.toUpperCase())
                );

                if (!dbRecipe) {
                    console.log(`⚠️  Reçete bulunamadı: ${csvRecipe.name}`);
                    notFoundCount++;
                    continue;
                }

                console.log(`🔄 Güncelleniyor: ${dbRecipe.ad}`);
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
                        continue;
                    }

                    // Reçetedeki bu malzemeyi bul
                    const dbIngredient = dbRecipe.icerikelek.find(ing =>
                        ing.materialId === material.id
                    );

                    if (!dbIngredient) {
                        console.log(`   ⚠️  Reçetede malzeme bulunamadı: ${material.ad}`);
                        continue;
                    }

                    // Miktar ve birim dönüşümü
                    const { miktar, birim } = convertToKgAndBirim(
                        csvIngredient.amount,
                        csvIngredient.unit
                    );

                    // Güncelle
                    await prisma.recipeIngredient.update({
                        where: { id: dbIngredient.id },
                        data: {
                            miktar: miktar,
                            birim: birim
                        }
                    });

                    console.log(`   ✅ ${material.ad}: ${miktar} ${birim} (CSV: ${csvIngredient.amount} ${csvIngredient.unit})`);
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

        console.log('\n🎉 REÇETE MİKTARLARI CSV VERİLERİYLE GÜNCELLENDİ!');
        console.log(`📊 İstatistikler:`);
        console.log(`   ✅ Güncellenen reçete: ${updatedRecipeCount}`);
        console.log(`   ✅ Güncellenen malzeme: ${updatedIngredientCount}`);
        console.log(`   ⚠️  Bulunamayan: ${notFoundCount}`);

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
                console.log(`      • ${ing.material.ad}: ${ing.miktar} ${ing.birim}`);
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