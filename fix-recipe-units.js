const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRecipeUnits() {
    console.log('🔧 Reçete birimlerini düzeltiliyor...\n');

    try {
        // Tüm recipe ingredient'ları al
        const ingredients = await prisma.recipeIngredient.findMany({
            include: {
                recipe: { select: { ad: true, kod: true } },
                material: { select: { ad: true, kod: true, birimFiyat: true } }
            }
        });

        console.log(`📦 ${ingredients.length} malzeme bağlantısı bulundu\n`);

        let updateCount = 0;

        for (const ingredient of ingredients) {
            // Sadece KG birimindeki malzemeleri düzelt (gram → kg dönüşümü gerekli)
            if (ingredient.birim === 'KG') {
                // Mevcut değerleri 1000'e böl (gram → kg)
                const yeniMiktar = ingredient.miktar / 1000;
                const yeniGerMiktar = ingredient.gerMiktar / 1000;
                const yeniMaliyet = yeniGerMiktar * (ingredient.material.birimFiyat || 0);

                await prisma.recipeIngredient.update({
                    where: { id: ingredient.id },
                    data: {
                        miktar: yeniMiktar,
                        gerMiktar: yeniGerMiktar,
                        maliyet: yeniMaliyet
                    }
                });

                console.log(`✅ ${ingredient.recipe.ad} - ${ingredient.material.ad}`);
                console.log(`   📊 ${ingredient.miktar} kg → ${yeniMiktar} kg`);
                console.log(`   🔥 ${ingredient.gerMiktar} kg → ${yeniGerMiktar} kg`);
                console.log(`   💰 ${ingredient.maliyet.toFixed(2)} TL → ${yeniMaliyet.toFixed(2)} TL\n`);

                updateCount++;
            }
        }

        console.log(`✅ ${updateCount} malzeme güncellendi\n`);

        // Reçete toplam maliyetlerini yeniden hesapla
        console.log('💰 Reçete maliyetleri yeniden hesaplanıyor...');

        const recipes = await prisma.recipe.findMany({
            include: {
                icerikelek: true
            }
        });

        for (const recipe of recipes) {
            const toplamMaliyet = recipe.icerikelek.reduce((toplam, ing) => toplam + ing.maliyet, 0);

            await prisma.recipe.update({
                where: { id: recipe.id },
                data: {
                    toplamMaliyet: toplamMaliyet,
                    birimMaliyet: toplamMaliyet,
                    guncellemeTarihi: new Date()
                }
            });

            console.log(`📝 ${recipe.ad}: ${toplamMaliyet.toFixed(2)} TL/KG`);
        }

        console.log('\n🎉 Birim düzeltme işlemi tamamlandı!');
        console.log(`✅ ${updateCount} malzeme bağlantısı güncellendi`);
        console.log(`✅ ${recipes.length} reçete maliyeti yeniden hesaplandı`);

    } catch (error) {
        console.error('❌ Hata:', error);
    }

    await prisma.$disconnect();
}

fixRecipeUnits(); 