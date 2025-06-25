const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 REÇETELER VE ÖDEME YÖNTEMLERİ YÜKLENİYOR...\n');

    // 1️⃣ ÖDEME YÖNTEMLERİ - Önce SystemSetting olarak ekleyelim
    console.log('💳 Ödeme yöntemleri ekleniyor...');
    const odemeYontemleri = [
        { kod: 'OY001', ad: 'Nakit' },
        { kod: 'OY002', ad: 'Kredi Kartı' },
        { kod: 'OY003', ad: 'Cari' },
        { kod: 'OY004', ad: 'Çek' },
        { kod: 'OY005', ad: 'Banka Havalesi' },
        { kod: 'OY006', ad: 'İkram' }
    ];

    await prisma.systemSetting.create({
        data: {
            key: 'ODEME_YONTEMLERI',
            value: JSON.stringify(odemeYontemleri),
            dataType: 'JSON',
            description: 'Sistem ödeme yöntemleri listesi'
        }
    });
    console.log(`✅ ${odemeYontemleri.length} ödeme yöntemi eklendi`);

    // 2️⃣ REÇETELER
    console.log('📝 Reçeteler ekleniyor...');

    // Önce malzeme ve ürün ID'lerini alalım
    const malzemeler = await prisma.material.findMany();
    const urunler = await prisma.urun.findMany();

    // Malzeme adlarını ID'lere çeviren yardımcı fonksiyon
    const getMalzemeId = (ad) => {
        const normalizedAd = ad.toLowerCase().trim();
        const malzeme = malzemeler.find(m => {
            const malzemeAd = m.ad.toLowerCase();
            return malzemeAd.includes(normalizedAd) || normalizedAd.includes(malzemeAd);
        });
        return malzeme ? malzeme.id : null;
    };

    // Ürün kodundan ID'yi bulan yardımcı fonksiyon
    const getUrunId = (kod) => {
        const urun = urunler.find(u => u.kod === kod);
        return urun ? urun.id : null;
    };

    // Reçete verileri
    const receteler = [
        {
            ad: 'Peynirli Su Böreği',
            kod: 'RC001',
            urunKod: 'UR001',
            aciklama: 'Antep peynirli su böreği reçetesi',
            malzemeler: [
                { ad: 'sadeyağ', miktar: 0.06281, birim: 'KG' },
                { ad: 'hamur', miktar: 0.59296, birim: 'KG' },
                { ad: 'antep peyniri', miktar: 0.05678, birim: 'KG' },
                { ad: 'maydanoz', miktar: 0.00603, birim: 'KG' }
            ]
        },
        {
            ad: 'Fıstık Ezmesi',
            kod: 'RC002',
            urunKod: 'UR011',
            aciklama: 'Antep fıstığından ezme reçetesi',
            malzemeler: [
                { ad: 'iç fıstık', miktar: 0.38168, birim: 'KG' },
                { ad: 'toz şeker', miktar: 0.4771, birim: 'KG' },
                { ad: 'su', miktar: 0.23855, birim: 'LITRE' },
                { ad: 'glikoz', miktar: 0.09542, birim: 'KG' }
            ]
        },
        {
            ad: 'Fıstıklı Kurabiye',
            kod: 'RC003',
            urunKod: 'UR018',
            aciklama: 'Antep fıstıklı kurabiye reçetesi',
            malzemeler: [
                { ad: 'irmik no:0', miktar: 0.20305, birim: 'KG' },
                { ad: 'toz şeker', miktar: 0.19459, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.1692, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.27496, birim: 'KG' },
                { ad: 'yoğurt', miktar: 0.01785, birim: 'KG' },
                { ad: 'soda', miktar: 0.0011, birim: 'KG' },
                { ad: 'karakoyunlu un', miktar: 0.13536, birim: 'KG' }
            ]
        },
        {
            ad: 'Sade Kurabiye',
            kod: 'RC004',
            urunKod: 'UR032',
            aciklama: 'Sade kurabiye reçetesi',
            malzemeler: [
                { ad: 'karakoyunlu un', miktar: 0.193, birim: 'KG' },
                { ad: 'irmik no:0', miktar: 0.28951, birim: 'KG' },
                { ad: 'toz şeker', miktar: 0.27744, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.21713, birim: 'KG' },
                { ad: 'yoğurt', miktar: 0.02521, birim: 'KG' },
                { ad: 'soda', miktar: 0.00169, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.01809, birim: 'KG' }
            ]
        },
        {
            ad: 'Dolama',
            kod: 'RC005',
            urunKod: 'UR015',
            aciklama: 'Geleneksel dolama baklava reçetesi',
            malzemeler: [
                { ad: 'hamur', miktar: 0.14878, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.26927, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.44488, birim: 'KG' },
                { ad: 'şerbet', miktar: 0.2439, birim: 'KG' }
            ]
        },
        {
            ad: 'Burma Kadayıf',
            kod: 'RC006',
            urunKod: 'UR012',
            aciklama: 'Burma kadayıf reçetesi',
            malzemeler: [
                { ad: 'sadeyağ', miktar: 0.32778, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.33507, birim: 'KG' },
                { ad: 'şerbet', miktar: 0.33299, birim: 'KG' },
                { ad: 'kadayıf', miktar: 0.27263, birim: 'KG' }
            ]
        },
        {
            ad: 'Midye',
            kod: 'RC007',
            urunKod: 'UR020',
            aciklama: 'Midye baklava reçetesi',
            malzemeler: [
                { ad: 'hamur', miktar: 0.16256, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.17241, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.35961, birim: 'KG' },
                { ad: 'şerbet', miktar: 0.24631, birim: 'KG' },
                { ad: 'kaymak', miktar: 0.10985, birim: 'KG' }
            ]
        },
        {
            ad: 'Havuç Dilimi',
            kod: 'RC008',
            urunKod: 'UR017',
            aciklama: 'Havuç dilimi baklava reçetesi',
            malzemeler: [
                { ad: 'hamur', miktar: 0.25321, birim: 'KG' },
                { ad: 'kaymak', miktar: 0.14862, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.48028, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.16514, birim: 'KG' },
                { ad: 'şerbet', miktar: 0.25229, birim: 'KG' }
            ]
        },
        {
            ad: 'Şöbiyet',
            kod: 'RC009',
            urunKod: 'UR023',
            aciklama: 'Geleneksel şöbiyet reçetesi',
            malzemeler: [
                { ad: 'hamur', miktar: 0.18894, birim: 'KG' },
                { ad: 'kaymak', miktar: 0.12548, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.27933, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.20288, birim: 'KG' },
                { ad: 'şerbet', miktar: 0.24038, birim: 'KG' }
            ]
        },
        {
            ad: 'Bülbül Yuvası',
            kod: 'RC010',
            urunKod: 'UR013',
            aciklama: 'Bülbül yuvası baklava reçetesi',
            malzemeler: [
                { ad: 'hamur', miktar: 0.24839, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.32258, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.17742, birim: 'KG' },
                { ad: 'şerbet', miktar: 0.32258, birim: 'KG' }
            ]
        },
        {
            ad: 'Özel Kare Baklava',
            kod: 'RC011',
            urunKod: 'UR021',
            aciklama: 'Özel kare baklava reçetesi',
            malzemeler: [
                { ad: 'hamur', miktar: 0.24019, birim: 'KG' },
                { ad: 'kaymak', miktar: 0.12798, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.26028, birim: 'KG' },
                { ad: 'iç fıstık', miktar: 0.18362, birim: 'KG' },
                { ad: 'şerbet', miktar: 0.24389, birim: 'KG' }
            ]
        },
        {
            ad: 'Cevizli Baklava',
            kod: 'RC012',
            urunKod: 'UR007',
            aciklama: 'Cevizli yaş baklava reçetesi',
            malzemeler: [
                { ad: 'hamur', miktar: 0.29443, birim: 'KG' },
                { ad: 'kaymak', miktar: 0.12925, birim: 'KG' },
                { ad: 'sadeyağ', miktar: 0.2204, birim: 'KG' },
                { ad: 'ceviz', miktar: 0.09621, birim: 'KG' },
                { ad: 'şerbet', miktar: 0.33856, birim: 'KG' }
            ]
        }
    ];

    // Reçeteleri oluştur
    let receteCount = 0;
    let malzemeCount = 0;

    for (const receteData of receteler) {
        const urunId = getUrunId(receteData.urunKod);

        const recete = await prisma.recipe.create({
            data: {
                ad: receteData.ad,
                kod: receteData.kod,
                urunId: urunId,
                aciklama: receteData.aciklama,
                porsiyon: 1,
                aktif: true,
                versiyon: '1.0'
            }
        });
        receteCount++;

        // Malzemeleri ekle
        for (const malzemeData of receteData.malzemeler) {
            const malzemeId = getMalzemeId(malzemeData.ad);

            if (malzemeId) {
                await prisma.recipeIngredient.create({
                    data: {
                        recipeId: recete.id,
                        materialId: malzemeId,
                        miktar: malzemeData.miktar,
                        birim: malzemeData.birim,
                        zorunlu: true
                    }
                });
                malzemeCount++;
            } else {
                console.log(`⚠️  Malzeme bulunamadı: ${malzemeData.ad}`);
            }
        }
    }

    console.log(`✅ ${receteCount} reçete ve ${malzemeCount} malzeme ilişkisi eklendi`);

    console.log(`\n🎉 TOPLAM EKLENEN VERİLER:`);
    console.log(`   • ${odemeYontemleri.length} ödeme yöntemi`);
    console.log(`   • ${receteCount} reçete`);
    console.log(`   • ${malzemeCount} reçete-malzeme ilişkisi`);
    console.log(`\n✅ REÇETE VE ÖDEME VERİLERİ BAŞARIYLA YÜKLENDİ!`);
}

main()
    .catch((e) => {
        console.error('❌ Seed hatası:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 