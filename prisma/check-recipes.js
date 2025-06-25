const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🍳 REÇETE VERİLERİ KONTROLÜ\n');

    const recipes = await prisma.recipe.findMany({
        include: {
            icerikelek: {
                include: {
                    material: true
                }
            },
            urun: true
        }
    });

    console.log(`📝 Toplam Reçete: ${recipes.length} adet\n`);

    recipes.forEach(recipe => {
        console.log(`🍽️  ${recipe.ad} (${recipe.kod})`);
        if (recipe.urun) {
            console.log(`   Ürün: ${recipe.urun.ad}`);
        }
        console.log(`   Malzeme Sayısı: ${recipe.icerikelek.length}`);
        recipe.icerikelek.forEach(ingredient => {
            console.log(`   • ${ingredient.material.ad}: ${ingredient.miktar} ${ingredient.birim}`);
        });
        console.log('');
    });

    // Ödeme yöntemleri kontrolü
    console.log('💳 ÖDEME YÖNTEMLERİ:');
    const settings = await prisma.systemSetting.findMany({
        where: { key: 'ODEME_YONTEMLERI' }
    });

    if (settings.length > 0) {
        const odemeYontemleri = JSON.parse(settings[0].value);
        odemeYontemleri.forEach(odeme => {
            console.log(`   • ${odeme.kod} - ${odeme.ad}`);
        });
    }

    console.log('\n✅ REÇETE VE ÖDEME VERİLERİ KONTROLÜ TAMAMLANDI!');
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 