const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const result = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',');

        // Hammadde verisi
        if (cols[0] && cols[1] && cols[0] !== 'HAMMADDE ADI') {
            result.push({
                ad: cols[0].trim(),
                kod: cols[1].trim(),
                tipi: 'HAMMADDE'
            });
        }

        // Yarı mamul verisi (4. ve 5. sütun)
        if (cols[3] && cols[4] && cols[3] !== 'YARI MAMUL ADI ') {
            result.push({
                ad: cols[3].trim(),
                kod: cols[4].trim(),
                tipi: 'YARI_MAMUL'
            });
        }
    }

    return result;
}

async function main() {
    console.log('📦 MALZEME VERİLERİ YÜKLENİYOR...\n');

    try {
        // CSV dosyasını oku
        const csvPath = path.join(__dirname, '../../veriler/Kurallar ve kodlar.xlsx - Hammade ve Yarı Mamüller Kodlar.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        // CSV'yi parse et
        const materials = parseCSV(csvContent);
        console.log(`📊 ${materials.length} malzeme bulundu`);

        // Mevcut malzemeleri temizle
        const deletedCount = await prisma.material.deleteMany();
        console.log(`🗑️  ${deletedCount.count} mevcut malzeme silindi`);

        // Her malzemeyi ekle
        let successCount = 0;
        let errorCount = 0;

        for (const material of materials) {
            try {
                // Birim belirle (hammadde genelde KG, yarı mamul de KG)
                const birim = 'KG';

                // Rastgele stok seviyesi (test amaçlı)
                const mevcutStok = Math.floor(Math.random() * 1000) + 100; // 100-1100 kg arası
                const minStokSeviye = Math.floor(mevcutStok * 0.1); // %10'u minimum
                const kritikSeviye = Math.floor(mevcutStok * 0.2); // %20'si kritik

                // Rastgele birim fiyat (test amaçlı)
                const birimFiyat = material.tipi === 'HAMMADDE' ?
                    Math.floor(Math.random() * 100) + 20 : // 20-120 TL/kg
                    Math.floor(Math.random() * 50) + 30;   // 30-80 TL/kg

                await prisma.material.create({
                    data: {
                        ad: material.ad,
                        kod: material.kod,
                        tipi: material.tipi,
                        birim: birim,
                        birimFiyat: birimFiyat,
                        mevcutStok: mevcutStok,
                        minStokSeviye: minStokSeviye,
                        kritikSeviye: kritikSeviye,
                        aciklama: `${material.tipi} - Otomatik yüklendi`,
                        aktif: true
                    }
                });

                successCount++;

                if (successCount % 5 === 0) {
                    console.log(`📈 Progress: ${successCount}/${materials.length}`);
                }

            } catch (error) {
                console.error(`❌ ${material.ad} eklenirken hata:`, error.message);
                errorCount++;
            }
        }

        console.log('\n🎉 MALZEME VERİLERİ YÜKLENDİ!');
        console.log(`📊 İstatistikler:`);
        console.log(`   ✅ Başarılı: ${successCount}`);
        console.log(`   ❌ Hata: ${errorCount}`);

        // Tür bazında özet
        const counts = await prisma.material.groupBy({
            by: ['tipi'],
            _count: true
        });

        console.log('\n📋 Malzeme türü dağılımı:');
        counts.forEach(group => {
            const emoji = group.tipi === 'HAMMADDE' ? '🌾' : '🏭';
            console.log(`   ${emoji} ${group.tipi}: ${group._count} adet`);
        });

        // Örnek malzemeler
        console.log('\n📦 Örnek malzemeler:');
        const ornekler = await prisma.material.findMany({
            take: 5,
            select: {
                ad: true,
                kod: true,
                tipi: true,
                mevcutStok: true,
                birim: true,
                birimFiyat: true
            }
        });

        ornekler.forEach(m => {
            console.log(`   • ${m.ad} (${m.kod}) - ${m.mevcutStok} ${m.birim} - ${m.birimFiyat}₺/${m.birim}`);
        });

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