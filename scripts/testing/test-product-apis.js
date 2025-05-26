// scripts/testing/test-product-apis.js
// Ürün Yönetimi API Test Script'i

const axios = require('axios');

// Environment'a göre base URL belirle
const getBaseUrl = () => {
    if (process.env.NODE_ENV === 'production') {
        return process.env.API_BASE_URL || 'https://yourdomain.com/api';
    }
    return process.env.API_BASE_URL || 'http://localhost:3000/api';
};

const BASE_URL = getBaseUrl();

async function testProductAPIs() {
    console.log('🧪 Ürün Yönetimi API Testleri Başlıyor...');
    console.log(`🌐 Base URL: ${BASE_URL}\n`);

    try {
        // 1. Kategorileri listele
        console.log('📂 1. Kategoriler API Testi...');
        const kategorilerResponse = await axios.get(`${BASE_URL}/kategoriler`);
        console.log(`   ✅ ${kategorilerResponse.data.kategoriler.length} kategori listelendi`);

        const kategoriler = kategorilerResponse.data.kategoriler;
        kategoriler.forEach(kategori => {
            console.log(`      - ${kategori.ad} (${kategori.urunSayisi} ürün)`);
        });

        // 2. Ürünleri listele
        console.log('\n🛍️ 2. Ürünler API Testi...');
        const urunlerResponse = await axios.get(`${BASE_URL}/urunler`);
        console.log(`   ✅ ${urunlerResponse.data.urunler.length} ürün listelendi`);
        console.log(`   📄 Sayfa: ${urunlerResponse.data.pagination.page}/${urunlerResponse.data.pagination.totalPages}`);

        const urunler = urunlerResponse.data.urunler;
        urunler.forEach(urun => {
            const fiyat = urun.guncelFiyat ? `${urun.guncelFiyat.fiyat} TL/${urun.guncelFiyat.birim}` : 'Fiyat yok';
            console.log(`      - ${urun.ad} (${urun.kodu}) - ${fiyat}`);
        });

        // 3. Kategori filtreli ürün arama
        console.log('\n🔍 3. Kategori Filtreli Arama Testi...');
        const kurabiyeKategori = kategoriler.find(k => k.ad === 'Kurabiyeler');
        if (kurabiyeKategori) {
            const filtreliResponse = await axios.get(`${BASE_URL}/urunler?kategori=${kurabiyeKategori.id}`);
            console.log(`   ✅ ${filtreliResponse.data.urunler.length} kurabiye ürünü bulundu`);
            filtreliResponse.data.urunler.forEach(urun => {
                console.log(`      - ${urun.ad}`);
            });
        }

        // 4. Arama testi
        console.log('\n🔎 4. Arama Testi...');
        const aramaResponse = await axios.get(`${BASE_URL}/urunler?search=çikolata`);
        console.log(`   ✅ "çikolata" araması: ${aramaResponse.data.urunler.length} sonuç`);
        aramaResponse.data.urunler.forEach(urun => {
            console.log(`      - ${urun.ad}`);
        });

        // 5. Fiyatları listele
        console.log('\n💰 5. Fiyatlar API Testi...');
        const fiyatlarResponse = await axios.get(`${BASE_URL}/fiyatlar`);
        console.log(`   ✅ ${fiyatlarResponse.data.fiyatlar.length} fiyat listelendi`);

        fiyatlarResponse.data.fiyatlar.forEach(fiyat => {
            console.log(`      - ${fiyat.urun.ad}: ${fiyat.fiyat} TL/${fiyat.birim} (${fiyat.fiyatTipi})`);
        });

        // 6. Yeni kategori oluştur
        console.log('\n➕ 6. Yeni Kategori Oluşturma Testi...');
        const yeniKategoriData = {
            ad: 'Test Kategorisi',
            aciklama: 'API test için oluşturulan kategori',
            renk: '#FF5722',
            ikon: 'mdi-test-tube',
            siraNo: 99
        };

        const yeniKategoriResponse = await axios.post(`${BASE_URL}/kategoriler`, yeniKategoriData);
        console.log(`   ✅ Yeni kategori oluşturuldu: ${yeniKategoriResponse.data.kategori.ad}`);
        const testKategoriId = yeniKategoriResponse.data.kategori.id;

        // 7. Yeni ürün oluştur
        console.log('\n➕ 7. Yeni Ürün Oluşturma Testi...');
        const yeniUrunData = {
            ad: 'Test Ürünü',
            kodu: 'TEST001',
            aciklama: 'API test için oluşturulan ürün',
            kisaAciklama: 'Test ürünü',
            kategoriId: testKategoriId,
            agirlik: 100,
            stokKodu: 'STK-TEST001',
            barkod: '1234567890123',
            satisaBirimi: 'Adet',
            minSatisMiktari: 1,
            kritikStokSeviye: 5,
            malzeme: 'Test malzemesi',
            uretimSuresi: 30,
            rafOmru: 10,
            maliyetFiyati: 5.00,
            karMarji: 50,
            yeniUrun: true,
            anahtarKelimeler: ['test', 'api']
        };

        const yeniUrunResponse = await axios.post(`${BASE_URL}/urunler`, yeniUrunData);
        console.log(`   ✅ Yeni ürün oluşturuldu: ${yeniUrunResponse.data.urun.ad}`);
        const testUrunId = yeniUrunResponse.data.urun.id;

        // 8. Yeni fiyat oluştur
        console.log('\n➕ 8. Yeni Fiyat Oluşturma Testi...');
        const yeniFiyatData = {
            urunId: testUrunId,
            fiyat: 10.00,
            birim: 'Adet',
            fiyatTipi: 'normal',
            gecerliTarih: new Date().toISOString().split('T')[0],
            vergiOrani: 18
        };

        const yeniFiyatResponse = await axios.post(`${BASE_URL}/fiyatlar`, yeniFiyatData);
        console.log(`   ✅ Yeni fiyat oluşturuldu: ${yeniFiyatResponse.data.fiyat.fiyat} TL`);

        // 9. Ürün güncelleme testi
        console.log('\n✏️ 9. Ürün Güncelleme Testi...');
        const guncelUrunData = {
            aciklama: 'Güncellenmiş test ürünü açıklaması',
            karMarji: 60
        };

        const guncelUrunResponse = await axios.put(`${BASE_URL}/urunler?id=${testUrunId}`, guncelUrunData);
        console.log(`   ✅ Ürün güncellendi: ${guncelUrunResponse.data.urun.ad}`);

        // 10. Temizlik - Test verilerini sil
        console.log('\n🧹 10. Test Verilerini Temizleme...');

        // Fiyatı sil
        await axios.delete(`${BASE_URL}/fiyatlar?id=${yeniFiyatResponse.data.fiyat.id}`);
        console.log('   ✅ Test fiyatı silindi');

        // Ürünü sil
        await axios.delete(`${BASE_URL}/urunler?id=${testUrunId}`);
        console.log('   ✅ Test ürünü silindi');

        // Kategoriyi sil
        await axios.delete(`${BASE_URL}/kategoriler?id=${testKategoriId}`);
        console.log('   ✅ Test kategorisi silindi');

        console.log('\n🎉 Tüm API testleri başarıyla tamamlandı!');

        // Özet istatistikler
        console.log('\n📊 ÖZET İSTATİSTİKLER:');
        console.log(`   📂 Toplam Kategori: ${kategoriler.length}`);
        console.log(`   🛍️ Toplam Ürün: ${urunler.length}`);
        console.log(`   💰 Toplam Fiyat: ${fiyatlarResponse.data.fiyatlar.length}`);
        console.log(`   🔍 Çikolata Araması: ${aramaResponse.data.urunler.length} sonuç`);

    } catch (error) {
        console.error('❌ API Test Hatası:', error.response?.data || error.message);

        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   URL: ${error.config.url}`);
        }
    }
}

// Script'i çalıştır
if (require.main === module) {
    testProductAPIs()
        .then(() => {
            console.log('\n✅ Test işlemi tamamlandı!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Test işlemi başarısız:', error);
            process.exit(1);
        });
}

module.exports = { testProductAPIs }; 