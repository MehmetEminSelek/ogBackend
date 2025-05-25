// scripts/testing/seed-product-data.js
// Ürün Yönetimi Test Verisi

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProductData() {
    try {
        console.log('🌱 Ürün yönetimi test verisi ekleniyor...\n');

        // 1. Kategoriler oluştur
        console.log('📂 Kategoriler oluşturuluyor...');
        const kategoriler = await Promise.all([
            prisma.urunKategori.create({
                data: {
                    ad: 'Kurabiyeler',
                    aciklama: 'Çeşitli kurabiye türleri',
                    renk: '#FF9800',
                    ikon: 'mdi-cookie',
                    siraNo: 1
                }
            }),
            prisma.urunKategori.create({
                data: {
                    ad: 'Kekler',
                    aciklama: 'Tatlı kek çeşitleri',
                    renk: '#E91E63',
                    ikon: 'mdi-cake',
                    siraNo: 2
                }
            }),
            prisma.urunKategori.create({
                data: {
                    ad: 'Börekler',
                    aciklama: 'Tuzlu börek çeşitleri',
                    renk: '#4CAF50',
                    ikon: 'mdi-food-croissant',
                    siraNo: 3
                }
            }),
            prisma.urunKategori.create({
                data: {
                    ad: 'Tatlılar',
                    aciklama: 'Geleneksel tatlılar',
                    renk: '#9C27B0',
                    ikon: 'mdi-candy',
                    siraNo: 4
                }
            }),
            prisma.urunKategori.create({
                data: {
                    ad: 'Ekmekler',
                    aciklama: 'Günlük ekmek çeşitleri',
                    renk: '#795548',
                    ikon: 'mdi-bread-slice',
                    siraNo: 5
                }
            })
        ]);

        console.log(`✅ ${kategoriler.length} kategori oluşturuldu\n`);

        // 2. Ürünler oluştur
        console.log('🛍️ Ürünler oluşturuluyor...');
        const urunler = await Promise.all([
            // Kurabiyeler
            prisma.urun.create({
                data: {
                    ad: 'Fıstıklı Kurabiye',
                    kodu: 'KUR001',
                    aciklama: 'Antep fıstığı ile hazırlanan özel kurabiye',
                    kisaAciklama: 'Fıstıklı kurabiye',
                    kategoriId: kategoriler[0].id,
                    agirlik: 50,
                    stokKodu: 'STK-KUR001',
                    barkod: '8690123456789',
                    satisaBirimi: 'Adet',
                    minSatisMiktari: 1,
                    kritikStokSeviye: 20,
                    malzeme: 'Un, Fıstık, Tereyağı, Şeker',
                    uretimSuresi: 45,
                    rafOmru: 15,
                    saklamaKosullari: 'Kuru ve serin yerde saklayınız',
                    maliyetFiyati: 2.50,
                    karMarji: 40,
                    yeniUrun: true,
                    anahtarKelimeler: ['fıstık', 'kurabiye', 'tatlı']
                }
            }),
            prisma.urun.create({
                data: {
                    ad: 'Çikolatalı Kurabiye',
                    kodu: 'KUR002',
                    aciklama: 'Belçika çikolatası ile hazırlanan kurabiye',
                    kisaAciklama: 'Çikolatalı kurabiye',
                    kategoriId: kategoriler[0].id,
                    agirlik: 45,
                    stokKodu: 'STK-KUR002',
                    barkod: '8690123456790',
                    satisaBirimi: 'Adet',
                    minSatisMiktari: 1,
                    kritikStokSeviye: 25,
                    malzeme: 'Un, Çikolata, Tereyağı, Şeker',
                    uretimSuresi: 40,
                    rafOmru: 12,
                    saklamaKosullari: 'Serin yerde saklayınız',
                    maliyetFiyati: 2.80,
                    karMarji: 35,
                    ozelUrun: true,
                    anahtarKelimeler: ['çikolata', 'kurabiye', 'tatlı']
                }
            }),

            // Kekler
            prisma.urun.create({
                data: {
                    ad: 'Vanilyalı Kek',
                    kodu: 'KEK001',
                    aciklama: 'Doğal vanilya aromalı yumuşak kek',
                    kisaAciklama: 'Vanilyalı kek',
                    kategoriId: kategoriler[1].id,
                    agirlik: 500,
                    stokKodu: 'STK-KEK001',
                    barkod: '8690123456791',
                    satisaBirimi: 'Dilim',
                    minSatisMiktari: 1,
                    kritikStokSeviye: 10,
                    malzeme: 'Un, Yumurta, Süt, Vanilya, Şeker',
                    uretimSuresi: 60,
                    rafOmru: 5,
                    saklamaKosullari: 'Buzdolabında saklayınız',
                    maliyetFiyati: 15.00,
                    karMarji: 50,
                    anahtarKelimeler: ['vanilya', 'kek', 'tatlı']
                }
            }),
            prisma.urun.create({
                data: {
                    ad: 'Çikolatalı Kek',
                    kodu: 'KEK002',
                    aciklama: 'Yoğun çikolata aromalı nemli kek',
                    kisaAciklama: 'Çikolatalı kek',
                    kategoriId: kategoriler[1].id,
                    agirlik: 550,
                    stokKodu: 'STK-KEK002',
                    barkod: '8690123456792',
                    satisaBirimi: 'Dilim',
                    minSatisMiktari: 1,
                    kritikStokSeviye: 8,
                    malzeme: 'Un, Yumurta, Süt, Kakao, Çikolata',
                    uretimSuresi: 65,
                    rafOmru: 5,
                    saklamaKosullari: 'Buzdolabında saklayınız',
                    maliyetFiyati: 18.00,
                    karMarji: 45,
                    indirimliUrun: true,
                    anahtarKelimeler: ['çikolata', 'kek', 'tatlı']
                }
            }),

            // Börekler
            prisma.urun.create({
                data: {
                    ad: 'Su Böreği',
                    kodu: 'BOR001',
                    aciklama: 'Geleneksel su böreği, peynir ve ıspanak ile',
                    kisaAciklama: 'Su böreği',
                    kategoriId: kategoriler[2].id,
                    agirlik: 200,
                    stokKodu: 'STK-BOR001',
                    barkod: '8690123456793',
                    satisaBirimi: 'Porsiyon',
                    minSatisMiktari: 1,
                    kritikStokSeviye: 15,
                    malzeme: 'Yufka, Peynir, Ispanak, Yumurta',
                    uretimSuresi: 90,
                    rafOmru: 3,
                    saklamaKosullari: 'Buzdolabında saklayınız',
                    maliyetFiyati: 8.00,
                    karMarji: 60,
                    anahtarKelimeler: ['börek', 'peynir', 'ıspanak']
                }
            }),

            // Tatlılar
            prisma.urun.create({
                data: {
                    ad: 'Baklava',
                    kodu: 'TAT001',
                    aciklama: 'Antep fıstığı ile hazırlanan geleneksel baklava',
                    kisaAciklama: 'Fıstıklı baklava',
                    kategoriId: kategoriler[3].id,
                    agirlik: 100,
                    stokKodu: 'STK-TAT001',
                    barkod: '8690123456794',
                    satisaBirimi: 'Adet',
                    minSatisMiktari: 1,
                    kritikStokSeviye: 30,
                    malzeme: 'Yufka, Fıstık, Şerbet, Tereyağı',
                    uretimSuresi: 120,
                    rafOmru: 7,
                    saklamaKosullari: 'Oda sıcaklığında saklayınız',
                    maliyetFiyati: 12.00,
                    karMarji: 55,
                    ozelUrun: true,
                    anahtarKelimeler: ['baklava', 'fıstık', 'tatlı']
                }
            }),

            // Ekmekler
            prisma.urun.create({
                data: {
                    ad: 'Tam Buğday Ekmeği',
                    kodu: 'EKM001',
                    aciklama: '100% tam buğday unu ile hazırlanan sağlıklı ekmek',
                    kisaAciklama: 'Tam buğday ekmeği',
                    kategoriId: kategoriler[4].id,
                    agirlik: 750,
                    stokKodu: 'STK-EKM001',
                    barkod: '8690123456795',
                    satisaBirimi: 'Adet',
                    minSatisMiktari: 1,
                    kritikStokSeviye: 50,
                    malzeme: 'Tam Buğday Unu, Maya, Tuz, Su',
                    uretimSuresi: 180,
                    rafOmru: 3,
                    saklamaKosullari: 'Kuru yerde saklayınız',
                    maliyetFiyati: 4.00,
                    karMarji: 75,
                    yeniUrun: true,
                    anahtarKelimeler: ['ekmek', 'tam buğday', 'sağlıklı']
                }
            })
        ]);

        console.log(`✅ ${urunler.length} ürün oluşturuldu\n`);

        // 3. Fiyatlar oluştur
        console.log('💰 Fiyatlar oluşturuluyor...');
        const fiyatlar = await Promise.all([
            // Kurabiye fiyatları
            prisma.fiyat.create({
                data: {
                    urunId: urunler[0].id,
                    fiyat: 3.50,
                    birim: 'Adet',
                    fiyatTipi: 'normal',
                    gecerliTarih: new Date('2024-01-01'),
                    vergiOrani: 18
                }
            }),
            prisma.fiyat.create({
                data: {
                    urunId: urunler[1].id,
                    fiyat: 4.00,
                    birim: 'Adet',
                    fiyatTipi: 'normal',
                    gecerliTarih: new Date('2024-01-01'),
                    vergiOrani: 18
                }
            }),

            // Kek fiyatları
            prisma.fiyat.create({
                data: {
                    urunId: urunler[2].id,
                    fiyat: 25.00,
                    birim: 'Dilim',
                    fiyatTipi: 'normal',
                    gecerliTarih: new Date('2024-01-01'),
                    vergiOrani: 18
                }
            }),
            prisma.fiyat.create({
                data: {
                    urunId: urunler[3].id,
                    fiyat: 28.00,
                    birim: 'Dilim',
                    fiyatTipi: 'normal',
                    gecerliTarih: new Date('2024-01-01'),
                    vergiOrani: 18
                }
            }),
            prisma.fiyat.create({
                data: {
                    urunId: urunler[3].id,
                    fiyat: 25.00,
                    birim: 'Dilim',
                    fiyatTipi: 'kampanya',
                    iskonto: 10,
                    gecerliTarih: new Date('2024-12-01'),
                    bitisTarihi: new Date('2024-12-31'),
                    vergiOrani: 18
                }
            }),

            // Börek fiyatları
            prisma.fiyat.create({
                data: {
                    urunId: urunler[4].id,
                    fiyat: 15.00,
                    birim: 'Porsiyon',
                    fiyatTipi: 'normal',
                    gecerliTarih: new Date('2024-01-01'),
                    vergiOrani: 18
                }
            }),

            // Tatlı fiyatları
            prisma.fiyat.create({
                data: {
                    urunId: urunler[5].id,
                    fiyat: 20.00,
                    birim: 'Adet',
                    fiyatTipi: 'normal',
                    gecerliTarih: new Date('2024-01-01'),
                    vergiOrani: 18
                }
            }),

            // Ekmek fiyatları
            prisma.fiyat.create({
                data: {
                    urunId: urunler[6].id,
                    fiyat: 7.50,
                    birim: 'Adet',
                    fiyatTipi: 'normal',
                    gecerliTarih: new Date('2024-01-01'),
                    vergiOrani: 18
                }
            })
        ]);

        console.log(`✅ ${fiyatlar.length} fiyat oluşturuldu\n`);

        // 4. Özet bilgi
        console.log('📊 ÖZET:');
        console.log(`   📂 Kategoriler: ${kategoriler.length}`);
        console.log(`   🛍️ Ürünler: ${urunler.length}`);
        console.log(`   💰 Fiyatlar: ${fiyatlar.length}\n`);

        console.log('🎉 Ürün yönetimi test verisi başarıyla eklendi!');

        return {
            kategoriler,
            urunler,
            fiyatlar
        };

    } catch (error) {
        console.error('❌ Test verisi eklenirken hata:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Script'i çalıştır
if (require.main === module) {
    seedProductData()
        .then(() => {
            console.log('\n✅ İşlem tamamlandı!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ İşlem başarısız:', error);
            process.exit(1);
        });
}

module.exports = { seedProductData }; 