const http = require('http');

function testAPI(path, description) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`✅ ${description}:`);
                    if (Array.isArray(jsonData)) {
                        console.log(`   📊 ${jsonData.length} kayıt bulundu`);
                        if (jsonData.length > 0) {
                            console.log(`   📄 İlk kayıt:`, JSON.stringify(jsonData[0], null, 2).slice(0, 200) + '...');
                        }
                    } else {
                        console.log(`   📄 Sonuç:`, JSON.stringify(jsonData, null, 2).slice(0, 200) + '...');
                    }
                    resolve(jsonData);
                } catch (error) {
                    console.log(`❌ ${description} - JSON parse hatası:`, data.slice(0, 200));
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${description} - Bağlantı hatası:`, error.message);
            reject(error);
        });

        req.end();
    });
}

async function testAPIs() {
    console.log('🧪 API TEST BAŞLANIYOR...\n');

    try {
        await testAPI('/api/orders', 'Siparişler API');
        await testAPI('/api/hazirlanacak', 'Hazırlanacak API');
        await testAPI('/api/cari', 'Cari API');

        console.log('\n✅ TÜM API TESTLERİ TAMAMLANDI!');
    } catch (error) {
        console.log('\n❌ API TEST HATASI:', error.message);
    }
}

testAPIs(); 