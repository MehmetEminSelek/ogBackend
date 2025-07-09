// ===================================================================
// 🏢 ŞUBE VE OPERASYON BİRİMİ SEED SCRIPT - FIXED
// Mevcut Sube model alanları ile uyumlu hale getirildi
// ===================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Raw sube ve operasyon data'sı
 */
const subeOperasyonData = [
    // Şubeler
    {
        ad: 'Hava-1',
        kod: 'SB001',
        tip: 'SATIS_SUBESI',
        aktif: true
    },
    {
        ad: 'Hava-3',
        kod: 'SB002',
        tip: 'SATIS_SUBESI',
        aktif: true
    },
    {
        ad: 'Hitit',
        kod: 'SB003',
        tip: 'SATIS_SUBESI',
        aktif: true
    },
    {
        ad: 'İbrahimli',
        kod: 'SB004',
        tip: 'SATIS_SUBESI',
        aktif: true
    },
    {
        ad: 'Karagöz',
        kod: 'SB005',
        tip: 'SATIS_SUBESI',
        aktif: true
    },
    {
        ad: 'Otogar',
        kod: 'SB006',
        tip: 'SATIS_SUBESI',
        aktif: true
    },
    {
        ad: 'Salon',
        kod: 'SB007',
        tip: 'SATIS_SUBESI',
        aktif: true
    },

    // Operasyon Birimleri
    {
        ad: 'Ana Depo',
        kod: 'OP001',
        tip: 'DEPO',
        aktif: true
    },
    {
        ad: 'Cep Depo',
        kod: 'OP002',
        tip: 'DEPO',
        aktif: true
    },
    {
        ad: 'Sevkiyat',
        kod: 'OP003',
        tip: 'OPERASYON_BIRIMI',
        aktif: true
    },
    {
        ad: 'Üretim',
        kod: 'OP004',
        tip: 'URETIM_MERKEZI',
        aktif: true
    }
];

/**
 * Ana seed fonksiyonu
 */
async function main() {
    console.log('🏢 ŞUBE VE OPERASYON BİRİMİ SEED İŞLEMİ BAŞLIYOR...\n');

    let toplamSube = 0;
    let toplamOperasyon = 0;
    let hatalar = 0;

    try {
        console.log('📊 Mevcut şube ve operasyon birimlerini kontrol ediliyor...');
        const mevcutSayisi = await prisma.sube.count();
        console.log(`   📋 Mevcut kayıt sayısı: ${mevcutSayisi}\n`);

        // Her şube/operasyon birimini işle
        for (const item of subeOperasyonData) {
            try {
                console.log(`🏢 ${item.ad} (${item.kod}) işleniyor...`);

                // Mevcut kayıt var mı kontrol et
                const existingSube = await prisma.sube.findUnique({
                    where: { kod: item.kod }
                });

                if (existingSube) {
                    console.log(`   ℹ️  ${item.ad} (${item.kod}) zaten mevcut - güncelleniyor`);

                    // Güncelle
                    await prisma.sube.update({
                        where: { kod: item.kod },
                        data: {
                            ad: item.ad,
                            tip: item.tip,
                            aktif: item.aktif
                        }
                    });
                } else {
                    console.log(`   ✅ ${item.ad} (${item.kod}) oluşturuluyor`);

                    // Yeni oluştur
                    await prisma.sube.create({
                        data: {
                            ad: item.ad,
                            kod: item.kod,
                            tip: item.tip,
                            aktif: item.aktif
                        }
                    });
                }

                // Kategorize et
                if (item.tip === 'SATIS_SUBESI') {
                    toplamSube++;
                } else {
                    toplamOperasyon++;
                }

                console.log(`   📍 Tip: ${item.tip}`);
                console.log(`   ✅ Aktif: ${item.aktif ? 'Evet' : 'Hayır'}\n`);

            } catch (error) {
                console.error(`❌ ${item.ad} kaydedilirken hata:`, error.message);
                hatalar++;
            }
        }

        // Final durum kontrolü
        console.log('📊 KAYIT DURUMU KONTROLÜ:');

        const satisSubeleri = await prisma.sube.findMany({
            where: { tip: 'SATIS_SUBESI', aktif: true },
            select: { ad: true, kod: true }
        });

        const operasyonBirimleri = await prisma.sube.findMany({
            where: {
                tip: { in: ['DEPO', 'OPERASYON_BIRIMI', 'URETIM_MERKEZI'] },
                aktif: true
            },
            select: { ad: true, kod: true, tip: true }
        });

        console.log(`\n🏪 SATIŞ ŞUBELERİ (${satisSubeleri.length} adet):`);
        satisSubeleri.forEach(sube => {
            console.log(`   • ${sube.ad} (${sube.kod})`);
        });

        console.log(`\n🏭 OPERASYON BİRİMLERİ (${operasyonBirimleri.length} adet):`);
        operasyonBirimleri.forEach(op => {
            console.log(`   • ${op.ad} (${op.kod}) - ${op.tip}`);
        });

        // Final özet
        console.log('\n🎉 ŞUBE VE OPERASYON BİRİMİ SEED İŞLEMİ TAMAMLANDI!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Toplam işlenen kayıt: ${subeOperasyonData.length}`);
        console.log(`🏪 Satış şubesi: ${toplamSube}`);
        console.log(`🏭 Operasyon birimi: ${toplamOperasyon}`);
        console.log(`❌ Hata sayısı: ${hatalar}`);
        console.log(`📋 Database'de toplam aktif kayıt: ${satisSubeleri.length + operasyonBirimleri.length}`);

        // İlave bilgiler
        console.log('\n📋 TİP DAĞILIMI:');
        const tipDagilimi = await prisma.sube.groupBy({
            by: ['tip'],
            where: { aktif: true },
            _count: { tip: true }
        });

        tipDagilimi.forEach(tip => {
            console.log(`   ${tip.tip}: ${tip._count.tip} adet`);
        });

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