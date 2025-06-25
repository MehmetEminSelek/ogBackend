const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 ÜRÜNLER VE AMBALAJ VERİLERİ YÜKLENİYOR...\n');

    // 1️⃣ ÜRÜN KATEGORİLERİ
    console.log('📦 Ürün kategorileri ekleniyor...');
    const kategoriler = await Promise.all([
        prisma.urunKategori.create({
            data: {
                ad: 'Baklava Çeşitleri',
                kod: 'KAT001',
                aciklama: 'Geleneksel baklava çeşitleri',
                renk: '#FF9800',
                ikon: 'mdi-food-variant',
                aktif: true
            }
        }),
        prisma.urunKategori.create({
            data: {
                ad: 'Börek Çeşitleri',
                kod: 'KAT002',
                aciklama: 'Su böreği ve diğer börek çeşitleri',
                renk: '#4CAF50',
                ikon: 'mdi-food',
                aktif: true
            }
        }),
        prisma.urunKategori.create({
            data: {
                ad: 'Kadayıf Çeşitleri',
                kod: 'KAT003',
                aciklama: 'Kadayıf ve kadayıf çeşitleri',
                renk: '#9C27B0',
                ikon: 'mdi-food-croissant',
                aktif: true
            }
        }),
        prisma.urunKategori.create({
            data: {
                ad: 'Kurabiye Çeşitleri',
                kod: 'KAT004',
                aciklama: 'Fıstıklı ve sade kurabiyeler',
                renk: '#FF5722',
                ikon: 'mdi-cookie',
                aktif: true
            }
        }),
        prisma.urunKategori.create({
            data: {
                ad: 'Özel Tepsiler',
                kod: 'KAT005',
                aciklama: 'Bayram, doğum günü ve özel günler için tepsiler',
                renk: '#E91E63',
                ikon: 'mdi-gift',
                aktif: true
            }
        }),
        prisma.urunKategori.create({
            data: {
                ad: 'Diğer Ürünler',
                kod: 'KAT006',
                aciklama: 'Sadeyağ, fıstık ve diğer ürünler',
                renk: '#607D8B',
                ikon: 'mdi-package-variant',
                aktif: true
            }
        })
    ]);
    console.log(`✅ ${kategoriler.length} kategori eklendi`);

    // 2️⃣ ÜRÜNLER VE FİYATLARI
    console.log('🍯 Ürünler ve fiyatları ekleniyor...');

    // Kategorileri ID'lere göre ayıralım
    const baklavaCat = kategoriler[0].id;
    const borekCat = kategoriler[1].id;
    const kadayifCat = kategoriler[2].id;
    const kurabiyeCat = kategoriler[3].id;
    const ozelTepsiCat = kategoriler[4].id;
    const digerCat = kategoriler[5].id;

    const urunler = await Promise.all([
        // Börek Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Antep Peynirli Su Böreği',
                kod: 'UR001',
                kategoriId: borekCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Antep peyniri ile hazırlanan geleneksel su böreği'
            }
        }),

        // Özel Tepsiler
        prisma.urun.create({
            data: {
                ad: 'Bayram Tepsisi',
                kod: 'UR002',
                kategoriId: ozelTepsiCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Bayramlar için özel hazırlanan karışık tepsi'
            }
        }),

        // Baklava Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Cevizli Bülbül Yuvası',
                kod: 'UR003',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Cevizli bülbül yuvası baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Cevizli Eski Usûl Dolama',
                kod: 'UR004',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Geleneksel usulde hazırlanan cevizli dolama'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Cevizli Özel Kare',
                kod: 'UR005',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Cevizli özel kare baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Cevizli Şöbiyet',
                kod: 'UR006',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Cevizli şöbiyet baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Cevizli Yaş Baklava',
                kod: 'UR007',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Cevizli yaş baklava'
            }
        }),

        // Özel Tepsiler
        prisma.urun.create({
            data: {
                ad: 'Doğum Günü Tepsisi',
                kod: 'UR008',
                kategoriId: ozelTepsiCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Doğum günleri için özel hazırlanan tepsi'
            }
        }),

        // Kadayıf Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Düz Kadayıf',
                kod: 'UR009',
                kategoriId: kadayifCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Geleneksel düz kadayıf'
            }
        }),

        // Baklava Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Fındıklı Çikolatalı Midye',
                kod: 'UR010',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Fındıklı çikolatalı midye baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Fıstık Ezmesi',
                kod: 'UR011',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Antep fıstığından hazırlanan fıstık ezmesi'
            }
        }),

        // Kadayıf Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Burma Kadayıf',
                kod: 'UR012',
                kategoriId: kadayifCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Burma kadayıf'
            }
        }),

        // Baklava Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Bülbül Yuvası',
                kod: 'UR013',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Geleneksel bülbül yuvası'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Çikolatalı Midye',
                kod: 'UR014',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Çikolatalı midye baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Dolama',
                kod: 'UR015',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Geleneksel dolama baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Eski Usûl Dolama',
                kod: 'UR016',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Eski usulde hazırlanan dolama'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Havuç Dilimi',
                kod: 'UR017',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Havuç dilimi baklava'
            }
        }),

        // Kurabiye Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Fıstıklı Kurabiye',
                kod: 'UR018',
                kategoriId: kurabiyeCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Antep fıstıklı kurabiye'
            }
        }),

        // Baklava Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Kuru Baklava',
                kod: 'UR019',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Geleneksel kuru baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Midye',
                kod: 'UR020',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Midye baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Özel Kare',
                kod: 'UR021',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Özel kare baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Özel Şöbiyet',
                kod: 'UR022',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Özel şöbiyet baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Şöbiyet',
                kod: 'UR023',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Geleneksel şöbiyet'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Yaprak Şöbiyet',
                kod: 'UR024',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Yaprak şöbiyet baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Yaş Baklava',
                kod: 'UR025',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Geleneksel yaş baklava'
            }
        }),

        // Diğer Ürünler
        prisma.urun.create({
            data: {
                ad: 'İç Fıstık',
                kod: 'UR026',
                kategoriId: digerCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Antep iç fıstığı'
            }
        }),

        // Baklava Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Kare Fıstık Ezmesi',
                kod: 'UR027',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Kare şeklinde fıstık ezmesi'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Karışık',
                kod: 'UR028',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Karışık baklava çeşitleri'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Kaymaklı Baklava',
                kod: 'UR029',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Kaymaklı baklava'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Kaymaklı Havuç Dilimi',
                kod: 'UR030',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Kaymaklı havuç dilimi'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Özel Karışık',
                kod: 'UR031',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Özel karışık baklava çeşitleri'
            }
        }),

        // Kurabiye Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Sade Kurabiye',
                kod: 'UR032',
                kategoriId: kurabiyeCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Sade kurabiye'
            }
        }),

        // Diğer Ürünler
        prisma.urun.create({
            data: {
                ad: 'Sadeyağ',
                kod: 'UR033',
                kategoriId: digerCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Doğal sadeyağ'
            }
        }),

        // Baklava Çeşitleri
        prisma.urun.create({
            data: {
                ad: 'Sargılı Fıstık Ezmesi',
                kod: 'UR034',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Sargılı fıstık ezmesi'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Soğuk Baklava',
                kod: 'UR035',
                kategoriId: baklavaCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Soğuk baklava'
            }
        }),

        // Diğer Ürünler
        prisma.urun.create({
            data: {
                ad: 'Tuzlu Antep Fıstığı',
                kod: 'UR036',
                kategoriId: digerCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Tuzlu Antep fıstığı'
            }
        }),

        // Özel Tepsiler
        prisma.urun.create({
            data: {
                ad: 'Yazılı Karışık Tepsi',
                kod: 'UR037',
                kategoriId: ozelTepsiCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Yazılı karışık tepsi'
            }
        }),
        prisma.urun.create({
            data: {
                ad: 'Yılbaşı Tepsisi',
                kod: 'UR038',
                kategoriId: ozelTepsiCat,
                satisaBirimi: 'KG',
                aktif: true,
                satisaUygun: true,
                aciklama: 'Yılbaşı için özel hazırlanan tepsi'
            }
        })
    ]);
    console.log(`✅ ${urunler.length} ürün eklendi`);

    // 3️⃣ FİYATLAR
    console.log('💰 Fiyatlar ekleniyor...');
    const fiyatlar = [
        { kod: 'UR001', fiyat: 950 },   // Antep Peynirli Su Böreği
        { kod: 'UR002', fiyat: 1600 },  // Bayram Tepsisi
        { kod: 'UR003', fiyat: 1450 },  // Cevizli Bülbül Yuvası
        { kod: 'UR004', fiyat: 1450 },  // Cevizli Eski Usûl Dolama
        { kod: 'UR005', fiyat: 1400 },  // Cevizli Özel Kare
        { kod: 'UR006', fiyat: 1400 },  // Cevizli Şöbiyet
        { kod: 'UR007', fiyat: 1000 },  // Cevizli Yaş Baklava
        { kod: 'UR008', fiyat: 1600 },  // Doğum Günü Tepsisi
        { kod: 'UR009', fiyat: 1450 },  // Düz Kadayıf
        { kod: 'UR010', fiyat: 1700 },  // Fındıklı Çikolatalı Midye
        { kod: 'UR011', fiyat: 1650 },  // Fıstık Ezmesi
        { kod: 'UR012', fiyat: 1450 },  // Burma Kadayıf
        { kod: 'UR013', fiyat: 1650 },  // Bülbül Yuvası
        { kod: 'UR014', fiyat: 1800 },  // Çikolatalı Midye
        { kod: 'UR015', fiyat: 1650 },  // Dolama
        { kod: 'UR016', fiyat: 1650 },  // Eski Usûl Dolama
        { kod: 'UR017', fiyat: 1400 },  // Havuç Dilimi
        { kod: 'UR018', fiyat: 1500 },  // Fıstıklı Kurabiye
        { kod: 'UR019', fiyat: 1200 },  // Kuru Baklava
        { kod: 'UR020', fiyat: 1650 },  // Midye
        { kod: 'UR021', fiyat: 1450 },  // Özel Kare
        { kod: 'UR022', fiyat: 1650 },  // Özel Şöbiyet
        { kod: 'UR023', fiyat: 1450 },  // Şöbiyet
        { kod: 'UR024', fiyat: 1700 },  // Yaprak Şöbiyet
        { kod: 'UR025', fiyat: 1200 },  // Yaş Baklava
        { kod: 'UR026', fiyat: 1750 },  // İç Fıstık
        { kod: 'UR027', fiyat: 1700 },  // Kare Fıstık Ezmesi
        { kod: 'UR028', fiyat: 1500 },  // Karışık
        { kod: 'UR029', fiyat: 950 },   // Kaymaklı Baklava
        { kod: 'UR030', fiyat: 950 },   // Kaymaklı Havuç Dilimi
        { kod: 'UR031', fiyat: 1600 },  // Özel Karışık
        { kod: 'UR032', fiyat: 1000 },  // Sade Kurabiye
        { kod: 'UR033', fiyat: 700 },   // Sadeyağ
        { kod: 'UR034', fiyat: 1650 },  // Sargılı Fıstık Ezmesi
        { kod: 'UR035', fiyat: 1200 },  // Soğuk Baklava
        { kod: 'UR036', fiyat: 900 },   // Tuzlu Antep Fıstığı
        { kod: 'UR037', fiyat: 1600 },  // Yazılı Karışık Tepsi
        { kod: 'UR038', fiyat: 1600 }   // Yılbaşı Tepsisi
    ];

    const fiyatKayitlari = [];
    for (const fiyatData of fiyatlar) {
        const urun = urunler.find(u => u.kod === fiyatData.kod);
        if (urun) {
            const fiyat = await prisma.fiyat.create({
                data: {
                    urunId: urun.id,
                    fiyat: fiyatData.fiyat,
                    birim: 'KG',
                    fiyatTipi: 'NORMAL',
                    gecerliTarih: new Date(),
                    aktif: true
                }
            });
            fiyatKayitlari.push(fiyat);
        }
    }
    console.log(`✅ ${fiyatKayitlari.length} fiyat eklendi`);

    console.log(`\n🎉 TOPLAM EKLENEN VERİLER:`);
    console.log(`   • ${kategoriler.length} ürün kategorisi`);
    console.log(`   • ${urunler.length} ürün`);
    console.log(`   • ${fiyatKayitlari.length} fiyat`);
    console.log(`\n✅ ÜRÜN VE FİYAT VERİLERİ BAŞARIYLA YÜKLENDİ!`);
}

main()
    .catch((e) => {
        console.error('❌ Seed hatası:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 