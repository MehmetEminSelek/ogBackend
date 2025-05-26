const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedData() {
    try {
        console.log('🌱 Gerçek veriler ekleniyor...');

        // Önce kategorileri ekleyelim
        const categories = [
            {
                ad: 'Börekler',
                aciklama: 'Taze börek çeşitleri',
                renk: '#FFD700',
                ikon: '🥐',
                aktif: true,
                siraNo: 1
            },
            {
                ad: 'Baklavalar',
                aciklama: 'Geleneksel baklava çeşitleri',
                renk: '#FFA500',
                ikon: '🍯',
                aktif: true,
                siraNo: 2
            },
            {
                ad: 'Kurabiyeler',
                aciklama: 'Taze kurabiye çeşitleri',
                renk: '#8B4513',
                ikon: '🍪',
                aktif: true,
                siraNo: 3
            }
        ];

        for (const category of categories) {
            await prisma.urunKategori.upsert({
                where: { ad: category.ad },
                update: {},
                create: category
            });
        }
        console.log('✅ Kategoriler eklendi');

        // Hammadde ve Yarı Mamul ürünler
        const products = [
            {
                ad: 'ANTEP PEYNİRİ',
                kodu: 'HM001',
                stokKodu: 'HM001',
                satisaBirimi: 'KG',
                maliyetFiyati: 320.00,
                aktif: true,
                kategoriId: 1
            },
            {
                ad: 'CEVİZ',
                kodu: 'HM002',
                stokKodu: 'HM002',
                satisaBirimi: 'KG',
                maliyetFiyati: 280.00,
                aktif: true,
                kategoriId: 2
            },
            {
                ad: 'GLİKOZ',
                kodu: 'HM003',
                stokKodu: 'HM003',
                satisaBirimi: 'KG',
                maliyetFiyati: 45.00,
                aktif: true,
                kategoriId: 3
            },
            {
                ad: 'IRMIK NO:0',
                kodu: 'HM004',
                stokKodu: 'HM004',
                satisaBirimi: 'KG',
                maliyetFiyati: 35.00,
                aktif: true,
                kategoriId: 3
            },
            {
                ad: 'IRMIK NO:3',
                kodu: 'HM005',
                stokKodu: 'HM005',
                satisaBirimi: 'KG',
                maliyetFiyati: 35.00,
                aktif: true,
                kategoriId: 3
            },
            {
                ad: 'İÇ FISTIK',
                kodu: 'HM006',
                stokKodu: 'HM006',
                satisaBirimi: 'KG',
                maliyetFiyati: 1200.00,
                aktif: true,
                kategoriId: 2
            },
            {
                ad: 'KADAYIF',
                kodu: 'HM007',
                stokKodu: 'HM007',
                satisaBirimi: 'KG',
                maliyetFiyati: 180.00,
                aktif: true,
                kategoriId: 2
            },
            {
                ad: 'KARAKOYUNLU UN',
                kodu: 'HM008',
                stokKodu: 'HM008',
                satisaBirimi: 'KG',
                maliyetFiyati: 45.00,
                aktif: true,
                kategoriId: 1
            },
            {
                ad: 'MAYDANOZ',
                kodu: 'HM010',
                stokKodu: 'HM010',
                satisaBirimi: 'KG',
                maliyetFiyati: 120.00,
                aktif: true,
                kategoriId: 1
            },
            {
                ad: 'SADE YAĞ',
                kodu: 'HM012',
                stokKodu: 'HM012',
                satisaBirimi: 'KG',
                maliyetFiyati: 320.00,
                aktif: true,
                kategoriId: 1
            },
            {
                ad: 'SODA GR',
                kodu: 'HM013',
                stokKodu: 'HM013',
                satisaBirimi: 'KG',
                maliyetFiyati: 25.00,
                aktif: true,
                kategoriId: 3
            },
            {
                ad: 'SU',
                kodu: 'HM014',
                stokKodu: 'HM014',
                satisaBirimi: 'LT',
                maliyetFiyati: 0.00,
                aktif: true,
                kategoriId: 1
            },
            {
                ad: 'TOZ ŞEKER',
                kodu: 'HM017',
                stokKodu: 'HM017',
                satisaBirimi: 'KG',
                maliyetFiyati: 35.00,
                aktif: true,
                kategoriId: 3
            },
            {
                ad: 'YOĞURT',
                kodu: 'HM019',
                stokKodu: 'HM019',
                satisaBirimi: 'KG',
                maliyetFiyati: 45.00,
                aktif: true,
                kategoriId: 3
            }
        ];

        // Ürünleri ekle
        for (const product of products) {
            const createdProduct = await prisma.urun.upsert({
                where: { kodu: product.kodu },
                update: {},
                create: product
            });

            // Fiyat ekle (duplicate varsa atla)
            try {
                await prisma.fiyat.create({
                    data: {
                        urunId: createdProduct.id,
                        fiyat: product.maliyetFiyati,
                        birim: product.satisaBirimi,
                        fiyatTipi: 'normal',
                        gecerliTarih: new Date(),
                        aktif: true
                    }
                });
            } catch (err) {
                if (err.code === 'P2002') {
                    console.log(`Fiyat zaten var: ${createdProduct.ad}`);
                } else {
                    throw err;
                }
            }
        }
        console.log('✅ Ürünler ve fiyatları eklendi');

        // Tarifler
        const recipes = [
            {
                name: 'Antep Peynirli Su Böreği',
                ingredients: [
                    { stokKod: 'HM012', miktarGram: 62.81 },
                    { stokKod: 'HM001', miktarGram: 56.78 },
                    { stokKod: 'HM010', miktarGram: 6.03 }
                ]
            },
            {
                name: 'Fıstık Ezmesi',
                ingredients: [
                    { stokKod: 'HM006', miktarGram: 381.68 },
                    { stokKod: 'HM017', miktarGram: 477.1 },
                    { stokKod: 'HM014', miktarGram: 238.55 },
                    { stokKod: 'HM003', miktarGram: 95.42 }
                ]
            },
            {
                name: 'Fıstıklı Kurabiye',
                ingredients: [
                    { stokKod: 'HM004', miktarGram: 203.05 },
                    { stokKod: 'HM017', miktarGram: 194.59 },
                    { stokKod: 'HM012', miktarGram: 169.2 },
                    { stokKod: 'HM006', miktarGram: 274.96 },
                    { stokKod: 'HM019', miktarGram: 17.85 },
                    { stokKod: 'HM013', miktarGram: 1.1 },
                    { stokKod: 'HM008', miktarGram: 135.36 }
                ]
            }
        ];

        for (const recipe of recipes) {
            const createdRecipe = await prisma.recipe.create({
                data: {
                    name: recipe.name
                }
            });
            for (const ingredient of recipe.ingredients) {
                // Ürün tablosunda var mı kontrol et
                const urun = await prisma.urun.findFirst({ where: { kodu: ingredient.stokKod } });
                if (!urun) {
                    console.warn(`Uyarı: ${ingredient.stokKod} stok kodlu ürün bulunamadı, reçeteye eklenemedi.`);
                    continue;
                }
                await prisma.recipeIngredient.create({
                    data: {
                        recipeId: createdRecipe.id,
                        stokKod: ingredient.stokKod,
                        miktarGram: ingredient.miktarGram
                    }
                });
            }
        }
        console.log('✅ Tarifler eklendi');

        console.log('🎉 Tüm gerçek veriler başarıyla eklendi!');

    } catch (error) {
        console.error('❌ Veri eklenirken hata oluştu:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedData(); 