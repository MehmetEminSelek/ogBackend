const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRecipes() {
    console.log('Mevcut reçeteler siliniyor...');

    // Önce tüm reçeteleri sil
    await prisma.recipeIngredient.deleteMany();
    await prisma.recipe.deleteMany();

    console.log('Yeni reçeteler ekleniyor...');

    // Reçete verileri
    const receteler = [
        // PEYNIRLI SU BOREGI (UR)
        { urunAd: 'Peynirli Su Boregi (UR)', stokKod: 'HM012', miktarGram: 62.81 },
        { urunAd: 'Peynirli Su Boregi (UR)', stokKod: 'YM001', miktarGram: 592.96 },
        { urunAd: 'Peynirli Su Boregi (UR)', stokKod: 'HM001', miktarGram: 56.78 },
        { urunAd: 'Peynirli Su Boregi (UR)', stokKod: 'HM010', miktarGram: 6.03 },
        // EZME (UR)
        { urunAd: 'Ezme (UR)', stokKod: 'HM006', miktarGram: 381.68 },
        { urunAd: 'Ezme (UR)', stokKod: 'HM017', miktarGram: 477.1 },
        { urunAd: 'Ezme (UR)', stokKod: 'HM014', miktarGram: 238.55 },
        { urunAd: 'Ezme (UR)', stokKod: 'HM003', miktarGram: 95.42 },
        // FISTIKLI KURABIYE
        { urunAd: 'Fıstıklı Kurabiye', stokKod: 'HM004', miktarGram: 203.05 },
        { urunAd: 'Fıstıklı Kurabiye', stokKod: 'HM017', miktarGram: 194.59 },
        { urunAd: 'Fıstıklı Kurabiye', stokKod: 'HM012', miktarGram: 169.2 },
        { urunAd: 'Fıstıklı Kurabiye', stokKod: 'HM006', miktarGram: 274.96 },
        { urunAd: 'Fıstıklı Kurabiye', stokKod: 'HM019', miktarGram: 17.85 },
        { urunAd: 'Fıstıklı Kurabiye', stokKod: 'HM013', miktarGram: 1.1 },
        { urunAd: 'Fıstıklı Kurabiye', stokKod: 'HM008', miktarGram: 135.36 },
        // SADE KURABIYE
        { urunAd: 'Sade Kurabiye', stokKod: 'HM008', miktarGram: 193 },
        { urunAd: 'Sade Kurabiye', stokKod: 'HM005', miktarGram: 193 },
        { urunAd: 'Sade Kurabiye', stokKod: 'HM017', miktarGram: 193 },
        { urunAd: 'Sade Kurabiye', stokKod: 'HM012', miktarGram: 193 },
        { urunAd: 'Sade Kurabiye', stokKod: 'HM019', miktarGram: 96.77 },
        { urunAd: 'Sade Kurabiye', stokKod: 'HM013', miktarGram: 9.68 },
        // DOLAMA (UR)
        { urunAd: 'Dolama (UR)', stokKod: 'YM001', miktarGram: 148.76 },
        { urunAd: 'Dolama (UR)', stokKod: 'HM012', miktarGram: 292.27 },
        { urunAd: 'Dolama (UR)', stokKod: 'HM006', miktarGram: 448.48 },
        { urunAd: 'Dolama (UR)', stokKod: 'YM003', miktarGram: 243.9 },
        // BURMA KADAYIF (UR)
        { urunAd: 'Burma Kadayıf (UR)', stokKod: 'HM012', miktarGram: 327.7 },
        { urunAd: 'Burma Kadayıf (UR)', stokKod: 'HM006', miktarGram: 339.29 },
        { urunAd: 'Burma Kadayıf (UR)', stokKod: 'YM003', miktarGram: 332.99 },
        { urunAd: 'Burma Kadayıf (UR)', stokKod: 'HM007', miktarGram: 272.63 },
        // MİDYE (UR)
        { urunAd: 'Midye (UR)', stokKod: 'YM001', miktarGram: 148.76 },
        { urunAd: 'Midye (UR)', stokKod: 'HM012', miktarGram: 246.31 },
        { urunAd: 'Midye (UR)', stokKod: 'HM006', miktarGram: 246.31 },
        { urunAd: 'Midye (UR)', stokKod: 'YM003', miktarGram: 246.31 },
        { urunAd: 'Midye (UR)', stokKod: 'YM002', miktarGram: 109.85 },
        // HAVUÇ DİLİMİ (UR)
        { urunAd: 'Havuç Dilimi (UR)', stokKod: 'YM001', miktarGram: 117.79 },
        { urunAd: 'Havuç Dilimi (UR)', stokKod: 'YM002', miktarGram: 125.48 },
        { urunAd: 'Havuç Dilimi (UR)', stokKod: 'HM012', miktarGram: 202.88 },
        { urunAd: 'Havuç Dilimi (UR)', stokKod: 'HM006', miktarGram: 202.88 },
        { urunAd: 'Havuç Dilimi (UR)', stokKod: 'YM003', miktarGram: 240.38 },
        // BÜLBÜL YUVASI (UR)
        { urunAd: 'Bülbül Yuvası (UR)', stokKod: 'YM001', miktarGram: 248.43 },
        { urunAd: 'Bülbül Yuvası (UR)', stokKod: 'HM012', miktarGram: 174.42 },
        { urunAd: 'Bülbül Yuvası (UR)', stokKod: 'HM006', miktarGram: 254.83 },
        { urunAd: 'Bülbül Yuvası (UR)', stokKod: 'YM003', miktarGram: 322.58 },
        // ÖZEL KARE BAKLAVA (UR)
        { urunAd: 'Özel Kare Baklava (UR)', stokKod: 'YM001', miktarGram: 240.19 },
        { urunAd: 'Özel Kare Baklava (UR)', stokKod: 'YM002', miktarGram: 187.62 },
        { urunAd: 'Özel Kare Baklava (UR)', stokKod: 'HM012', miktarGram: 187.62 },
        { urunAd: 'Özel Kare Baklava (UR)', stokKod: 'HM006', miktarGram: 240.19 },
        { urunAd: 'Özel Kare Baklava (UR)', stokKod: 'YM003', miktarGram: 243.89 },
        // FISTIKLI KURU BAKLAVA (UR)
        { urunAd: 'Fıstıklı Kuru Baklava (UR)', stokKod: 'YM001', miktarGram: 335.16 },
        { urunAd: 'Fıstıklı Kuru Baklava (UR)', stokKod: 'HM012', miktarGram: 385.4 },
        { urunAd: 'Fıstıklı Kuru Baklava (UR)', stokKod: 'HM006', miktarGram: 385.4 },
        { urunAd: 'Fıstıklı Kuru Baklava (UR)', stokKod: 'YM003', miktarGram: 385.4 },
        // FISTIKLI YAŞ BAKLAVA (UR)
        { urunAd: 'Fıstıklı Yaş Baklava (UR)', stokKod: 'YM001', miktarGram: 294.43 },
        { urunAd: 'Fıstıklı Yaş Baklava (UR)', stokKod: 'HM012', miktarGram: 338.56 },
        { urunAd: 'Fıstıklı Yaş Baklava (UR)', stokKod: 'HM006', miktarGram: 338.56 },
        { urunAd: 'Fıstıklı Yaş Baklava (UR)', stokKod: 'YM003', miktarGram: 338.56 },
        // CEVİZLİ BAKLAVA (UR)
        { urunAd: 'Cevizli Baklava (UR)', stokKod: 'YM001', miktarGram: 294.43 },
        { urunAd: 'Cevizli Baklava (UR)', stokKod: 'YM002', miktarGram: 129.53 },
        { urunAd: 'Cevizli Baklava (UR)', stokKod: 'HM012', miktarGram: 129.53 },
        { urunAd: 'Cevizli Baklava (UR)', stokKod: 'HM002', miktarGram: 129.53 },
        { urunAd: 'Cevizli Baklava (UR)', stokKod: 'YM003', miktarGram: 338.56 },
    ];

    // Ürün adlarına göre grupla
    const grouped = {};
    for (const rec of receteler) {
        if (!grouped[rec.urunAd]) grouped[rec.urunAd] = [];
        grouped[rec.urunAd].push({ stokKod: rec.stokKod, miktarGram: rec.miktarGram });
    }

    // Normalize fonksiyonu
    function normalize(str) {
        return str
            .toLocaleUpperCase('tr-TR')
            .replace(/\s+/g, '')
            .replace(/[()\-.,'']/g, '')
            .replace(/İ/g, 'I')
            .replace(/Ü/g, 'U')
            .replace(/Ö/g, 'O')
            .replace(/Ç/g, 'C')
            .replace(/Ş/g, 'S')
            .replace(/Ğ/g, 'G');
    }

    // Ürünleri al ve map oluştur
    const urunler = await prisma.urun.findMany();
    const urunAdMap = {};
    for (const urun of urunler) {
        urunAdMap[normalize(urun.ad)] = urun.id;
    }

    // Manuel eşleştirme tablosu
    const manuelEslestirme = {
        'Peynirli Su Boregi (UR)': 'Antep Peynirli Su Böreği',
        'Ezme (UR)': 'Fıstık Ezmesi',
        'Dolama (UR)': 'Dolama',
        'Burma Kadayıf (UR)': 'Burma Kadayıf',
        'Midye (UR)': 'Midye',
        'Havuç Dilimi (UR)': 'Havuç Dilimi',
        'Bülbül Yuvası (UR)': 'Bülbül Yuvası',
        'Özel Kare Baklava (UR)': 'Özel Kare',
        'Fıstıklı Kuru Baklava (UR)': 'Kuru Baklava',
        'Fıstıklı Yaş Baklava (UR)': 'Yaş Baklava',
        'Cevizli Baklava (UR)': 'Cevizli Yaş Baklava'
    };

    // Reçeteleri ekle
    for (const urunAd in grouped) {
        let urunId = null;

        // Önce manuel eşleştirmeyi kontrol et
        const manuelEslestirilenAd = manuelEslestirme[urunAd];
        if (manuelEslestirilenAd) {
            const normManuelAd = normalize(manuelEslestirilenAd);
            urunId = urunAdMap[normManuelAd];
        }

        // Manuel eşleştirme yoksa normal eşleştirmeyi dene
        if (!urunId) {
            const normAd = normalize(urunAd);
            urunId = urunAdMap[normAd];
        }

        if (!urunId) {
            console.warn('Eşleşmeyen reçete:', urunAd);
        }

        const recipe = await prisma.recipe.create({
            data: {
                name: urunAd,
                urunId: urunId,
                ingredients: {
                    create: grouped[urunAd].map(ing => ({ stokKod: ing.stokKod, miktarGram: ing.miktarGram }))
                }
            }
        });
        console.log('Reçete eklendi:', urunAd, '-> urunId:', urunId);
    }

    console.log('Reçeteler başarıyla düzeltildi!');
    await prisma.$disconnect();
}

fixRecipes().catch(console.error); 