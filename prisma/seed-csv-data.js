const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 CSV VERİLERİNDEN DATABASE POPULATE EDILIYOR...\n');

    // 1️⃣ ŞUBELER VE OPERASYON BİRİMLERİ
    console.log('🏢 Şubeler ekleniyor...');
    const subeler = await Promise.all([
        prisma.sube.create({
            data: {
                ad: 'Hava-1',
                kod: 'SB001',
                adres: 'Hava-1 Şubesi',
                telefon: '0312 000 0001',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'Hava-3',
                kod: 'SB002',
                adres: 'Hava-3 Şubesi',
                telefon: '0312 000 0002',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'Hitit',
                kod: 'SB003',
                adres: 'Hitit Şubesi',
                telefon: '0312 000 0003',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'İbrahimli',
                kod: 'SB004',
                adres: 'İbrahimli Şubesi',
                telefon: '0312 000 0004',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'Karagöz',
                kod: 'SB005',
                adres: 'Karagöz Şubesi',
                telefon: '0312 000 0005',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'Otogar',
                kod: 'SB006',
                adres: 'Otogar Şubesi',
                telefon: '0312 000 0006',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'Salon',
                kod: 'SB007',
                adres: 'Salon Şubesi',
                telefon: '0312 000 0007',
                aktif: true
            }
        }),
        // Operasyon Birimleri
        prisma.sube.create({
            data: {
                ad: 'Ana Depo',
                kod: 'OP001',
                adres: 'Ana Depo - Merkez',
                telefon: '0312 000 0101',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'Cep Depo',
                kod: 'OP002',
                adres: 'Cep Depo',
                telefon: '0312 000 0102',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'Sevkiyat',
                kod: 'OP003',
                adres: 'Sevkiyat Birimi',
                telefon: '0312 000 0103',
                aktif: true
            }
        }),
        prisma.sube.create({
            data: {
                ad: 'Üretim',
                kod: 'OP004',
                adres: 'Üretim Birimi',
                telefon: '0312 000 0104',
                aktif: true
            }
        })
    ]);
    console.log(`✅ ${subeler.length} şube/operasyon birimi eklendi`);

    // 2️⃣ TESLİMAT TÜRLERİ
    console.log('🚚 Teslimat türleri ekleniyor...');
    const teslimatTurleri = await Promise.all([
        prisma.teslimatTuru.create({
            data: {
                ad: 'Evine Gönderilecek',
                kod: 'TT001',
                aciklama: 'Müşteri adresine teslimat',
                ekstraMaliyet: 15.0,
                aktif: true
            }
        }),
        prisma.teslimatTuru.create({
            data: {
                ad: 'Farklı Şubeden Teslim',
                kod: 'TT002',
                aciklama: 'Başka şubeden teslim alma',
                ekstraMaliyet: 0.0,
                aktif: true
            }
        }),
        prisma.teslimatTuru.create({
            data: {
                ad: 'Mtn',
                kod: 'TT003',
                aciklama: 'Mtn teslimatı',
                ekstraMaliyet: 25.0,
                aktif: true
            }
        }),
        prisma.teslimatTuru.create({
            data: {
                ad: 'Otobüs',
                kod: 'TT004',
                aciklama: 'Otobüs ile gönderim',
                ekstraMaliyet: 20.0,
                aktif: true
            }
        }),
        prisma.teslimatTuru.create({
            data: {
                ad: 'Şubeden Teslim',
                kod: 'TT005',
                aciklama: 'Şubeden teslim alma',
                ekstraMaliyet: 0.0,
                aktif: true
            }
        }),
        prisma.teslimatTuru.create({
            data: {
                ad: 'Yurtiçi Kargo',
                kod: 'TT006',
                aciklama: 'Yurtiçi kargo ile gönderim',
                ekstraMaliyet: 30.0,
                aktif: true
            }
        })
    ]);
    console.log(`✅ ${teslimatTurleri.length} teslimat türü eklendi`);

    // 3️⃣ HAMMADDELER
    console.log('🥜 Hammaddeler ekleniyor...');
    const hammaddeler = await Promise.all([
        prisma.material.create({
            data: {
                ad: 'Antep Peyniri',
                kod: 'HM001',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 10,
                birimFiyat: 120,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Ceviz',
                kod: 'HM002',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 5,
                birimFiyat: 180,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Glikoz',
                kod: 'HM003',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 20,
                birimFiyat: 25,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'İrmik No:0',
                kod: 'HM004',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 30,
                birimFiyat: 18,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'İrmik No:3',
                kod: 'HM005',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 25,
                birimFiyat: 16,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'İç Fıstık',
                kod: 'HM006',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 5,
                birimFiyat: 750,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Kadayıf',
                kod: 'HM007',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 10,
                birimFiyat: 45,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Karakoyunlu Un',
                kod: 'HM008',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 100,
                birimFiyat: 22,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Limon',
                kod: 'HM009',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 5,
                birimFiyat: 15,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Maydanoz',
                kod: 'HM010',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 2,
                birimFiyat: 12,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Nişasta',
                kod: 'HM011',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 10,
                birimFiyat: 20,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Sadeyağ',
                kod: 'HM012',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 20,
                birimFiyat: 85,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Soda',
                kod: 'HM013',
                tipi: 'HAMMADDE',
                birim: 'GRAM',
                mevcutStok: 0,
                minStokSeviye: 1000,
                birimFiyat: 0.05,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Su',
                kod: 'HM014',
                tipi: 'HAMMADDE',
                birim: 'LITRE',
                mevcutStok: 0,
                minStokSeviye: 100,
                birimFiyat: 1,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Süt',
                kod: 'HM015',
                tipi: 'HAMMADDE',
                birim: 'LITRE',
                mevcutStok: 0,
                minStokSeviye: 50,
                birimFiyat: 12,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Teksin Un',
                kod: 'HM016',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 100,
                birimFiyat: 20,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Toz Şeker',
                kod: 'HM017',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 50,
                birimFiyat: 28,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Tuz',
                kod: 'HM018',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 10,
                birimFiyat: 5,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Yoğurt',
                kod: 'HM019',
                tipi: 'HAMMADDE',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 20,
                birimFiyat: 18,
                aktif: true
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Yumurta',
                kod: 'HM020',
                tipi: 'HAMMADDE',
                birim: 'ADET',
                mevcutStok: 0,
                minStokSeviye: 100,
                birimFiyat: 2.5,
                aktif: true
            }
        })
    ]);
    console.log(`✅ ${hammaddeler.length} hammadde eklendi`);

    // 4️⃣ YARI MAMULLER
    console.log('🥄 Yarı mamuller ekleniyor...');
    const yariMamuller = await Promise.all([
        prisma.material.create({
            data: {
                ad: 'Hamur',
                kod: 'YM001',
                tipi: 'YARI_MAMUL',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 15,
                birimFiyat: 35,
                aktif: true,
                aciklama: 'Baklava ve börek için hazır hamur'
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Kaymak',
                kod: 'YM002',
                tipi: 'YARI_MAMUL',
                birim: 'KG',
                mevcutStok: 0,
                minStokSeviye: 5,
                birimFiyat: 85,
                aktif: true,
                aciklama: 'Kaymaklı ürünler için hazır kaymak'
            }
        }),
        prisma.material.create({
            data: {
                ad: 'Şerbet',
                kod: 'YM003',
                tipi: 'YARI_MAMUL',
                birim: 'LITRE',
                mevcutStok: 0,
                minStokSeviye: 10,
                birimFiyat: 15,
                aktif: true,
                aciklama: 'Tatlılar için hazır şerbet'
            }
        })
    ]);
    console.log(`✅ ${yariMamuller.length} yarı mamul eklendi`);

    console.log(`\n🎉 TOPLAM EKLENEN VERİLER:`);
    console.log(`   • ${subeler.length} şube/operasyon birimi`);
    console.log(`   • ${teslimatTurleri.length} teslimat türü`);
    console.log(`   • ${hammaddeler.length} hammadde`);
    console.log(`   • ${yariMamuller.length} yarı mamul`);
    console.log(`\n✅ CSV VERİLERİ BAŞARIYLA YÜKLENDİ!`);
}

main()
    .catch((e) => {
        console.error('❌ Seed hatası:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 