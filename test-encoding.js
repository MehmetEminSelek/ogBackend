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

async function testEncoding() {
    console.log('🔤 Farklı encoding'ler test ediliyor...\n');
  
  const encodings = ['utf8', 'latin1', 'ascii', 'utf16le'];

    for (const encoding of encodings) {
        try {
            console.log(`📝 ${encoding.toUpperCase()} encoding test:`);
            const csvData = await readCSV(CSV_PATH, encoding);

            if (csvData.length > 0) {
                const firstRow = csvData[0];
                const keys = Object.keys(firstRow);
                console.log(`   Satır sayısı: ${csvData.length}`);
                console.log(`   Kolonlar: ${keys.join(', ')}`);
                console.log(`   İlk satır: ${JSON.stringify(firstRow).substring(0, 100)}...`);

                // Türkçe karakterleri kontrol et
                const firstValue = Object.values(firstRow)[0];
                if (firstValue && firstValue.includes('Ç')) {
                    console.log(`   ✅ Türkçe karakter OK: ${firstValue}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ ${encoding} hatası: ${error.message}`);
        }
        console.log('');
    }

    // Manuel okuma da deneyelim
    console.log('📖 RAW İÇERİK (İlk 500 karakter):');
    const rawContent = fs.readFileSync(CSV_PATH, 'utf8');
    console.log(rawContent.substring(0, 500));
    console.log('\n---\n');

    // Satırları manuel parse et
    const lines = rawContent.split('\n');
    console.log(`📋 Manuel parse: ${lines.length} satır`);
    console.log('İlk 5 satır:');
    lines.slice(0, 5).forEach((line, index) => {
        console.log(`${index + 1}: ${line}`);
    });
}

testEncoding().catch(console.error); 