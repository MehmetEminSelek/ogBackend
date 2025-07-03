const fs = require('fs');
const path = require('path');

function debugCSVParsing(content) {
    const lines = content.split('\n').filter(line => line.trim());

    console.log('🔍 CSV PARSİNG DEBUG\n');
    console.log(`📄 Toplam satır: ${lines.length}\n`);

    // İlk 20 satırı detaylı analiz et
    for (let i = 0; i < Math.min(20, lines.length); i++) {
        const line = lines[i].trim();
        const cols = line.split(',');

        console.log(`Satır ${i + 1}: "${line}"`);
        console.log(`  Sütun sayısı: ${cols.length}`);
        cols.forEach((col, index) => {
            console.log(`  [${index}]: "${col}"`);
        });

        // Reçete başlığı mı?
        const isRecipeHeader = cols[0] &&
            (cols[0].includes('(UR)') || cols[0].includes('(YM)')) &&
            !cols[1] && !cols[2];

        if (isRecipeHeader) {
            console.log(`  ✅ REÇETE BAŞLIĞI: ${cols[0]}`);
        }

        // Malzeme satırı mı?
        else if (cols[0] && cols[1] && cols[2] &&
            cols[0] !== 'Stok Adı' &&
            !cols[0].includes('Fire') &&
            cols[0] !== '') {

            let amount = cols[2].trim().replace(/"/g, '').replace(',', '.');
            console.log(`  🥄 MALZEME: ${cols[0]} | ${cols[1]} | "${cols[2]}" -> ${amount}`);
            console.log(`  📊 Sayısal değer: ${parseFloat(amount)} (valid: ${!isNaN(parseFloat(amount))})`);
        }

        console.log('');
    }
}

async function main() {
    try {
        const csvPath = path.join(__dirname, '../veriler/Kurallar ve kodlar.xlsx - Reçeteler.csv');
        const csvContent = fs.readFileSync(csvPath, 'utf-8');

        debugCSVParsing(csvContent);

        // Miktar değerlerini özel olarak kontrol et
        console.log('\n🔢 MİKTAR DEĞERLERİ ANALİZİ:');
        const lines = csvContent.split('\n');

        const miktarSamples = [
            '"0,06281"',
            '"0,59296"',
            '"0,38168"',
            '"0,4771"',
            '"0,23855"'
        ];

        miktarSamples.forEach(sample => {
            const cleaned = sample.replace(/"/g, '').replace(',', '.');
            console.log(`${sample} -> "${cleaned}" -> ${parseFloat(cleaned)}`);
        });

    } catch (error) {
        console.error('❌ HATA:', error);
    }
}

main(); 