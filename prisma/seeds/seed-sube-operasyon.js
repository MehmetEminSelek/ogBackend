// ===================================================================
// 🏢 ŞUBE VE OPERASYON BİRİMİ SEED SCRIPT
// CSV'den şube ve operasyon birimlerini kaydetme
// ===================================================================

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// CSV dosya yolu
const CSV_PATH = path.join(__dirname, '../../../veriler/Şube ve Operasyon Birimi Kodları.csv');

/**
 * CSV dosyasını okuyan Promise-based helper
 */
function readCSV(filePath, encoding = 'utf8') {
    return new Promise((resolve, reject) => {
        const results = [];

        if (!fs.existsSync(filePath)) {
            reject(new Error(`CSV dosyası bulunamadı: ${filePath}`));
            return;
        }

        fs.createReadStream(filePath, { encoding })
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
    });
}

/**
 * Raw sube ve operasyon data'sı
 */
const subeOperasyonData = [
    // Şubeler
    {
        ad: 'Hava-1',
        kod: 'SB001',
        tip: 'SATIS_SUBESI',
        aktif: true,
        aciklama: 'Hava-1 Satış Şubesi'
    },
    {
        ad: 'Hava-3',
        kod: 'SB002',
        tip: 'SATIS_SUBESI',
        aktif: true,
        aciklama: 'Hava-3 Satış Şubesi'
    },
    {
        ad: 'Hitit',
        kod: 'SB003',
        tip: 'SATIS_SUBESI',
        aktif: true,
        aciklama: 'Hitit Satış Şubesi'
    },
    {
        ad: 'İbrahimli',
        kod: 'SB004',
        tip: 'SATIS_SUBESI',
        aktif: true,
        aciklama: 'İbrahimli Satış Şubesi'
    },
    {
        ad: 'Karagöz',
        kod: 'SB005',
        tip: 'SATIS_SUBESI',
        aktif: true,
        aciklama: 'Karagöz Satış Şubesi'
    },
    {
        ad: 'Otogar',
        kod: 'SB006',
        tip: 'SATIS_SUBESI',
        aktif: true,
        aciklama: 'Otogar Satış Şubesi'
    },
    {
        ad: 'Salon',
        kod: 'SB007',
        tip: 'SATIS_SUBESI',
        aktif: true,
        aciklama: 'Salon Satış Şubesi'
    },

    // Operasyon Birimleri
    {
        ad: 'Ana Depo',
        kod: 'OP001',
        tip: 'DEPO',
        aktif: true,
        aciklama: 'Ana Depo Birimi'
    },
    {
        ad: 'Cep Depo',
        kod: 'OP002',
        tip: 'DEPO',
        aktif: true,
        aciklama: 'Cep Depo Birimi'
    },
    {
        ad: 'Sevkiyat',
        kod: 'OP003',
        tip: 'OPERASYON_BIRIMI',
        aktif: true,
        aciklama: 'Sevkiyat Operasyon Birimi'
    },
    {
        ad: 'Üretim',
        kod: 'OP004',
        tip: 'URETIM_MERKEZI',
        aktif: true,
        aciklama: 'Üretim Merkezi'
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
                            aktif: item.aktif,
                            aciklama: item.aciklama
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
                            aktif: item.aktif,
                            aciklama: item.aciklama
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