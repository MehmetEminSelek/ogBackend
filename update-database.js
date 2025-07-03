const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateDatabase() {
    console.log('🔄 VERİTABANI GÜNCELLENİYOR...\n');

    try {
        // 1. Mevcut kargo durumlarını kontrol et
        console.log('📊 Mevcut kargo durumları:');
        const currentStatuses = await prisma.siparis.groupBy({
            by: ['kargoDurumu'],
            _count: true
        });

        currentStatuses.forEach(status => {
            console.log(`   ${status.kargoDurumu}: ${status._count} sipariş`);
        });

        // 2. Eski string değerleri yeni enum değerlerine güncelle
        console.log('\n🔄 Kargo durumları güncelleniyor...');

        // ADRESE_TESLIMAT -> KARGOYA_VERILECEK (kargo teslimatları için)
        const result1 = await prisma.$executeRaw`
            UPDATE "Siparis" SET "kargoDurumu" = 'KARGOYA_VERILECEK'::text::"KargoDurumu" 
            WHERE "kargoDurumu" = 'ADRESE_TESLIMAT' AND "teslimatTuruId" IN (
                SELECT id FROM "TeslimatTuru" WHERE kodu IN ('TT001', 'TT003', 'TT004', 'TT006')
            )
        `;
        console.log(`   ✅ Kargo teslimatları güncellendi: ${result1} sipariş`);

        // ADRESE_TESLIMAT -> SUBEYE_GONDERILECEK (şube teslimatları için)
        const result2 = await prisma.$executeRaw`
            UPDATE "Siparis" SET "kargoDurumu" = 'SUBEYE_GONDERILECEK'::text::"KargoDurumu" 
            WHERE "kargoDurumu" = 'ADRESE_TESLIMAT' AND "teslimatTuruId" IN (
                SELECT id FROM "TeslimatTuru" WHERE kodu = 'TT007'
            )
        `;
        console.log(`   ✅ Şube teslimatları güncellendi: ${result2} sipariş`);

        // ADRESE_TESLIMAT -> SUBEDE_TESLIM (şubeden alma için)
        const result3 = await prisma.$executeRaw`
            UPDATE "Siparis" SET "kargoDurumu" = 'SUBEDE_TESLIM'::text::"KargoDurumu" 
            WHERE "kargoDurumu" = 'ADRESE_TESLIMAT' AND "teslimatTuruId" IN (
                SELECT id FROM "TeslimatTuru" WHERE kodu = 'TT002'
            )
        `;
        console.log(`   ✅ Şubeden alma güncellendi: ${result3} sipariş`);

        // 3. Final kontrol
        console.log('\n📊 GÜNCELLENME SONUÇLARI:');
        const finalStatuses = await prisma.siparis.groupBy({
            by: ['kargoDurumu'],
            _count: true
        });

        finalStatuses.forEach(status => {
            console.log(`   📋 ${status.kargoDurumu}: ${status._count} sipariş`);
        });

        console.log('\n✅ VERİTABANI GÜNCELLEME TAMAMLANDI!');

    } catch (error) {
        console.error('❌ Veritabanı güncelleme hatası:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Script'i çalıştır
updateDatabase(); 