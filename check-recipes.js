const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecipes() {
    try {
        const recipeCount = await prisma.recipe.count();
        console.log('Recipe count:', recipeCount);

        const recipesWithIngredients = await prisma.recipe.findMany({
            include: {
                ingredients: true,
                urun: {
                    select: { id: true, ad: true }
                }
            }
        });

        console.log('\nRecipes:');
        recipesWithIngredients.forEach(recipe => {
            console.log(`- ${recipe.name} (ID: ${recipe.id}) - Ürün: ${recipe.urun?.ad || 'Eşleşmemiş'} - Malzeme sayısı: ${recipe.ingredients.length}`);
        });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkRecipes(); 