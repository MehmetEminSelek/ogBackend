const http = require('http');

const data = JSON.stringify({
    tarih: '2025-05-21',
    teslimatTuruId: 1,
    gonderenAdi: 'Test Müşteri',
    gonderenTel: '5551234567',
    ozelTepsiId: 1,  // Bayram Tepsisi'nin ID'si
    siparisler: []   // Boş sipariş dizisi
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/siparis',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

console.log('İstek gönderiliyor:', options.method, options.hostname + ':' + options.port + options.path);
console.log('İstek verisi:', JSON.parse(data));

const req = http.request(options, (res) => {
    console.log('Yanıt alındı - Status:', res.statusCode);
    console.log('Yanıt başlıkları:', res.headers);

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
        console.log('Veri parçası alındı:', chunk.length, 'bytes');
    });

    res.on('end', () => {
        console.log('Yanıt tamamlandı');
        try {
            const parsedResponse = JSON.parse(responseData);
            console.log('Yanıt (JSON):', JSON.stringify(parsedResponse, null, 2));
        } catch (e) {
            console.log('Yanıt JSON olarak ayrıştırılamadı');
            console.log('Ham yanıt:', responseData);
            if (responseData) {
                console.log('Yanıt uzunluğu:', responseData.length);
                console.log('Yanıt buffer:', Buffer.from(responseData));
            }
        }
    });
});

req.on('error', (error) => {
    console.error('Bağlantı hatası:', error.message);
    if (error.code === 'ECONNREFUSED') {
        console.error('Sunucuya bağlanılamadı. Sunucunun çalıştığından emin olun.');
    }
});

req.write(data);
req.end(); 