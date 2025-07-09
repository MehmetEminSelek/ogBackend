const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('🧾 Basit Reçete Test...\n');

    // Toplam sayılar
    const receteSayisi = await prisma.recipe.count();
    const ingredientSayisi = await prisma.recipeIngredient.count();

    console.log(`✅ Toplam reçete: ${receteSayisi}`);
    console.log(`✅ Toplam malzeme bağlantısı: ${ingredientSayisi}`);

    // Örnek reçete
    const ornekRecete = await prisma.recipe.findFirst({
        include: {
            icerikelek: {
                include: {
                    material: {
                        select: { ad: true, kod: true }
                    }
                }
            }
        }
    });

    if (ornekRecete) {
        console.log(`\n📝 Örnek: ${ornekRecete.ad}`);
        console.log(`   Kod: ${ornekRecete.kod}`);
        console.log(`   Malzeme sayısı: ${ornekRecete.icerikelek.length}`);

        ornekRecete.icerikelek.slice(0, 3).forEach(ing => {
            console.log(`   • ${ing.material.ad}: ${ing.miktar} ${ing.birim}`);
        });
    }

    await prisma.$disconnect();
}

test().catch(console.error); 