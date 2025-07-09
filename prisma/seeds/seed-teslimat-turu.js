// ===================================================================
// 🚚 TESLİMAT TÜRÜ SEED SCRIPT
// CSV'den teslimat türlerini kaydetme
// ===================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * CSV'den alınan teslimat türü verileri
 */
const teslimatTurleriData = [
    {
        ad: 'Evine Gönderilecek',
        kod: 'TT001',
        aciklama: 'Sipariş müşterinin evine gönderilecek',
        varsayilanKargo: 15.00,
        aktif: true
    },
    {
        ad: 'Farklı Şubeden Teslim',
        kod: 'TT002',
        aciklama: 'Sipariş farklı bir şubeden teslim edilecek',
        varsayilanKargo: 0.00,
        aktif: true
    },
    {
        ad: 'Mtn',
        kod: 'TT003',
        aciklama: 'MTN teslimat türü',
        varsayilanKargo: 10.00,
        aktif: true
    },
    {
        ad: 'Otobüs',
        kod: 'TT004',
        aciklama: 'Otobüs ile teslimat',
        varsayilanKargo: 8.00,
        aktif: true
    },
    {
        ad: 'Şubeden Teslim',
        kod: 'TT005',
        aciklama: 'Sipariş şubeden teslim alınacak',
        varsayilanKargo: 0.00,
        aktif: true
    },
    {
        ad: 'Yurtiçi Kargo',
        kod: 'TT006',
        aciklama: 'Yurtiçi kargo ile teslimat',
        varsayilanKargo: 20.00,
        aktif: true
    }
];

/**
 * Ana seed fonksiyonu
 */
async function main() {
    console.log('🚚 TESLİMAT TÜRÜ SEED İŞLEMİ BAŞLIYOR...\n');

    let eklenen = 0;
    let guncellenen = 0;
    let hatalar = 0;

    try {
        console.log('📊 Mevcut teslimat türleri kontrol ediliyor...');
        const mevcutSayisi = await prisma.teslimatTuru.count();
        console.log(`   📋 Mevcut kayıt sayısı: ${mevcutSayisi}\n`);

        // Her teslimat türünü işle
        for (const teslimat of teslimatTurleriData) {
            try {
                console.log(`🚚 ${teslimat.ad} (${teslimat.kod}) işleniyor...`);

                // Mevcut kayıt var mı kontrol et
                const existingTeslimat = await prisma.teslimatTuru.findUnique({
                    where: { kod: teslimat.kod }
                });

                if (existingTeslimat) {
                    console.log(`   ℹ️  ${teslimat.ad} (${teslimat.kod}) zaten mevcut - güncelleniyor`);

                    // Güncelle
                    await prisma.teslimatTuru.update({
                        where: { kod: teslimat.kod },
                        data: {
                            ad: teslimat.ad,
                            aciklama: teslimat.aciklama,
                            varsayilanKargo: teslimat.varsayilanKargo,
                            aktif: teslimat.aktif
                        }
                    });

                    guncellenen++;
                } else {
                    console.log(`   ✅ ${teslimat.ad} (${teslimat.kod}) oluşturuluyor`);

                    // Yeni oluştur
                    await prisma.teslimatTuru.create({
                        data: {
                            ad: teslimat.ad,
                            kod: teslimat.kod,
                            aciklama: teslimat.aciklama,
                            varsayilanKargo: teslimat.varsayilanKargo,
                            aktif: teslimat.aktif
                        }
                    });

                    eklenen++;
                }

                console.log(`   💰 Varsayılan kargo: ${teslimat.varsayilanKargo} TL`);
                console.log(`   ✅ Aktif: ${teslimat.aktif ? 'Evet' : 'Hayır'}\n`);

            } catch (error) {
                console.error(`❌ ${teslimat.ad} kaydedilirken hata:`, error.message);
                hatalar++;
            }
        }

        // Final durum kontrolü
        console.log('📊 KAYIT DURUMU KONTROLÜ:');

        const teslimatTurleri = await prisma.teslimatTuru.findMany({
            where: { aktif: true },
            select: { kod: true, ad: true, varsayilanKargo: true },
            orderBy: { kod: 'asc' }
        });

        console.log(`\n🚚 AKTİF TESLİMAT TÜRLERİ (${teslimatTurleri.length} adet):`);
        teslimatTurleri.forEach(t => {
            console.log(`   • ${t.kod}: ${t.ad} (${t.varsayilanKargo} TL)`);
        });

        // Kargo ücretli ve ücretsiz teslimatları ayır
        const ucretliTeslimat = teslimatTurleri.filter(t => t.varsayilanKargo > 0);
        const ucretsizTeslimat = teslimatTurleri.filter(t => t.varsayilanKargo === 0);

        console.log(`\n💰 KARGO ÜCRETLİ (${ucretliTeslimat.length} adet):`);
        ucretliTeslimat.forEach(t => {
            console.log(`   • ${t.ad}: ${t.varsayilanKargo} TL`);
        });

        console.log(`\n🆓 ÜCRETSİZ TESLİMAT (${ucretsizTeslimat.length} adet):`);
        ucretsizTeslimat.forEach(t => {
            console.log(`   • ${t.ad}`);
        });

        // Final özet
        console.log('\n🎉 TESLİMAT TÜRÜ SEED İŞLEMİ TAMAMLANDI!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Yeni eklenen: ${eklenen}`);
        console.log(`🔄 Güncellenen: ${guncellenen}`);
        console.log(`❌ Hata sayısı: ${hatalar}`);
        console.log(`📋 Toplam aktif teslimat türü: ${teslimatTurleri.length}`);
        console.log(`💰 Ortalama kargo ücreti: ${(teslimatTurleri.reduce((sum, t) => sum + t.varsayilanKargo, 0) / teslimatTurleri.length).toFixed(2)} TL`);

    } catch (error) {
        console.error('❌ Fatal Hata:', error);
        process.exit(1);
    }
}

// Script'i çalıştır
main()
    .catch((e) => {
        console.error('❌ Fatal Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 