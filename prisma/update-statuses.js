const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateOrderStatuses() {
    console.log('🔄 SİPARİŞ DURUMLARI GÜNCELLENİYOR...\n');

    try {
        // Önce mevcut durumları analiz edelim
        console.log('📊 Mevcut durum analizi:');

        // Her eski durumun yeni duruma karşılığını belirle
        const statusMapping = {
            // Eski sistem -> Yeni sistem
            'BEKLIYOR': 'ONAY_BEKLEYEN',
            'ONAYLANDI': 'HAZIRLLANACAK',
            'HAZIRLANIYOR': 'HAZIRLLANACAK',
            'HAZIR': 'HAZIRLANDI',
            'KARGODA': 'HAZIRLANDI',
            'TESLIM_EDILDI': 'HAZIRLANDI',
            'IPTAL': 'IPTAL'
        };

        // Cargo durumu mapping
        const cargoMapping = {
            'HAZIRLANACAK': 'ADRESE_TESLIMAT',
            'KARGOYA_VERILECEK': 'ADRESE_TESLIMAT',
            'KARGODA': 'ADRESE_TESLIMAT',
            'DAGITIMDA': 'ADRESE_TESLIMAT',
            'TESLIM_EDILDI': 'ADRESE_TESLIMAT',
            'TESLIM_EDILEMEDI': 'ADRESE_TESLIMAT',
            'IADE': 'ADRESE_TESLIMAT'
        };

        let updateCount = 0;
        let errorCount = 0;

        // Raw SQL ile eski enum değerlerini güncelle
        console.log('🔄 Sipariş durumları güncelleniyor...');

        // BEKLIYOR -> ONAY_BEKLEYEN
        const result1 = await prisma.$executeRaw`
            UPDATE "Siparis" SET durum = 'ONAY_BEKLEYEN'::text::"SiparisDurumu" 
            WHERE durum::text = 'BEKLIYOR'
        `;
        console.log(`   ✅ BEKLIYOR -> ONAY_BEKLEYEN: ${result1} sipariş`);
        updateCount += result1;

        // ONAYLANDI -> HAZIRLLANACAK  
        const result2 = await prisma.$executeRaw`
            UPDATE "Siparis" SET durum = 'HAZIRLLANACAK'::text::"SiparisDurumu"
            WHERE durum::text = 'ONAYLANDI'
        `;
        console.log(`   ✅ ONAYLANDI -> HAZIRLLANACAK: ${result2} sipariş`);
        updateCount += result2;

        // HAZIRLANIYOR -> HAZIRLLANACAK
        const result3 = await prisma.$executeRaw`
            UPDATE "Siparis" SET durum = 'HAZIRLLANACAK'::text::"SiparisDurumu"
            WHERE durum::text = 'HAZIRLANIYOR'
        `;
        console.log(`   ✅ HAZIRLANIYOR -> HAZIRLLANACAK: ${result3} sipariş`);
        updateCount += result3;

        // HAZIR/KARGODA/TESLIM_EDILDI -> HAZIRLANDI
        const result4 = await prisma.$executeRaw`
            UPDATE "Siparis" SET durum = 'HAZIRLANDI'::text::"SiparisDurumu"
            WHERE durum::text IN ('HAZIR', 'KARGODA', 'TESLIM_EDILDI')
        `;
        console.log(`   ✅ HAZIR/KARGODA/TESLIM_EDILDI -> HAZIRLANDI: ${result4} sipariş`);
        updateCount += result4;

        // Kargo durumlarını da güncelle (tümü ADRESE_TESLIMAT olsun)
        console.log('\n🚚 Kargo durumları güncelleniyor...');
        const cargoResult = await prisma.$executeRaw`
            UPDATE "Siparis" SET "kargoDurumu" = 'ADRESE_TESLIMAT'::text::"KargoDurumu"
            WHERE "kargoDurumu" IS NOT NULL
        `;
        console.log(`   ✅ Kargo durumu güncellendi: ${cargoResult} sipariş`);

        // NULL kargo durumlarını da düzelt
        const nullCargoResult = await prisma.$executeRaw`
            UPDATE "Siparis" SET "kargoDurumu" = 'ADRESE_TESLIMAT'::text::"KargoDurumu"
            WHERE "kargoDurumu" IS NULL
        `;
        console.log(`   ✅ NULL kargo durumu düzeltildi: ${nullCargoResult} sipariş`);

        // Final kontrol
        console.log('\n📊 GÜNCELLENME SONUÇLARI:');
        const finalCheck = await prisma.siparis.groupBy({
            by: ['durum'],
            _count: true
        });

        finalCheck.forEach(group => {
            console.log(`   📋 ${group.durum}: ${group._count} sipariş`);
        });

        console.log(`\n✅ TOPLAM ${updateCount} SİPARİŞ DURUMU GÜNCELLENDİ!`);
        console.log(`❌ HATA: ${errorCount} sipariş`);

    } catch (error) {
        console.error('❌ HATA:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

updateOrderStatuses(); 