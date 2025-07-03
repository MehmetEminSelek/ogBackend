const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseRecipesCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const recipes = [];
    let currentRecipe = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',');

        // Yeni reçete başlığı tespiti
        const isRecipeHeader = cols[0] &&
            (cols[0].includes('(UR)') || cols[0].includes('(YM)') ||
                (!cols[1] && !cols[2] && cols[0].length > 3 &&
                    !cols[0].includes('Stok') && !cols[0].includes('Birim')));

        if (isRecipeHeader) {
            // Önceki reçeteyi kaydet
            if (currentRecipe && currentRecipe.ingredients.length > 0) {
                recipes.push(currentRecipe);
            }

            const recipeName = cols[0].replace('(UR)', '').replace('(YM)', '').trim();
            const recipeId = recipes.length + 1;
            currentRecipe = {
                name: recipeName,
                uniqueName: `${recipeName}_${recipeId}`, // Unique name için
                code: `RC${String(recipeId).padStart(3, '0')}`,
                type: cols[0].includes('(UR)') ? 'URUN' : (cols[0].includes('(YM)') ? 'YARI_MAMUL' : 'URUN'),
                ingredients: []
            };
        }
        // İçerik satırı (malzeme adı, birim, miktar)
        else if (currentRecipe && cols[0] && cols[1] && cols[2] &&
            cols[0] !== 'Stok Adı' && cols[0] !== 'HAMMADDE ADI') {

            const materialName = cols[0].trim();
            const unit = cols[1].trim();
            let amount = cols[2].trim();

            // Tırnak işaretlerini ve virgülü temizle
            amount = amount.replace(/"/g, '').replace(',', '.');

            // Sayısal değeri parse et
            if (amount && amount !== '' && !isNaN(parseFloat(amount))) {
                currentRecipe.ingredients.push({
                    materialName: materialName,
                    amount: parseFloat(amount),
                    unit: unit
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

function mapMaterialName(csvName) {
    // CSV'deki malzeme isimlerini veritabanındaki isimlerle eşleştir
    const mapping = {
        'SADE YAG': 'SADEYAĞ',
        'FISTIK': 'İÇ FISTIK',
        'TOZ SEKER': 'TOZ ŞEKER',
        'SU': 'SU',
        'GLIKOZ': 'GLİKOZ',
        'YOGURT': 'YOĞURT',
        'SODA GR': 'SODA GR',
        'ANTEP PEYNIRI': 'ANTEP PEYNİRİ',
        'CEVIZ': 'CEVİZ',
        'LIMON': 'LİMON',
        'SUT': 'SÜT',
        'TEKSIN UN': 'TEKSİN UN',
        'NISASTA': 'NIŞASTA',
        'YUMURTA': 'YUMURTA',
        'TUZ': 'TUZ',
        'KADAYIF': 'KADAYIF',
        'HAMUR (YM)': 'HAMUR (YM)',
        'SERBET (YM)': 'SERBET (YM)',
        'KAYMAK (YM)': 'KAYMAK (YM)'
    };

    return mapping[csvName] || csvName;
}

async function main() {
    console.log('📋 REÇETE VERİLERİ YÜKLENİYOR...\n');

    try {
        // CSV dosyasını oku
        const csvPath = path.join(__dirname, '../../veriler/Kurallar ve kodlar.xlsx - Reçeteler.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        // CSV'yi parse et
        const recipes = parseRecipesCSV(csvContent);
        console.log(`📊 ${recipes.length} reçete bulundu`);

        // Mevcut reçeteleri ve ingredientları temizle
        await prisma.recipeIngredient.deleteMany();
        await prisma.recipe.deleteMany();
        console.log('🗑️  Mevcut reçeteler temizlendi');

        // Malzeme ve ürün verilerini çek
        const [materials, products] = await Promise.all([
            prisma.material.findMany(),
            prisma.urun.findMany()
        ]);

        console.log(`📦 ${materials.length} malzeme, ${products.length} ürün mevcut`);

        let successCount = 0;
        let errorCount = 0;
        let ingredientCount = 0;
        const versionCounter = {}; // Aynı ürün için versiyon sayacı

        for (const recipe of recipes) {
            try {
                // Ürün bul (reçete adıyla eşleştir)
                let product = products.find(p =>
                    p.ad.toUpperCase().includes(recipe.name.toUpperCase()) ||
                    recipe.name.toUpperCase().includes(p.ad.toUpperCase())
                );

                // Eğer ürün bulunamazsa yarı mamul olabilir, pas geç
                if (!product && recipe.type === 'URUN') {
                    console.log(`⚠️  ${recipe.name} için ürün bulunamadı, atlanıyor`);
                    continue;
                }

                // Versiyon numarası belirleme
                const productKey = product?.id || 'NONE';
                if (!versionCounter[productKey]) {
                    versionCounter[productKey] = 1;
                } else {
                    versionCounter[productKey]++;
                }
                const versionNo = `${versionCounter[productKey]}.0`;

                // Reçeteyi oluştur
                const createdRecipe = await prisma.recipe.create({
                    data: {
                        ad: recipe.uniqueName, // Unique isim kullan
                        kod: recipe.code,
                        urunId: product?.id || null,
                        aciklama: `${recipe.name} - ${recipe.type} reçetesi (v${versionNo})`,
                        aktif: true,
                        versiyon: versionNo,
                        toplamMaliyet: 0 // Hesaplanacak
                    }
                });

                // İçerikleri ekle
                let recipeCost = 0;
                for (const ingredient of recipe.ingredients) {
                    const mappedName = mapMaterialName(ingredient.materialName);

                    // Malzeme bul
                    const material = materials.find(m =>
                        m.ad.toUpperCase() === mappedName.toUpperCase()
                    );

                    if (material) {
                        // Birim dönüşümü ve enum mapping
                        let finalAmount = ingredient.amount;
                        let finalUnit = material.birim;

                        if (ingredient.unit === 'gr' && material.birim === 'KG') {
                            finalAmount = ingredient.amount / 1000;
                        } else if (ingredient.unit === 'ml' && material.birim === 'KG') {
                            finalAmount = ingredient.amount / 1000; // Yaklaşık
                        } else if (ingredient.unit === 'kg' && material.birim === 'KG') {
                            finalAmount = ingredient.amount;
                        } else if (ingredient.unit === 'lt' && material.birim === 'KG') {
                            finalAmount = ingredient.amount; // 1 litre ≈ 1 kg
                        }

                        await prisma.recipeIngredient.create({
                            data: {
                                recipeId: createdRecipe.id,
                                materialId: material.id,
                                miktar: finalAmount,
                                birim: finalUnit // Material'ın birimini kullan
                            }
                        });

                        recipeCost += finalAmount * (material.birimFiyat || 0);
                        ingredientCount++;
                    } else {
                        console.log(`⚠️  ${mappedName} malzemesi bulunamadı`);
                    }
                }

                // Reçete maliyetini güncelle
                await prisma.recipe.update({
                    where: { id: createdRecipe.id },
                    data: {
                        toplamMaliyet: Math.round(recipeCost * 100) / 100,
                        porsinoyonMaliyet: Math.round(recipeCost * 100) / 100
                    }
                });

                successCount++;
                console.log(`✅ ${recipe.name} reçetesi eklendi (${recipe.ingredients.length} malzeme)`);

            } catch (error) {
                console.error(`❌ ${recipe.name} eklenirken hata:`, error.message);
                errorCount++;
            }
        }

        console.log('\n🎉 REÇETE VERİLERİ YÜKLENDİ!');
        console.log(`📊 İstatistikler:`);
        console.log(`   ✅ Başarılı reçete: ${successCount}`);
        console.log(`   ✅ Toplam içerik: ${ingredientCount}`);
        console.log(`   ❌ Hata: ${errorCount}`);

        // Örnekler
        console.log('\n📋 Örnek reçeteler:');
        const ornekler = await prisma.recipe.findMany({
            take: 3,
            include: {
                icerikelek: {
                    include: {
                        material: {
                            select: { ad: true, birim: true }
                        }
                    }
                },
                urun: {
                    select: { ad: true }
                }
            }
        });

        ornekler.forEach(r => {
            console.log(`   • ${r.ad} (${r.kod}) - ${r.icerikelek.length} malzeme - ${r.toplamMaliyet}₺`);
            r.icerikelek.slice(0, 2).forEach(ing => {
                console.log(`     - ${ing.material.ad}: ${ing.miktar} ${ing.birim}`);
            });
        });

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