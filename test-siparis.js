const http = require('http');

const data = JSON.stringify({
    tarih: '2025-05-21',
    teslimatTuruId: 1,
    gonderenAdi: 'Test Müşteri',
    gonderenTel: '5551234567',
    siparisler: [
        {
            AmbalajId: 1,
            Urunler: [
                {
                    UrunId: 1,
                    Miktar: 1,
                    Birim: 'KG'
                }
            ]
        }
    ]
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

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Yanıt:', responseData);
    });
});

req.on('error', (error) => {
    console.error('Hata:', error);
});

req.write(data);
req.end(); 