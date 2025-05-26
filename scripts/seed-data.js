const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedData() {
    try {
        console.log('🌱 Gerçek veriler ekleniyor...');

        // Hammadde ve Yarı Mamul ürünler
        const products = [
            {
                name: 'ANTEP PEYNİRİ',
                unit: 'KG',
                price: 320.00,
                stock: 100,
                isActive: true,
                type: 'Hammadde',
                code: 'HM001'
            },
            {
                name: 'CEVİZ',
                unit: 'KG',
                price: 280.00,
                stock: 50,
                isActive: true,
                type: 'Hammadde',
                code: 'HM002'
            },
            {
                name: 'GLİKOZ',
                unit: 'KG',
                price: 45.00,
                stock: 200,
                isActive: true,
                type: 'Hammadde',
                code: 'HM003'
            },
            {
                name: 'IRMIK NO:0',
                unit: 'KG',
                price: 35.00,
                stock: 300,
                isActive: true,
                type: 'Hammadde',
                code: 'HM004'
            },
            {
                name: 'IRMIK NO:3',
                unit: 'KG',
                price: 35.00,
                stock: 300,
                isActive: true,
                type: 'Hammadde',
                code: 'HM005'
            },
            {
                name: 'İÇ FISTIK',
                unit: 'KG',
                price: 1200.00,
                stock: 200,
                isActive: true,
                type: 'Hammadde',
                code: 'HM006'
            },
            {
                name: 'KADAYIF',
                unit: 'KG',
                price: 180.00,
                stock: 100,
                isActive: true,
                type: 'Hammadde',
                code: 'HM007'
            },
            {
                name: 'KARAKOYUNLU UN',
                unit: 'KG',
                price: 45.00,
                stock: 500,
                isActive: true,
                type: 'Hammadde',
                code: 'HM008'
            },
            {
                name: 'MAYDANOZ',
                unit: 'KG',
                price: 120.00,
                stock: 20,
                isActive: true,
                type: 'Hammadde',
                code: 'HM010'
            },
            {
                name: 'SADE YAĞ',
                unit: 'KG',
                price: 320.00,
                stock: 200,
                isActive: true,
                type: 'Hammadde',
                code: 'HM012'
            },
            {
                name: 'SODA GR',
                unit: 'KG',
                price: 25.00,
                stock: 50,
                isActive: true,
                type: 'Hammadde',
                code: 'HM013'
            },
            {
                name: 'SU',
                unit: 'LT',
                price: 0.00,
                stock: 1000,
                isActive: true,
                type: 'Hammadde',
                code: 'HM014'
            },
            {
                name: 'TOZ ŞEKER',
                unit: 'KG',
                price: 35.00,
                stock: 300,
                isActive: true,
                type: 'Hammadde',
                code: 'HM017'
            },
            {
                name: 'YOĞURT',
                unit: 'KG',
                price: 45.00,
                stock: 100,
                isActive: true,
                type: 'Hammadde',
                code: 'HM019'
            },
            {
                name: 'HAMUR (YM)',
                unit: 'KG',
                price: 0.00,
                stock: 0,
                isActive: true,
                type: 'Yarı Mamul',
                code: 'YM001'
            },
            {
                name: 'KAYMAK (YM)',
                unit: 'KG',
                price: 0.00,
                stock: 0,
                isActive: true,
                type: 'Yarı Mamul',
                code: 'YM002'
            },
            {
                name: 'ŞERBET (YM)',
                unit: 'KG',
                price: 0.00,
                stock: 0,
                isActive: true,
                type: 'Yarı Mamul',
                code: 'YM003'
            }
        ];

        // Ürünleri ekle
        for (const product of products) {
            await prisma.product.upsert({
                where: { code: product.code },
                update: {},
                create: product
            });
        }
        console.log('✅ Ürünler eklendi');

        // Tarifler
        const recipes = [
            {
                name: 'Antep Peynirli Su Böreği',
                description: 'Antep Peynirli Su Böreği',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'HM012', amount: 0.06281 },
                        { productCode: 'YM001', amount: 0.59296 },
                        { productCode: 'HM001', amount: 0.05678 },
                        { productCode: 'HM010', amount: 0.00603 }
                    ]
                }
            },
            {
                name: 'Fıstık Ezmesi',
                description: 'Fıstık Ezmesi',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'HM006', amount: 0.38168 },
                        { productCode: 'HM017', amount: 0.47710 },
                        { productCode: 'HM014', amount: 0.23855 },
                        { productCode: 'HM003', amount: 0.09542 }
                    ]
                }
            },
            {
                name: 'Fıstıklı Kurabiye',
                description: 'Fıstıklı Kurabiye',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'HM004', amount: 0.20305 },
                        { productCode: 'HM017', amount: 0.19459 },
                        { productCode: 'HM012', amount: 0.16920 },
                        { productCode: 'HM006', amount: 0.27496 },
                        { productCode: 'HM019', amount: 0.01785 },
                        { productCode: 'HM013', amount: 0.00110 },
                        { productCode: 'HM008', amount: 0.13536 }
                    ]
                }
            },
            {
                name: 'Sade Kurabiye',
                description: 'Sade Kurabiye',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'HM008', amount: 0.19300 },
                        { productCode: 'HM005', amount: 0.19300 },
                        { productCode: 'HM017', amount: 0.19300 },
                        { productCode: 'HM012', amount: 0.19300 },
                        { productCode: 'HM019', amount: 0.09677 },
                        { productCode: 'HM013', amount: 0.00968 }
                    ]
                }
            },
            {
                name: 'Burma Kadayıf',
                description: 'Burma Kadayıf',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'HM012', amount: 0.32770 },
                        { productCode: 'HM006', amount: 0.33929 },
                        { productCode: 'YM003', amount: 0.33299 },
                        { productCode: 'HM007', amount: 0.27263 }
                    ]
                }
            },
            {
                name: 'Bülbül Yuvası',
                description: 'Bülbül Yuvası',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'YM001', amount: 0.24843 },
                        { productCode: 'HM012', amount: 0.17442 },
                        { productCode: 'HM006', amount: 0.25483 },
                        { productCode: 'YM003', amount: 0.32258 }
                    ]
                }
            },
            {
                name: 'Cevizli Yaş Baklava',
                description: 'Cevizli Yaş Baklava',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'YM001', amount: 0.29443 },
                        { productCode: 'YM002', amount: 0.12953 },
                        { productCode: 'HM012', amount: 0.12953 },
                        { productCode: 'HM002', amount: 0.12953 },
                        { productCode: 'YM003', amount: 0.33856 }
                    ]
                }
            },
            {
                name: 'Dolama',
                description: 'Dolama',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'YM001', amount: 0.14876 },
                        { productCode: 'HM012', amount: 0.29227 },
                        { productCode: 'HM006', amount: 0.44848 },
                        { productCode: 'YM003', amount: 0.24390 }
                    ]
                }
            },
            {
                name: 'Havuç Dilimi',
                description: 'Havuç Dilimi',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'YM001', amount: 0.11779 },
                        { productCode: 'YM002', amount: 0.12548 },
                        { productCode: 'HM012', amount: 0.20288 },
                        { productCode: 'HM006', amount: 0.20288 },
                        { productCode: 'YM003', amount: 0.24038 }
                    ]
                }
            },
            {
                name: 'Midye',
                description: 'Midye',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'YM001', amount: 0.14876 },
                        { productCode: 'HM012', amount: 0.24631 },
                        { productCode: 'HM006', amount: 0.24631 },
                        { productCode: 'YM003', amount: 0.24631 },
                        { productCode: 'YM002', amount: 0.10985 }
                    ]
                }
            },
            {
                name: 'Kuru Baklava',
                description: 'Kuru Baklava',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'YM001', amount: 0.33516 },
                        { productCode: 'HM012', amount: 0.38540 },
                        { productCode: 'HM006', amount: 0.38540 },
                        { productCode: 'YM003', amount: 0.38540 }
                    ]
                }
            },
            {
                name: 'Yaş Baklava',
                description: 'Yaş Baklava',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'YM001', amount: 0.29443 },
                        { productCode: 'HM012', amount: 0.33856 },
                        { productCode: 'HM006', amount: 0.33856 },
                        { productCode: 'YM003', amount: 0.33856 }
                    ]
                }
            },
            {
                name: 'Özel Kare',
                description: 'Özel Kare',
                isActive: true,
                ingredients: {
                    create: [
                        { productCode: 'YM001', amount: 0.24019 },
                        { productCode: 'YM002', amount: 0.18762 },
                        { productCode: 'HM012', amount: 0.18762 },
                        { productCode: 'HM006', amount: 0.24019 },
                        { productCode: 'YM003', amount: 0.24389 }
                    ]
                }
            }
        ];

        // Tarifleri ekle
        for (const recipe of recipes) {
            await prisma.recipe.upsert({
                where: { name: recipe.name },
                update: {},
                create: recipe
            });
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