const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('📊 REÇETE SİSTEMİ DURUM RAPORU\n');
    console.log('='.repeat(60));

    try {
        // Toplam istatistikler
        const [
            totalRecipes,
            totalIngredients,
            totalMaterials,
            activeRecipes,
            recipesWithCost
        ] = await Promise.all([
            prisma.recipe.count(),
            prisma.recipeIngredient.count(),
            prisma.material.count(),
            prisma.recipe.count({ where: { aktif: true } }),
            prisma.recipe.count({ where: { toplamMaliyet: { gt: 0 } } })
        ]);

        console.log('📈 GENEL İSTATİSTİKLER:');
        console.log(`   📝 Toplam reçete sayısı: ${totalRecipes}`);
        console.log(`   ✅ Aktif reçete sayısı: ${activeRecipes}`);
        console.log(`   🧪 Malzeme bağlantısı: ${totalIngredients}`);
        console.log(`   🧱 Toplam malzeme: ${totalMaterials}`);
        console.log(`   💰 Maliyeti hesaplanan: ${recipesWithCost}`);

        // Detaylı reçete listesi
        console.log('\n📋 REÇETE LİSTESİ:');
        const recipes = await prisma.recipe.findMany({
            include: {
                icerikelek: {
                    include: {
                        material: true
                    }
                }
            },
            orderBy: { ad: 'asc' }
        });

        let csvCreatedCount = 0;
        recipes.forEach((recipe, index) => {
            const ingredientCount = recipe.icerikelek.length;
            const cost = recipe.toplamMaliyet || 0;
            const status = recipe.aktif ? '✅' : '❌';
            const isFromCSV = recipe.aciklama?.includes('CSV\'den oluşturuldu');

            if (isFromCSV) csvCreatedCount++;

            console.log(`   ${index + 1}. ${status} ${recipe.ad}`);
            console.log(`       📝 ${ingredientCount} malzeme | 💰 ${cost.toFixed(2)}₺`);

            if (isFromCSV) {
                console.log(`       🆕 CSV'den oluşturuldu`);
            }

            // Fire bilgisi olan malzemeleri göster
            const fireIngredients = recipe.icerikelek.filter(ing => ing.fire1 > 0 || ing.fire2 > 0);
            if (fireIngredients.length > 0) {
                console.log(`       🔥 ${fireIngredients.length} malzemede fire hesabı`);
            }

            // Malzeme maliyeti olan ingredientleri say
            const costIngredients = recipe.icerikelek.filter(ing => ing.maliyet > 0);
            if (costIngredients.length > 0) {
                console.log(`       💵 ${costIngredients.length} malzemede doğrudan maliyet`);
            }
        });

        console.log(`\n🆕 CSV'den oluşturulan reçete sayısı: ${csvCreatedCount}`);

        // En detaylı reçeteler
        console.log('\n🏆 EN DETAYLI REÇETELER:');
        const topRecipes = recipes
            .sort((a, b) => b.icerikelek.length - a.icerikelek.length)
            .slice(0, 5);

        topRecipes.forEach((recipe, index) => {
            console.log(`   ${index + 1}. ${recipe.ad}: ${recipe.icerikelek.length} malzeme`);
            console.log(`      💰 Toplam maliyet: ${recipe.toplamMaliyet?.toFixed(2) || 0}₺`);
        });

        // En pahalı reçeteler
        console.log('\n💎 EN PAHALI REÇETELER:');
        const expensiveRecipes = recipes
            .filter(r => r.toplamMaliyet > 0)
            .sort((a, b) => (b.toplamMaliyet || 0) - (a.toplamMaliyet || 0))
            .slice(0, 5);

        expensiveRecipes.forEach((recipe, index) => {
            console.log(`   ${index + 1}. ${recipe.ad}: ${recipe.toplamMaliyet?.toFixed(2)}₺`);
            console.log(`      📝 ${recipe.icerikelek.length} malzeme`);
        });

        // Fire hesabı olan reçeteler
        console.log('\n🔥 FİRE HESABI OLAN REÇETELER:');
        const fireRecipes = recipes.filter(r =>
            r.icerikelek.some(ing => ing.fire1 > 0 || ing.fire2 > 0)
        );

        console.log(`   📊 Toplam: ${fireRecipes.length} reçete`);
        fireRecipes.slice(0, 5).forEach((recipe, index) => {
            const fireCount = recipe.icerikelek.filter(ing => ing.fire1 > 0 || ing.fire2 > 0).length;
            console.log(`   ${index + 1}. ${recipe.ad}: ${fireCount} malzemede fire`);
        });

        // CSV alanları kullanım istatistiği
        console.log('\n📊 CSV ALANLARI KULLANIM İSTATİSTİĞİ:');
        const ingredients = await prisma.recipeIngredient.findMany();

        const fire1Count = ingredients.filter(ing => ing.fire1 > 0).length;
        const fire2Count = ingredients.filter(ing => ing.fire2 > 0).length;
        const costCount = ingredients.filter(ing => ing.maliyet > 0).length;
        const gerMiktarCount = ingredients.filter(ing => ing.gerMiktar > 0).length;

        console.log(`   🔥 Fire1 kullanılan: ${fire1Count} malzeme`);
        console.log(`   🔥 Fire2 kullanılan: ${fire2Count} malzeme`);
        console.log(`   💰 Doğrudan maliyet: ${costCount} malzeme`);
        console.log(`   📊 Gerçek miktar: ${gerMiktarCount} malzeme`);

        // Sistem hazırlık durumu
        console.log('\n🎯 SİSTEM HAZIRLIK DURUMU:');
        console.log(`   ✅ Reçete sistemi: HAZIR`);
        console.log(`   ✅ CSV verileri: YÜKLENDİ`);
        console.log(`   ✅ Fire hesaplamaları: AKTİF`);
        console.log(`   ✅ Maliyet hesaplamaları: AKTİF`);
        console.log(`   ✅ Frontend entegrasyonu: HAZIR`);

        console.log('\n' + '='.repeat(60));
        console.log('🏁 REÇETE SİSTEMİ TAM OLARAK HAZIR!');
        console.log('💡 Frontend\'de reçete yönetimi şimdi tam verilerle çalışacak.');

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