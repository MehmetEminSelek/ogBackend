const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addGondericiSettings() {
    console.log('👥 GÖNDEREN/ALICI DROPDOWN AYARLARI EKLENİYOR...\n');

    try {
        // Gönderen/Alıcı seçenekleri
        const gondericiData = {
            'GA001': 'Gönderen ve Alıcı',
            'GA002': 'Tek Gönderen'
        };

        // JSON formatında kaydet
        const gondericiSetting = await prisma.systemSetting.upsert({
            where: { key: 'GONDERICI_ALICI_TIPLERI' },
            create: {
                key: 'GONDERICI_ALICI_TIPLERI',
                value: JSON.stringify(gondericiData),
                dataType: 'JSON',
                description: 'Sipariş formu gönderen/alıcı dropdown seçenekleri',
                kategori: 'DROPDOWN'
            },
            update: {
                value: JSON.stringify(gondericiData),
                updatedAt: new Date()
            }
        });

        console.log('✅ Gönderen/Alıcı dropdown ayarları kaydedildi');
        console.log(`📝 Setting ID: ${gondericiSetting.id}`);
        console.log(`🔑 Key: ${gondericiSetting.key}`);
        console.log(`📄 İçerik:`);

        Object.entries(gondericiData).forEach(([kod, ad]) => {
            console.log(`   • ${kod}: ${ad}`);
        });

        // Ayrıca her birini ayrı setting olarak da kaydet (alternatif erişim için)
        for (const [kod, ad] of Object.entries(gondericiData)) {
            await prisma.systemSetting.upsert({
                where: { key: `GONDERICI_ALICI_${kod}` },
                create: {
                    key: `GONDERICI_ALICI_${kod}`,
                    value: ad,
                    dataType: 'STRING',
                    description: `Gönderen/Alıcı seçeneği: ${ad}`,
                    kategori: 'DROPDOWN'
                },
                update: {
                    value: ad,
                    updatedAt: new Date()
                }
            });

            console.log(`   ✅ ${kod} individual setting kaydedildi`);
        }

        console.log('\n🎉 TÜM DROPDOWN AYARLARI TAMAMLANDI!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    } catch (error) {
        console.error('❌ Hata:', error);
    }

    await prisma.$disconnect();
}

addGondericiSettings(); 