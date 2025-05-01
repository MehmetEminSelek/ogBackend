import { PrismaClient, Prisma } from '@prisma/client'; // Prisma importunu ekleyelim
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...'); // Başlangıç logu

  try {
    // --- Lookup Tabloları ---
    console.log('Seeding TeslimatTuru...');
    await prisma.teslimatTuru.createMany({
      data: [
        { ad: "Evine Gönderilecek", kodu: "TT001" }, { ad: "Kendisi Alacak", kodu: "TT002" },
        { ad: "Mtn", kodu: "TT003" }, { ad: "Otobüs", kodu: "TT004" },
        { ad: "Şubeden Teslim", kodu: "TT005" }, { ad: "Yurtiçi Kargo", kodu: "TT006" }
      ],
      skipDuplicates: true
    });
    console.log('TeslimatTuru seeded.');

    console.log('Seeding Sube...');
    await prisma.sube.createMany({
      data: [
        { ad: "Hava-1", kodu: "SB001" }, { ad: "Hava-3", kodu: "SB002" },
        { ad: "Hitit", kodu: "SB003" }, { ad: "İbrahimli", kodu: "SB004" },
        { ad: "Karagöz", kodu: "SB005" }, { ad: "Otogar", kodu: "SB006" }
      ],
      skipDuplicates: true
    });
    console.log('Sube seeded.');

    console.log('Seeding GonderenAliciTipi...');
    await prisma.gonderenAliciTipi.createMany({
      data: [
        { ad: "Gönderen ve Alıcı", kodu: "GA001" }, { ad: "Tek Gönderen", kodu: "GA002" },
        { ad: "Özel", kodu: "GA003" }
      ],
      skipDuplicates: true
    });
    console.log('GonderenAliciTipi seeded.');

    console.log('Seeding Ambalaj...');
    await prisma.ambalaj.createMany({
      data: [
        { ad: "Kutu", kodu: "AMB01" }, { ad: "Tepsi/Tava", kodu: "AMB02" },
        { ad: "Özel", kodu: "AMB03" } // "Özel" eklenmişti
      ],
      skipDuplicates: true
    });
    console.log('Ambalaj seeded.');

    // --- TepsiTava (Fiyatlar Güncellendi/Eklendi - upsert ile) ---
    console.log('Upserting TepsiTava with prices...');
    const tepsiTavaData = [ // Değişken adı düzeltildi
      // Son resimdeki fiyatlar (ddasda.png)
      { ad: "1 Li Tava", kodu: "TP001", fiyat: 70 }, // Fiyat güncellendi
      { ad: "1,5 Lu Tava", kodu: "TP003", fiyat: 80 }, // Fiyat güncellendi
      { ad: "2 Li Tava", kodu: "TP006", fiyat: 110 }, // Fiyat güncellendi
      { ad: "800 Lük Tava", kodu: "TP012", fiyat: 140 }, // Fiyat güncellendi
      { ad: "1000 Lik Tava", kodu: "TP005", fiyat: 180 }, // Fiyat güncellendi
      { ad: "1 Li Tepsi", kodu: "TP002", fiyat: 70 }, // Fiyat güncellendi
      { ad: "1,5 Lu Tepsi", kodu: "TP004", fiyat: 90 }, // Fiyat güncellendi
      { ad: "2 Li Tepsi", kodu: "TP007", fiyat: 100 }, // Fiyat güncellendi
      { ad: "2,5 Lu Tepsi", kodu: "TP008", fiyat: 130 }, // Fiyat güncellendi
      { ad: "3 Lü Tepsi", kodu: "TP009", fiyat: 150 }, // Fiyat güncellendi
      { ad: "4 Lü Tepsi", kodu: "TP010", fiyat: 200 }, // Fiyat güncellendi
      { ad: "5 Li Tepsi", kodu: "TP011", fiyat: 250 }, // Fiyat güncellendi
    ];
    // Mevcutları güncelle, yoksa oluştur (upsert)
    for (const item of tepsiTavaData) { // Değişken adı düzeltildi
      // Önce var olup olmadığını kontrol et, yoksa createMany hata verebilir
      // const existing = await prisma.tepsiTava.findUnique({ where: { ad: item.ad } }); // Bu kontrol upsert ile gereksiz
      // if (existing) {
      //   await prisma.tepsiTava.update({
      //     where: { ad: item.ad },
      //     data: { fiyat: item.fiyat, kodu: item.kodu },
      //   });
      // } else {
      //   await prisma.tepsiTava.create({ data: item });
      //   console.warn(`Tepsi/Tava "${item.ad}" bulunamadı, yeni kayıt oluşturuldu.`);
      // }
      await prisma.tepsiTava.upsert({ // Doğrudan upsert kullanmak daha iyi
        where: { ad: item.ad },
        update: { fiyat: item.fiyat, kodu: item.kodu },
        create: { ad: item.ad, kodu: item.kodu, fiyat: item.fiyat },
      });
    }
    console.log('TepsiTava seeded/updated.');


    // --- Kutu (Fiyat eklenmedi) ---
    console.log('Seeding Kutu...');
    await prisma.kutu.createMany({
      data: [
        { ad: "1 Kg Kare Kutusu", kodu: "KT001" }, { ad: "1 Kg Kutu", kodu: "KT002" },
        { ad: "1 Kg POŞET TF", kodu: "KT003" }, { ad: "1 Kg TAHTA TF Kutusu", kodu: "KT004" },
        { ad: "1 Kg TF Kutusu", kodu: "KT005" }, { ad: "1,5 Kg Kutu", kodu: "KT006" },
        { ad: "250 gr Kutu", kodu: "KT007" }, { ad: "500 gr Kare Kutusu", kodu: "KT008" },
        { ad: "500 gr Kutu", kodu: "KT009" }, { ad: "500 gr POŞET TF", kodu: "KT010" },
        { ad: "500 gr TAHTA TF Kutusu", kodu: "KT011" }, { ad: "500 gr TF Kutusu", kodu: "KT012" },
        { ad: "750 gr Kutu", kodu: "KT013" }, { ad: "Tekli HD Kutusu", kodu: "KT014" },
        { ad: "Tekli Kare Kutusu", kodu: "KT015" }
      ],
      skipDuplicates: true
    });
    console.log('Kutu seeded.');

    // --- Urun (Değişiklik yok) ---
    console.log('Seeding Urun...');
    await prisma.urun.createMany({
      data: [
        { ad: "Antep Peynirli Su Böreği", kodu: "UR001" }, { ad: "Bayram Tepsisi", kodu: "UR002" },
        { ad: "Cevizli Bülbül Yuvası", kodu: "UR003" }, { ad: "Cevizli Eski Usûl Dolama", kodu: "UR004" },
        { ad: "Cevizli Özel Kare Baklava", kodu: "UR005" }, { ad: "Cevizli Şöbiyet", kodu: "UR006" },
        { ad: "Cevizli Yaş Baklava", kodu: "UR007" }, { ad: "Doğum Günü Tepsisi", kodu: "UR008" },
        { ad: "Düz Kadayıf", kodu: "UR009" }, { ad: "Fındıklı Çikolatalı Midye Baklava", kodu: "UR010" },
        { ad: "Fıstık Ezmesi", kodu: "UR011" }, { ad: "Fıstıklı Burma Kadayıf", kodu: "UR012" },
        { ad: "Fıstıklı Bülbül Yuvası", kodu: "UR013" }, { ad: "Fıstıklı Çikolatalı Midye Baklava", kodu: "UR014" },
        { ad: "Fıstıklı Dolama", kodu: "UR015" }, { ad: "Fıstıklı Eski Usûl Dolama", kodu: "UR016" },
        { ad: "Fıstıklı Havuç Dilimi Baklava", kodu: "UR017" }, { ad: "Fıstıklı Kurabiye", kodu: "UR018" },
        { ad: "Fıstıklı Kuru Baklava", kodu: "UR019" }, { ad: "Fıstıklı Midye", kodu: "UR020" },
        { ad: "Fıstıklı Özel Kare Baklava", kodu: "UR021" }, { ad: "Fıstıklı Özel Şöbiyet", kodu: "UR022" },
        { ad: "Fıstıklı Şöbiyet", kodu: "UR023" }, { ad: "Fıstıklı Yaprak Şöbiyet", kodu: "UR024" },
        { ad: "Fıstıklı Yaş Baklava", kodu: "UR025" }, { ad: "İç Fıstık", kodu: "UR026" },
        { ad: "Kare Fıstık Ezmesi", kodu: "UR027" }, { ad: "Karışık Baklava", kodu: "UR028" },
        { ad: "Kaymaklı Baklava", kodu: "UR029" }, { ad: "Kaymaklı Havuç Dilimi Baklava", kodu: "UR030" },
        { ad: "Özel Karışık Baklava", kodu: "UR031" }, { ad: "Sade Kurabiye", kodu: "UR032" },
        { ad: "Sade Yağ", kodu: "UR033" }, { ad: "Sargılı Fıstık Ezmesi", kodu: "UR034" },
        { ad: "Soğuk Baklava", kodu: "UR035" }, { ad: "Tuzlu Antep Fıstığı", kodu: "UR036" },
        { ad: "Yazılı Karışık Tepsi", kodu: "UR037" }, { ad: "Yılbaşı Tepsisi", kodu: "UR038" }
      ],
      skipDuplicates: true
    });
    console.log('Urun seeded.');

    // --- Fiyat Verileri (Güncel Fiyatlar Eklendi) ---
    console.log('Seeding Fiyat...');
    try {
      const urunler = await prisma.urun.findMany({ select: { id: true, ad: true } });
      const urunIdMap = urunler.reduce((map, urun) => { map[urun.ad] = urun.id; return map; }, {});
      console.log("Eşleştirilen Ürün ID'leri:", urunIdMap);

      // Güncel Fiyatlar (21.11.2023 başlangıçlı - KG Fiyatları varsayıldı)
      const fiyatlarData = [
        { urunId: urunIdMap["Fıstıklı Yaş Baklava"], fiyat: 1212.50, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Kuru Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Özel Kare Baklava"], fiyat: 1510.42, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Özel Şöbiyet"], fiyat: 1510.42, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null }, // Birim kontrol edilmeli
        { urunId: urunIdMap["Fıstıklı Şöbiyet"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null }, // Birim kontrol edilmeli
        { urunId: urunIdMap["Fıstıklı Yaprak Şöbiyet"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null }, // Birim kontrol edilmeli
        { urunId: urunIdMap["Cevizli Yaş Baklava"], fiyat: 781.25, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Cevizli Özel Kare Baklava"], fiyat: 869.79, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Cevizli Şöbiyet"], fiyat: 781.25, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null }, // Birim kontrol edilmeli
        { urunId: urunIdMap["Cevizli Bülbül Yuvası"], fiyat: 781.25, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Cevizli Eski Usûl Dolama"], fiyat: 781.25, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Sade Yağ"], fiyat: 434.78, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["İç Fıstık"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Burma Kadayıf"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Bülbül Yuvası"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Çikolatalı Midye Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Dolama"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Eski Usûl Dolama"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Havuç Dilimi Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Kurabiye"], fiyat: 651.04, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Midye"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Kare Fıstık Ezmesi"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Karışık Baklava"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Kaymaklı Baklava"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Kaymaklı Havuç Dilimi Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Özel Karışık Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Sade Kurabiye"], fiyat: 434.78, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Sargılı Fıstık Ezmesi"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Soğuk Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Tuzlu Antep Fıstığı"], fiyat: 651.04, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Yazılı Karışık Tepsi"], fiyat: 1041.67, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null }, // Birim Adet varsayıldı
        { urunId: urunIdMap["Yılbaşı Tepsisi"], fiyat: 1041.67, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null }, // Birim Adet varsayıldı
        { urunId: urunIdMap["Antep Peynirli Su Böreği"], fiyat: 651.04, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Düz Kadayıf"], fiyat: 651.04, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        // Adet bazlı olabilecekler için örnekler (fiyatları ve birimleri kontrol et!)
        { urunId: urunIdMap["Fıstıklı Özel Şöbiyet"], fiyat: 50.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Şöbiyet"], fiyat: 45.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Yaprak Şöbiyet"], fiyat: 45.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Cevizli Şöbiyet"], fiyat: 35.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Fıstıklı Midye"], fiyat: 40.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Bayram Tepsisi"], fiyat: 1500.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },
        { urunId: urunIdMap["Doğum Günü Tepsisi"], fiyat: 1600.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null },

      ].filter(f => f.urunId !== undefined && f.urunId !== null);

      if (fiyatlarData.length > 0) {
        console.log(`Attempting to seed ${fiyatlarData.length} prices...`);
        await prisma.fiyat.createMany({
          data: fiyatlarData,
          skipDuplicates: true
        });
        console.log(`Fiyat seeding completed.`);
      } else {
        console.log('No valid price data to seed based on existing products or mapping.');
      }
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        console.warn('Some prices already exist, skipping duplicates due to unique constraint.');
      } else {
        console.error('Seeding Fiyat failed:', error);
      }
    }
    console.log('Fiyat seeding section finished.');

  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    console.log('Disconnecting Prisma Client...');
    await prisma.$disconnect();
    console.log('Prisma Client disconnected.');
  }
}

main()
  .then(() => { console.log('Seed script finished successfully.'); process.exit(0); })
  .catch((e) => { console.error('Unhandled error in main:', e); process.exit(1); });
