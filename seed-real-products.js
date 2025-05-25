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
        console.log('⏳ Lütfen ürünlerinizi aşağıya ekleyin...\n');

        // BURAYA ÜRÜNLER EKLENECEKTİR
        // Örnek format:
        /*
        const urunler = [
            {
                ad: 'Fıstıklı Baklava',
                kategoriId: oluşturulanKategoriler['Baklava Çeşitleri'].id,
                aciklama: 'Antep fıstığı ile hazırlanan geleneksel baklava',
                satisaBirimi: 'KG',
                aktif: true,
                fiyat: 120.00,
                birim: 'KG'
            },
            // ... diğer ürünler
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
        */

        console.log('\n🎉 Kategoriler hazır! Ürünleri eklemek için script\'i düzenleyin.');
        console.log('\n📋 Oluşturulan kategoriler:');
        Object.values(oluşturulanKategoriler).forEach(kat => {
            console.log(`   • ${kat.ad} (ID: ${kat.id})`);
        });

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