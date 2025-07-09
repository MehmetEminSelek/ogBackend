const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const CSV_PATH = path.join(__dirname, '../veriler/Reçeteler.csv');

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

async function debug() {
    console.log('🔍 CSV Debug işlemi başlıyor...\n');

    const csvData = await readCSV(CSV_PATH);

    console.log(`📋 Toplam satır: ${csvData.length}`);
    console.log('📄 İlk 10 satır:\n');

    csvData.slice(0, 15).forEach((row, index) => {
        const firstCol = Object.values(row)[0];
        const keys = Object.keys(row);

        console.log(`Satır ${index + 1}:`);
        console.log(`  İlk kolon: "${firstCol}"`);
        console.log(`  Kolonlar: ${keys.join(', ')}`);
        console.log(`  Stok Adı: "${row['Stok Adı']}"`);
        console.log(`  Birim: "${row['Birim']}"`);
        console.log(`  Net Miktar: "${row['Net Miktar']}"`);
        console.log('---');
    });

    // Reçete başlangıçlarını bul
    console.log('\n🎯 REÇETE BAŞLANGIÇLARI:');
    csvData.forEach((row, index) => {
        const firstCol = Object.values(row)[0];
        if (firstCol && (firstCol.includes('(UR)') || firstCol.includes('(YM)'))) {
            console.log(`Satır ${index + 1}: ${firstCol}`);
        }
    });

    // Malzeme satırlarını bul
    console.log('\n📦 İLK BİRKAÇ MALZEME SATIRI:');
    let malzemeCount = 0;
    csvData.forEach((row, index) => {
        if (row['Stok Adı'] && row['Stok Adı'] !== 'Stok Adı' && row['Stok Adı'].trim()) {
            if (malzemeCount < 10) {
                console.log(`Satır ${index + 1}: ${row['Stok Adı']} - ${row['Birim']} - ${row['Net Miktar']}`);
                malzemeCount++;
            }
        }
    });
}

debug().catch(console.error); 