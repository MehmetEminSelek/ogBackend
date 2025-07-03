const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🎯 SİSTEM DURUM RAPORU\n');
    console.log('='.repeat(50));

    try {
        // Personeller
        const userStats = await prisma.user.groupBy({
            by: ['aktif'],
            _count: true
        });

        const usersByRole = await prisma.user.groupBy({
            by: ['role'],
            _count: true,
            where: { aktif: true }
        });

        console.log('👥 PERSONEL:');
        userStats.forEach(stat => {
            const status = stat.aktif ? 'Aktif' : 'Pasif';
            const emoji = stat.aktif ? '🟢' : '🔴';
            console.log(`   ${emoji} ${status}: ${stat._count} kişi`);
        });

        console.log('\n👨‍💼 ROL DAĞILIMI (Aktif):');
        usersByRole.forEach(stat => {
            const emoji = {
                'ADMIN': '👑',
                'MANAGER': '👨‍💼',
                'PRODUCTION': '🏭',
                'USER': '👤'
            }[stat.role] || '👤';
            console.log(`   ${emoji} ${stat.role}: ${stat._count} kişi`);
        });

        // Cari müşteriler
        const cariCount = await prisma.cari.count();
        console.log(`\n👨‍💼 CARİ MÜŞTERİLER: ${cariCount} adet`);

        // Ürünler
        const urunStats = await prisma.urun.aggregate({
            _count: true,
            _avg: { agirlik: true }
        });

        const urunWithWeights = await prisma.urun.count({
            where: { agirlik: { gt: 0 } }
        });

        console.log(`\n📦 ÜRÜNLER:`);
        console.log(`   📊 Toplam ürün: ${urunStats._count}`);
        console.log(`   ⚖️  Ağırlığı olan: ${urunWithWeights} adet`);
        console.log(`   📏 Ortalama ağırlık: ${Math.round(urunStats._avg.agirlik || 0)}g`);

        // Fiyatlar
        const fiyatCount = await prisma.fiyat.count({
            where: { aktif: true }
        });

        console.log(`\n💰 FİYATLAR:`);
        console.log(`   💵 Aktif fiyat: ${fiyatCount} adet`);

        // Hammaddeler
        const materialCount = await prisma.material.count();
        const materialTypes = await prisma.material.groupBy({
            by: ['tipi'],
            _count: true
        });

        console.log(`\n🧱 HAMMADDELER:`);
        console.log(`   📊 Toplam: ${materialCount} adet`);
        materialTypes.forEach(type => {
            const emoji = type.tipi === 'HAMMADDE' ? '🌾' : '🔧';
            console.log(`   ${emoji} ${type.tipi}: ${type._count} adet`);
        });

        // Reçeteler
        const recipeCount = await prisma.recipe.count();
        const recipeIngredients = await prisma.recipeIngredient.count();

        console.log(`\n📝 REÇETELER:`);
        console.log(`   📊 Toplam reçete: ${recipeCount} adet`);
        console.log(`   🥄 Toplam malzeme: ${recipeIngredients} adet`);

        // Siparişler
        const orderStats = await prisma.siparis.groupBy({
            by: ['durum'],
            _count: true
        });

        console.log(`\n📋 SİPARİŞLER:`);
        orderStats.forEach(stat => {
            const emoji = {
                'ONAY_BEKLEYEN': '⏳',
                'HAZIRLLANACAK': '🔄',
                'HAZIRLANDI': '✅',
                'IPTAL': '❌'
            }[stat.durum] || '📦';
            console.log(`   ${emoji} ${stat.durum}: ${stat._count} adet`);
        });

        // Şubeler
        const subeCount = await prisma.sube.count({
            where: { aktif: true }
        });

        console.log(`\n🏢 ŞUBELER: ${subeCount} adet`);

        console.log('\n' + '='.repeat(50));
        console.log('✅ TÜM SİSTEM VERİLERİ HAZIR!');
        console.log('🚀 Frontend artık tam kapasiteyle çalışabilir.');
        console.log('\n💡 Varsayılan admin girişi:');
        console.log('   👤 Email: admin@omergullu.com');
        console.log('   🔑 Şifre: 12345');

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