// seed-real-products.js
// Gerçek baklavacı ürünleri için seed script'i

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedRealProducts() {
    try {
        console.log('🍯 Baklavacı ürünleri ekleniyor...\n');

        // Önce mevcut test verilerini temizle (isteğe bağlı)
        console.log('🧹 Mevcut test verileri temizleniyor...');

        // Test kategorilerini ve ürünlerini sil
        await prisma.fiyat.deleteMany({});
        await prisma.urun.deleteMany({});
        await prisma.urunKategori.deleteMany({});

        console.log('✅ Test verileri temizlendi.\n');

        // 1. Baklavacı kategorilerini oluştur
        console.log('📂 Kategoriler oluşturuluyor...');

        const kategoriler = [
            {
                ad: 'Baklava Çeşitleri',
                aciklama: 'Geleneksel ve özel baklava çeşitleri',
                renk: '#FFD700',
                ikon: 'mdi-layers-triple',
                siraNo: 1
            },
            {
                ad: 'Şerbetli Tatlılar',
                aciklama: 'Şerbetli geleneksel tatlılar',
                renk: '#FF6B35',
                ikon: 'mdi-cup',
                siraNo: 2
            },
            {
                ad: 'Sütlü Tatlılar',
                aciklama: 'Muhallebi, sütlaç ve benzeri',
                renk: '#4ECDC4',
                ikon: 'mdi-glass-mug-variant',
                siraNo: 3
            },
            {
                ad: 'Börek Çeşitleri',
                aciklama: 'Su böreği, sigara böreği vs.',
                renk: '#45B7D1',
                ikon: 'mdi-food-croissant',
                siraNo: 4
            },
            {
                ad: 'Kurabiye & Çörek',
                aciklama: 'Kurabiye ve çörek çeşitleri',
                renk: '#96CEB4',
                ikon: 'mdi-cookie',
                siraNo: 5
            },
            {
                ad: 'Özel Ürünler',
                aciklama: 'Sezonluk ve özel günler için',
                renk: '#FFEAA7',
                ikon: 'mdi-star',
                siraNo: 6
            }
        ];

        const oluşturulanKategoriler = {};
        for (const kategori of kategoriler) {
            const yeniKategori = await prisma.urunKategori.create({
                data: kategori
            });
            oluşturulanKategoriler[kategori.ad] = yeniKategori;
            console.log(`   ✅ ${kategori.ad} kategorisi oluşturuldu`);
        }

        console.log('\n📦 Ürünler ekleniyor...');

        const urunler = [
            // Baklava Çeşitleri
            {
                ad: 'Fıstıklı Baklava',
                kategoriId: oluşturulanKategoriler['Baklava Çeşitleri'].id,
                aciklama: 'Antep fıstığı ile hazırlanan geleneksel baklava',
                satisaBirimi: 'KG',
                aktif: true,
                fiyat: 1200.00,
                birim: 'KG',
                stok: 50,
                minStokMiktari: 10,
                maxStokMiktari: 100,
                kritikStokSeviye: 15
            },
            {
                ad: 'Cevizli Baklava',
                kategoriId: oluşturulanKategoriler['Baklava Çeşitleri'].id,
                aciklama: 'İç ceviz ile hazırlanan baklava',
                satisaBirimi: 'KG',
                aktif: true,
                fiyat: 900.00,
                birim: 'KG',
                stok: 40,
                minStokMiktari: 10,
                maxStokMiktari: 80,
                kritikStokSeviye: 15
            },
            {
                ad: 'Havuç Dilimi',
                kategoriId: oluşturulanKategoriler['Baklava Çeşitleri'].id,
                aciklama: 'Özel havuç dilimi baklava',
                satisaBirimi: 'KG',
                aktif: true,
                fiyat: 1100.00,
                birim: 'KG',
                stok: 30,
                minStokMiktari: 5,
                maxStokMiktari: 60,
                kritikStokSeviye: 10
            },

            // Şerbetli Tatlılar
            {
                ad: 'Künefe',
                kategoriId: oluşturulanKategoriler['Şerbetli Tatlılar'].id,
                aciklama: 'Antep fıstıklı künefe',
                satisaBirimi: 'ADET',
                aktif: true,
                fiyat: 150.00,
                birim: 'ADET',
                stok: 20,
                minStokMiktari: 5,
                maxStokMiktari: 40,
                kritikStokSeviye: 8
            },
            {
                ad: 'Şöbiyet',
                kategoriId: oluşturulanKategoriler['Şerbetli Tatlılar'].id,
                aciklama: 'Fıstıklı şöbiyet',
                satisaBirimi: 'KG',
                aktif: true,
                fiyat: 950.00,
                birim: 'KG',
                stok: 25,
                minStokMiktari: 5,
                maxStokMiktari: 50,
                kritikStokSeviye: 10
            },

            // Sütlü Tatlılar
            {
                ad: 'Sütlaç',
                kategoriId: oluşturulanKategoriler['Sütlü Tatlılar'].id,
                aciklama: 'Fırında sütlaç',
                satisaBirimi: 'ADET',
                aktif: true,
                fiyat: 45.00,
                birim: 'ADET',
                stok: 30,
                minStokMiktari: 10,
                maxStokMiktari: 60,
                kritikStokSeviye: 15
            },
            {
                ad: 'Kazandibi',
                kategoriId: oluşturulanKategoriler['Sütlü Tatlılar'].id,
                aciklama: 'Geleneksel kazandibi',
                satisaBirimi: 'ADET',
                aktif: true,
                fiyat: 45.00,
                birim: 'ADET',
                stok: 25,
                minStokMiktari: 10,
                maxStokMiktari: 50,
                kritikStokSeviye: 15
            },

            // Börek Çeşitleri
            {
                ad: 'Su Böreği',
                kategoriId: oluşturulanKategoriler['Börek Çeşitleri'].id,
                aciklama: 'El açması su böreği',
                satisaBirimi: 'KG',
                aktif: true,
                fiyat: 350.00,
                birim: 'KG',
                stok: 15,
                minStokMiktari: 5,
                maxStokMiktari: 30,
                kritikStokSeviye: 8
            },
            {
                ad: 'Sigara Böreği',
                kategoriId: oluşturulanKategoriler['Börek Çeşitleri'].id,
                aciklama: 'Peynirli sigara böreği',
                satisaBirimi: 'ADET',
                aktif: true,
                fiyat: 15.00,
                birim: 'ADET',
                stok: 100,
                minStokMiktari: 20,
                maxStokMiktari: 200,
                kritikStokSeviye: 30
            },

            // Kurabiye & Çörek
            {
                ad: 'Acıbadem Kurabiyesi',
                kategoriId: oluşturulanKategoriler['Kurabiye & Çörek'].id,
                aciklama: 'Geleneksel acıbadem kurabiyesi',
                satisaBirimi: 'KG',
                aktif: true,
                fiyat: 450.00,
                birim: 'KG',
                stok: 20,
                minStokMiktari: 5,
                maxStokMiktari: 40,
                kritikStokSeviye: 8
            },
            {
                ad: 'Poğaça',
                kategoriId: oluşturulanKategoriler['Kurabiye & Çörek'].id,
                aciklama: 'Peynirli poğaça',
                satisaBirimi: 'ADET',
                aktif: true,
                fiyat: 12.00,
                birim: 'ADET',
                stok: 50,
                minStokMiktari: 10,
                maxStokMiktari: 100,
                kritikStokSeviye: 15
            },

            // Özel Ürünler
            {
                ad: 'Özel Gün Baklavası',
                kategoriId: oluşturulanKategoriler['Özel Ürünler'].id,
                aciklama: 'Özel günler için hazırlanan baklava',
                satisaBirimi: 'KG',
                aktif: true,
                fiyat: 1500.00,
                birim: 'KG',
                stok: 10,
                minStokMiktari: 2,
                maxStokMiktari: 20,
                kritikStokSeviye: 5,
                ozelUrun: true
            }
        ];

        for (const urunData of urunler) {
            const { fiyat, birim, ...urunBilgileri } = urunData;

            const yeniUrun = await prisma.urun.create({
                data: urunBilgileri
            });

            if (fiyat && birim) {
                await prisma.fiyat.create({
                    data: {
                        urunId: yeniUrun.id,
                        fiyat: fiyat,
                        birim: birim,
                        gecerliTarih: new Date(),
                        aktif: true
                    }
                });
            }

            console.log(`   ✅ ${urunData.ad} eklendi`);
        }

        console.log('\n🎉 Tüm ürünler başarıyla eklendi!');

    } catch (error) {
        console.error('❌ Hata oluştu:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Script'i çalıştır
if (require.main === module) {
    seedRealProducts();
}

module.exports = { seedRealProducts }; 