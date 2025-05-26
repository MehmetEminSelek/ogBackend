import 'dotenv/config';
import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';
import { fileURLToPath } from 'url';
const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// async function main() {
//   console.log('Seeding started...'); // Başlangıç logu

//   try {
//     // --- Lookup Tabloları ---
//     console.log('Seeding TeslimatTuru...');
//     await prisma.teslimatTuru.createMany({
//       data: [
//         { ad: "Evine Gönderilecek", kodu: "TT001" }, { ad: "Kendisi Alacak", kodu: "TT002" },
//         { ad: "Mtn", kodu: "TT003" }, { ad: "Otobüs", kodu: "TT004" },
//         { ad: "Şubeden Teslim", kodu: "TT005" }, { ad: "Yurtiçi Kargo", kodu: "TT006" }
//       ],
//       skipDuplicates: true
//     });
//     console.log('TeslimatTuru seeded.');

//     console.log('Seeding Sube...');
//     await prisma.sube.createMany({
//       data: [
//         { ad: "Hava-1", kodu: "SB001" }, { ad: "Hava-3", kodu: "SB002" },
//         { ad: "Hitit", kodu: "SB003" }, { ad: "İbrahimli", kodu: "SB004" },
//         { ad: "Karagöz", kodu: "SB005" }, { ad: "Otogar", kodu: "SB006" }
//       ],
//       skipDuplicates: true
//     });
//     console.log('Sube seeded.');

//     console.log('Seeding GonderenAliciTipi...');
//     await prisma.gonderenAliciTipi.createMany({
//       data: [
//         { ad: "Gönderen ve Alıcı", kodu: "GA001" }, { ad: "Tek Gönderen", kodu: "GA002" },
//         { ad: "Özel", kodu: "GA003" }
//       ],
//       skipDuplicates: true
//     });
//     console.log('GonderenAliciTipi seeded.');

//     console.log('Seeding Ambalaj...');
//     await prisma.ambalaj.createMany({
//       data: [
//         { ad: "Kutu", kodu: "AMB01" }, { ad: "Tepsi/Tava", kodu: "AMB02" },
//         { ad: "Özel", kodu: "AMB03" } // "Özel" eklenmişti
//       ],
//       skipDuplicates: true
//     });
//     console.log('Ambalaj seeded.');

//     // --- TepsiTava (Fiyatlar Güncellendi/Eklendi - upsert ile) ---
//     console.log('Upserting TepsiTava with prices...');
//     const tepsiTavaData = [ // Değişken adı düzeltildi
//       // Son resimdeki fiyatlar (ddasda.png)
//       { ad: "1 Li Tava", kodu: "TP001", fiyat: 70 }, // Fiyat güncellendi
//       { ad: "1,5 Lu Tava", kodu: "TP003", fiyat: 80 }, // Fiyat güncellendi
//       { ad: "2 Li Tava", kodu: "TP006", fiyat: 110 }, // Fiyat güncellendi
//       { ad: "800 Lük Tava", kodu: "TP012", fiyat: 140 }, // Fiyat güncellendi
//       { ad: "1000 Lik Tava", kodu: "TP005", fiyat: 180 }, // Fiyat güncellendi
//       { ad: "1 Li Tepsi", kodu: "TP002", fiyat: 70 }, // Fiyat güncellendi
//       { ad: "1,5 Lu Tepsi", kodu: "TP004", fiyat: 90 }, // Fiyat güncellendi
//       { ad: "2 Li Tepsi", kodu: "TP007", fiyat: 100 }, // Fiyat güncellendi
//       { ad: "2,5 Lu Tepsi", kodu: "TP008", fiyat: 130 }, // Fiyat güncellendi
//       { ad: "3 Lü Tepsi", kodu: "TP009", fiyat: 150 }, // Fiyat güncellendi
//       { ad: "4 Lü Tepsi", kodu: "TP010", fiyat: 200 }, // Fiyat güncellendi
//       { ad: "5 Li Tepsi", kodu: "TP011", fiyat: 250 }, // Fiyat güncellendi
//     ];
//     // Mevcutları güncelle, yoksa oluştur (upsert)
//     for (const item of tepsiTavaData) { // Değişken adı düzeltildi
//       // Önce var olup olmadığını kontrol et, yoksa createMany hata verebilir
//       // const existing = await prisma.tepsiTava.findUnique({ where: { ad: item.ad } }); // Bu kontrol upsert ile gereksiz
//       // if (existing) {
//       //   await prisma.tepsiTava.update({
//       //     where: { ad: item.ad },
//       //     data: { fiyat: item.fiyat, kodu: item.kodu },
//       //   });
//       // } else {
//       //   await prisma.tepsiTava.create({ data: item });
//       //   console.warn(`Tepsi/Tava "${item.ad}" bulunamadı, yeni kayıt oluşturuldu.`);
//       // }
//       await prisma.tepsiTava.upsert({ // Doğrudan upsert kullanmak daha iyi
//         where: { ad: item.ad },
//         update: { fiyat: item.fiyat, kodu: item.kodu },
//         create: { ad: item.ad, kodu: item.kodu, fiyat: item.fiyat },
//       });
//     }
//     console.log('TepsiTava seeded/updated.');


//     // --- Kutu (Fiyat eklenmedi) ---
//     console.log('Seeding Kutu...');
//     await prisma.kutu.createMany({
//       data: [
//         { ad: "1 Kg Kare Kutusu", kodu: "KT001" }, { ad: "1 Kg Kutu", kodu: "KT002" },
//         { ad: "1 Kg POŞET TF", kodu: "KT003" }, { ad: "1 Kg TAHTA TF Kutusu", kodu: "KT004" },
//         { ad: "1 Kg TF Kutusu", kodu: "KT005" }, { ad: "1,5 Kg Kutu", kodu: "KT006" },
//         { ad: "250 gr Kutu", kodu: "KT007" }, { ad: "500 gr Kare Kutusu", kodu: "KT008" },
//         { ad: "500 gr Kutu", kodu: "KT009" }, { ad: "500 gr POŞET TF", kodu: "KT010" },
//         { ad: "500 gr TAHTA TF Kutusu", kodu: "KT011" }, { ad: "500 gr TF Kutusu", kodu: "KT012" },
//         { ad: "750 gr Kutu", kodu: "KT013" }, { ad: "Tekli HD Kutusu", kodu: "KT014" },
//         { ad: "Tekli Kare Kutusu", kodu: "KT015" }
//       ],
//       skipDuplicates: true
//     });
//     console.log('Kutu seeded.');

//     // --- Urun (Değişiklik yok) ---
//     console.log('Seeding Urun...');
//     await prisma.urun.createMany({
//       data: [
//         { ad: "Antep Peynirli Su Böreği", kodu: "UR001" }, { ad: "Bayram Tepsisi", kodu: "UR002" },
//         { ad: "Cevizli Bülbül Yuvası", kodu: "UR003" }, { ad: "Cevizli Eski Usûl Dolama", kodu: "UR004" },
//         { ad: "Cevizli Özel Kare Baklava", kodu: "UR005" }, { ad: "Cevizli Şöbiyet", kodu: "UR006" },
//         { ad: "Cevizli Yaş Baklava", kodu: "UR007" }, { ad: "Doğum Günü Tepsisi", kodu: "UR008" },
//         { ad: "Düz Kadayıf", kodu: "UR009" }, { ad: "Fındıklı Çikolatalı Midye Baklava", kodu: "UR010" },
//         { ad: "Fıstık Ezmesi", kodu: "UR011" }, { ad: "Fıstıklı Burma Kadayıf", kodu: "UR012" },
//         { ad: "Fıstıklı Bülbül Yuvası", kodu: "UR013" }, { ad: "Fıstıklı Çikolatalı Midye Baklava", kodu: "UR014" },
//         { ad: "Fıstıklı Dolama", kodu: "UR015" }, { ad: "Fıstıklı Eski Usûl Dolama", kodu: "UR016" },
//         { ad: "Fıstıklı Havuç Dilimi Baklava", kodu: "UR017" }, { ad: "Fıstıklı Kurabiye", kodu: "UR018" },
//         { ad: "Fıstıklı Kuru Baklava", kodu: "UR019" }, { ad: "Fıstıklı Midye", kodu: "UR020" },
//         { ad: "Fıstıklı Özel Kare Baklava", kodu: "UR021" }, { ad: "Fıstıklı Özel Şöbiyet", kodu: "UR022" },
//         { ad: "Fıstıklı Şöbiyet", kodu: "UR023" }, { ad: "Fıstıklı Yaprak Şöbiyet", kodu: "UR024" },
//         { ad: "Fıstıklı Yaş Baklava", kodu: "UR025" }, { ad: "İç Fıstık", kodu: "UR026" },
//         { ad: "Kare Fıstık Ezmesi", kodu: "UR027" }, { ad: "Karışık Baklava", kodu: "UR028" },
//         { ad: "Kaymaklı Baklava", kodu: "UR029" }, { ad: "Kaymaklı Havuç Dilimi Baklava", kodu: "UR030" },
//         { ad: "Özel Karışık Baklava", kodu: "UR031" }, { ad: "Sade Kurabiye", kodu: "UR032" },
//         { ad: "Sade Yağ", kodu: "UR033" }, { ad: "Sargılı Fıstık Ezmesi", kodu: "UR034" },
//         { ad: "Soğuk Baklava", kodu: "UR035" }, { ad: "Tuzlu Antep Fıstığı", kodu: "UR036" },
//         { ad: "Yazılı Karışık Tepsi", kodu: "UR037" }, { ad: "Yılbaşı Tepsisi", kodu: "UR038" }
//       ],
//       skipDuplicates: true
//     });
//     console.log('Urun seeded.');

//     // --- Fiyat Verileri (Güncel Fiyatlar Eklendi) ---
//     console.log('Seeding Fiyat...');
//     try {
//       const urunler = await prisma.urun.findMany({ select: { id: true, ad: true } });
//       const urunIdMap = urunler.reduce((map, urun) => { map[urun.ad] = urun.id; return map; }, {});
//       console.log("Eşleştirilen Ürün ID'leri:", urunIdMap);

//       // Güncel Fiyatlar (21.11.2023 başlangıçlı - KG Fiyatları varsayıldı)
//       const fiyatlarData = [
//         { urunId: urunIdMap["Fıstıklı Yaş Baklava"], fiyat: 1212.50, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Kuru Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Özel Kare Baklava"], fiyat: 1510.42, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Özel Şöbiyet"], fiyat: 1510.42, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") }, // Birim kontrol edilmeli
//         { urunId: urunIdMap["Fıstıklı Şöbiyet"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") }, // Birim kontrol edilmeli
//         { urunId: urunIdMap["Fıstıklı Yaprak Şöbiyet"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") }, // Birim kontrol edilmeli
//         { urunId: urunIdMap["Cevizli Yaş Baklava"], fiyat: 781.25, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Cevizli Özel Kare Baklava"], fiyat: 869.79, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Cevizli Şöbiyet"], fiyat: 781.25, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") }, // Birim kontrol edilmeli
//         { urunId: urunIdMap["Cevizli Bülbül Yuvası"], fiyat: 781.25, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Cevizli Eski Usûl Dolama"], fiyat: 781.25, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Sade Yağ"], fiyat: 434.78, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["İç Fıstık"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Burma Kadayıf"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Bülbül Yuvası"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Çikolatalı Midye Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Dolama"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Eski Usûl Dolama"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Havuç Dilimi Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Kurabiye"], fiyat: 651.04, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Midye"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Kare Fıstık Ezmesi"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Karışık Baklava"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Kaymaklı Baklava"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Kaymaklı Havuç Dilimi Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Özel Karışık Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Sade Kurabiye"], fiyat: 434.78, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Sargılı Fıstık Ezmesi"], fiyat: 1041.67, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Soğuk Baklava"], fiyat: 1302.08, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Tuzlu Antep Fıstığı"], fiyat: 651.04, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Yazılı Karışık Tepsi"], fiyat: 1041.67, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") }, // Birim Adet varsayıldı
//         { urunId: urunIdMap["Yılbaşı Tepsisi"], fiyat: 1041.67, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") }, // Birim Adet varsayıldı
//         { urunId: urunIdMap["Antep Peynirli Su Böreği"], fiyat: 651.04, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Düz Kadayıf"], fiyat: 651.04, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         // Adet bazlı olabilecekler için örnekler (fiyatları ve birimleri kontrol et!)
//         { urunId: urunIdMap["Fıstıklı Özel Şöbiyet"], fiyat: 50.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Şöbiyet"], fiyat: 45.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Yaprak Şöbiyet"], fiyat: 45.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Cevizli Şöbiyet"], fiyat: 35.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Fıstıklı Midye"], fiyat: 40.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Bayram Tepsisi"], fiyat: 1500.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },
//         { urunId: urunIdMap["Doğum Günü Tepsisi"], fiyat: 1600.00, birim: "Adet", gecerliTarih: new Date("2023-11-21"), bitisTarihi: new Date("2029-11-21") },

//       ].filter(f => f.urunId !== undefined && f.urunId !== null);

//       if (fiyatlarData.length > 0) {
//         console.log(`Attempting to seed ${fiyatlarData.length} prices...`);
//         await prisma.fiyat.createMany({
//           data: fiyatlarData,
//           skipDuplicates: true
//         });
//         console.log(`Fiyat seeding completed.`);
//       } else {
//         console.log('No valid price data to seed based on existing products or mapping.');
//       }
//     } catch (error) {
//       if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
//         console.warn('Some prices already exist, skipping duplicates due to unique constraint.');
//       } else {
//         console.error('Seeding Fiyat failed:', error);
//       }
//     }
//     console.log('Fiyat seeding section finished.');

//   } catch (error) {
//     console.error('Seeding failed:', error);
//     process.exit(1);
//   } finally {
//     console.log('Disconnecting Prisma Client...');
//     await prisma.$disconnect();
//     console.log('Prisma Client disconnected.');
//   }
// }

// main()
//   .then(() => { console.log('Seed script finished successfully.'); process.exit(0); })
//   .catch((e) => { console.error('Unhandled error in main:', e); process.exit(1); });



// seed.js (20 Dummy Sipariş Eklendi)

// Yardımcı fonksiyon: Belirli bir tarih için ürün fiyatını bulur
async function getPriceForDate(urunId, birim, tarih) { // tx kaldırıldı, doğrudan prisma kullanılacak
  if (!urunId || !birim || !tarih) return 0;
  const targetBirim = birim.toLowerCase() === 'gram' ? 'KG' : birim;
  const fiyatKaydi = await prisma.fiyat.findFirst({ // tx yerine prisma
    where: {
      urunId: urunId,
      birim: targetBirim,
      gecerliTarih: { lte: tarih },
      // Bitiş tarihi kontrolü (şemada bitisTarihi varsa)
      OR: [{ bitisTarihi: null }, { bitisTarihi: { gte: tarih } }]
    },
    orderBy: { gecerliTarih: 'desc' },
  });
  // console.log(`(Helper) Fiyat sorgusu: urunId=${urunId}, birim=${targetBirim}, tarih=${tarih.toISOString().split('T')[0]}, bulunanFiyat=${fiyatKaydi?.fiyat}`);
  return fiyatKaydi?.fiyat || 0;
}

// Yardımcı fonksiyon: Tepsi/Tava fiyatını bulur
async function getTepsiTavaPrice(tepsiTavaId) { // tx kaldırıldı
  if (!tepsiTavaId) return 0;
  const tepsi = await prisma.tepsiTava.findUnique({ // tx yerine prisma
    where: { id: tepsiTavaId },
    select: { fiyat: true }
  });
  // console.log(`(Helper) Tepsi fiyat sorgusu: tepsiId=${tepsiTavaId}, bulunanFiyat=${tepsi?.fiyat}`);
  return tepsi?.fiyat || 0;
}

// Rastgele sayı üretme fonksiyonu
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Rastgele tarih üretme (son 1 ay içinde)
function getRandomDate() {
  const end = new Date(); // Bugün
  const start = new Date();
  start.setDate(end.getDate() - 30); // Son 30 gün
  const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  randomDate.setHours(0, 0, 0, 0); // Saati sıfırla
  return randomDate;
}

// --- STOCK MANAGEMENT SEED ---
async function seedStockManagement(prisma) {
  // 1. Operasyon Birimleri
  const operasyonBirimleri = [
    { ad: 'Ana Depo', kod: 'OP001' },
    { ad: 'Cep Depo', kod: 'OP002' },
    { ad: 'Sevkiyat', kod: 'OP003' },
    { ad: 'Üretim', kod: 'OP004' }
  ];
  for (const op of operasyonBirimleri) {
    await prisma.operasyonBirimi.upsert({
      where: { kod: op.kod },
      update: { ad: op.ad },
      create: op
    });
  }
  const uretimBirim = await prisma.operasyonBirimi.findUnique({ where: { kod: 'OP004' } });

  // 2. Hammaddeler
  const hammaddeler = [
    { ad: 'ANTEP PEYNİRİ', kod: 'HM001' },
    { ad: 'CEVİZ', kod: 'HM002' },
    { ad: 'GLİKOZ', kod: 'HM003' },
    { ad: 'IRMIK NO:0', kod: 'HM004' },
    { ad: 'IRMIK NO:3', kod: 'HM005' },
    { ad: 'İÇ FISTIK', kod: 'HM006' },
    { ad: 'KADAYIF', kod: 'HM007' },
    { ad: 'KARAKOYUNLU UN', kod: 'HM008' },
    { ad: 'LİMON', kod: 'HM009' },
    { ad: 'MAYDANOZ', kod: 'HM010' },
    { ad: 'NİŞASTA', kod: 'HM011' },
    { ad: 'SADE YAĞ', kod: 'HM012' },
    { ad: 'SODA GR', kod: 'HM013' },
    { ad: 'SU', kod: 'HM014' },
    { ad: 'SÜT', kod: 'HM015' },
    { ad: 'TEKSİN UN', kod: 'HM016' },
    { ad: 'TOZ ŞEKER', kod: 'HM017' },
    { ad: 'TUZ', kod: 'HM018' },
    { ad: 'YOĞURT', kod: 'HM019' },
    { ad: 'YUMURTA', kod: 'HM020' }
  ];
  for (const hm of hammaddeler) {
    const h = await prisma.hammadde.upsert({
      where: { kod: hm.kod },
      update: { ad: hm.ad },
      create: hm
    });
    await prisma.stok.upsert({
      where: { hammaddeId_operasyonBirimiId: { hammaddeId: h.id, operasyonBirimiId: uretimBirim.id } },
      update: { miktarGram: 1000000 },
      create: { hammaddeId: h.id, operasyonBirimiId: uretimBirim.id, miktarGram: 1000000 }
    });
  }
  // 3. Yarı Mamuller
  const yariMamuller = [
    { ad: 'HAMUR (YM)', kod: 'YM001' },
    { ad: 'KAYMAK (YM)', kod: 'YM002' },
    { ad: 'ŞERBET (YM)', kod: 'YM003' }
  ];
  for (const ym of yariMamuller) {
    const y = await prisma.yariMamul.upsert({
      where: { kod: ym.kod },
      update: { ad: ym.ad },
      create: ym
    });
    await prisma.stok.upsert({
      where: { yariMamulId_operasyonBirimiId: { yariMamulId: y.id, operasyonBirimiId: uretimBirim.id } },
      update: { miktarGram: 1000000 },
      create: { yariMamulId: y.id, operasyonBirimiId: uretimBirim.id, miktarGram: 1000000 }
    });
  }
  console.log('Stok yönetimi için başlangıç verileri eklendi.');
}

// --- REÇETE SEED ---
async function seedReceteler(prisma) {
  // Önce tüm reçeteleri sil
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();

  // Sadece istenen 17 reçete ve içerikleri:
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

  // Urun tablosundaki adları normalize et
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
  console.log('Reçeteler yeni modele göre başarıyla eklendi.');
}

async function seedMehmetEminSelek(prisma) {
  const email = 'mehmeteminselek@gmail.com';
  const existing = await prisma.user.findFirst({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash('123456', 10);
    await prisma.user.create({
      data: {
        ad: 'Mehmet Emin Selek',
        email,
        passwordHash,
        role: 'admin'
      }
    });
    console.log('Kullanıcı eklendi: mehmeteminselek@gmail.com / 123456');
  } else {
    console.log('mehmeteminselek@gmail.com zaten mevcut.');
  }
}

async function seedUrunlerVeFiyatlar(prisma) {
  const urunler = [
    { ad: 'Antep Peynirli Su Böreği', kod: 'UR001', kgFiyat: 950 },
    { ad: 'Bayram Tepsisi', kod: 'UR002', kgFiyat: 1600 },
    { ad: 'Cevizli Bülbül Yuvası', kod: 'UR003', kgFiyat: 1450 },
    { ad: 'Cevizli Eski Usûl Dolama', kod: 'UR004', kgFiyat: 1500 },
    { ad: 'Cevizli Özel Kare', kod: 'UR005', kgFiyat: 1400 },
    { ad: 'Cevizli Şöbiyet', kod: 'UR006', kgFiyat: 1450 },
    { ad: 'Cevizli Yaş Baklava', kod: 'UR007', kgFiyat: 1000 },
    { ad: 'Doğum Günü Tepsisi', kod: 'UR008', kgFiyat: 1600 },
    { ad: 'Düz Kadayıf', kod: 'UR009', kgFiyat: 1450 },
    { ad: 'Fındıklı Çikolatalı Midy', kod: 'UR010', kgFiyat: 1700 },
    { ad: 'Fıstık Ezmesi', kod: 'UR011', kgFiyat: 1700 },
    { ad: 'Burma Kadayıf', kod: 'UR012', kgFiyat: 1450 },
    { ad: 'Bülbül Yuvası', kod: 'UR013', kgFiyat: 1650 },
    { ad: 'Çikolatalı Midye', kod: 'UR014', kgFiyat: 1800 },
    { ad: 'Dolama', kod: 'UR015', kgFiyat: 1650 },
    { ad: 'Eski Usûl Dolama', kod: 'UR016', kgFiyat: 1650 },
    { ad: 'Havuç Dilimi', kod: 'UR017', kgFiyat: 1400 },
    { ad: 'Fıstıklı Kurabiye', kod: 'UR018', kgFiyat: 1500 },
    { ad: 'Kuru Baklava', kod: 'UR019', kgFiyat: 1200 },
    { ad: 'Midye', kod: 'UR020', kgFiyat: 1600 },
    { ad: 'Özel Kare', kod: 'UR021', kgFiyat: 1450 },
    { ad: 'Özel Şöbiyet', kod: 'UR022', kgFiyat: 1650 },
    { ad: 'Şöbiyet', kod: 'UR023', kgFiyat: 1650 },
    { ad: 'Yaprak Şöbiyet', kod: 'UR024', kgFiyat: 1700 },
    { ad: 'Yaş Baklava', kod: 'UR025', kgFiyat: 1200 },
    { ad: 'İç Fıstık', kod: 'UR026', kgFiyat: 1750 },
    { ad: 'Kare Fıstık Ezmesi', kod: 'UR027', kgFiyat: 1700 },
    { ad: 'Karışık', kod: 'UR028', kgFiyat: 1500 },
    { ad: 'Kaymaklı Baklava', kod: 'UR029', kgFiyat: 950 },
    { ad: 'Kaymaklı Havuç Dilimi', kod: 'UR030', kgFiyat: 950 },
    { ad: 'Özel Karışık', kod: 'UR031', kgFiyat: 1600 },
    { ad: 'Sade Kurabiye', kod: 'UR032', kgFiyat: 1000 },
    { ad: 'Sadeyağ', kod: 'UR033', kgFiyat: 950 },
    { ad: 'Sargılı Fıstık Ezmesi', kod: 'UR034', kgFiyat: 1650 },
    { ad: 'Soğuk Baklava', kod: 'UR035', kgFiyat: 1200 },
    { ad: 'Tuzlu Antep Fıstığı', kod: 'UR036', kgFiyat: 900 },
    { ad: 'Yazılı Karışık Tepsi', kod: 'UR037', kgFiyat: 1600 },
    { ad: 'Yılbaşı Tepsisi', kod: 'UR038', kgFiyat: 1600 },
  ];
  const today = new Date();
  for (const u of urunler) {
    const urun = await prisma.urun.upsert({
      where: { kodu: u.kod },
      update: { ad: u.ad },
      create: { ad: u.ad, kodu: u.kod }
    });
    // Fiyat kaydı var mı kontrol et
    const existingFiyat = await prisma.fiyat.findFirst({
      where: {
        urunId: urun.id,
        birim: 'GR',
        gecerliTarih: today
      }
    });
    if (existingFiyat) {
      await prisma.fiyat.update({
        where: { id: existingFiyat.id },
        data: {
          fiyat: u.kgFiyat / 1000,
          bitisTarihi: null
        }
      });
      console.log('Fiyat güncellendi:', urun.ad);
    } else {
      await prisma.fiyat.create({
        data: {
          urunId: urun.id,
          fiyat: u.kgFiyat / 1000,
          birim: 'GR',
          gecerliTarih: today,
          bitisTarihi: null
        }
      });
      console.log('Fiyat eklendi:', urun.ad);
    }
  }
  console.log('Ürünler ve gram fiyatları başarıyla eklendi.');
}

async function seedCarilerFromCSV(prisma) {
  const filePath = '../Cari.csv';
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const records = [];
  await new Promise((resolve, reject) => {
    parse(fileContent, { delimiter: ';', columns: true, trim: true }, (err, output) => {
      if (err) reject(err);
      else {
        output.forEach(row => records.push(row));
        resolve();
      }
    });
  });

  // Mevcut şubeleri çek
  const mevcutSubeler = await prisma.sube.findMany();
  const subeMap = Object.fromEntries(mevcutSubeler.map(s => [s.ad.trim().toUpperCase(), s]));
  // Salon şubesi referansı
  const salonSube = subeMap['SALON'] || await prisma.sube.create({ data: { ad: 'SALON' } });

  let otomatikSalon = [];

  for (const row of records) {
    const cariAdi = row['CARİ ADI']?.trim();
    const musteriKodu = row['MÜŞTERİ KODU']?.trim();
    const subeAdi = row['ŞUBE ADI']?.trim();
    const telefon = row['TEL']?.trim();
    if (!cariAdi || !musteriKodu || !subeAdi) continue;
    // Şube eşleşmesi
    let sube = subeMap[subeAdi.toUpperCase()];
    if (!sube) {
      sube = salonSube;
      otomatikSalon.push({ cariAdi, musteriKodu, orijinalSube: subeAdi });
    }
    await prisma.cari.upsert({
      where: { musteriKodu },
      update: { ad: cariAdi, telefon, subeId: sube.id },
      create: { ad: cariAdi, musteriKodu, telefon, subeId: sube.id },
    });
  }
  if (otomatikSalon.length > 0) {
    console.log('Aşağıdaki carilerde şube bulunamadı, SALON şubesine atandı:');
    otomatikSalon.forEach(c => console.log(`- ${c.cariAdi} (${c.musteriKodu}) [Orijinal şube: ${c.orijinalSube}]`));
  }
  console.log('CSV cariler ve şubeler eklendi.');
}

async function seedOrnekAdresler(prisma) {
  // İlk 10 cariyi çek
  const cariler = await prisma.cari.findMany({ take: 10, orderBy: { id: 'asc' } });
  if (cariler.length === 0) return;
  // 10 farklı örnek adres
  const ornekAdresler = [
    'Atatürk Cad. No:1, Şehitkamil',
    'İnönü Mah. 23. Sokak No:5, Şahinbey',
    'Gazi Muhtar Paşa Bulvarı No:12',
    'Küçük Sanayi Sitesi 2. Blok No:8',
    'Mareşal Fevzi Çakmak Cad. No:45',
    'Yeditepe Mah. 100. Cadde No:10',
    'Karataş Mah. 7. Sokak No:3',
    'Üniversite Bulvarı No:99',
    'Beylerbeyi Mah. 15. Cadde No:2',
    'Gazimuhtarpaşa Mah. 4. Sokak No:6',
  ];
  // En az 3 cariye hem iş hem ev adresi ekle
  for (let i = 0; i < cariler.length; i++) {
    const cari = cariler[i];
    if (i < 3) {
      // Hem iş hem ev adresi
      await prisma.adres.createMany({
        data: [
          { cariId: cari.id, tip: 'Ev', adres: ornekAdresler[i] },
          { cariId: cari.id, tip: 'İş', adres: ornekAdresler[ornekAdresler.length - 1 - i] },
        ]
      });
    } else {
      // Sadece ev veya iş (dönüşümlü)
      const tip = i % 2 === 0 ? 'Ev' : 'İş';
      await prisma.adres.create({ data: { cariId: cari.id, tip, adres: ornekAdresler[i] } });
    }
  }
  console.log('İlk 10 cariye örnek adresler eklendi.');
}

async function importCarilerFromCSV() {
  const csvPath = path.join(__dirname, '../../Cari.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf8');
  const records = parse(fileContent, { delimiter: ';', columns: true, skip_empty_lines: true });

  // Şubeleri önceden çek
  const subeler = await prisma.sube.findMany();
  const subeMap = {};
  subeler.forEach(s => { subeMap[s.ad.trim().toUpperCase()] = s.id; });

  // SALON şubesi yoksa oluştur
  let salonSubeId = subeMap['SALON'];
  if (!salonSubeId) {
    const salon = await prisma.sube.create({ data: { ad: 'SALON' } });
    salonSubeId = salon.id;
    subeMap['SALON'] = salon.id;
  }

  for (const rec of records) {
    const ad = rec['CARİ ADI']?.trim();
    const musteriKodu = rec['MÜŞTERİ KODU']?.trim();
    const telefon = rec['TEL']?.trim();
    const subeAd = rec['ŞUBE ADI']?.trim().toUpperCase() || 'SALON';
    if (!ad || !musteriKodu) continue;
    let subeId = subeMap[subeAd];
    if (!subeId) {
      const sube = await prisma.sube.create({ data: { ad: subeAd } });
      subeId = sube.id;
      subeMap[subeAd] = subeId;
    }
    // Unique constraint için önce var mı bak
    const existing = await prisma.cari.findUnique({ where: { musteriKodu } });
    if (!existing) {
      await prisma.cari.create({
        data: {
          ad,
          musteriKodu,
          telefon,
          subeId,
        }
      });
    }
  }
  console.log('CSV cariler başarıyla eklendi.');
}

async function seedSuperAdmin(prisma) {
  const email = 'emin';
  const existing = await prisma.user.findFirst({ where: { email } });
  const passwordHash = await bcrypt.hash('12345', 10);
  if (!existing) {
    await prisma.user.create({
      data: {
        ad: 'Emin Süper Admin',
        email,
        passwordHash,
        role: 'superadmin'
      }
    });
    console.log('Superadmin eklendi: emin/12345');
  } else {
    await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, role: 'superadmin' } });
    console.log('Superadmin şifresi ve rolü güncellendi: emin/12345');
  }
}

async function main() {
  console.log('Seeding started...');

  try {
    await seedSuperAdmin(prisma);
    await seedMehmetEminSelek(prisma);
    // --- Lookup Tabloları, TepsiTava, Kutu, Urun, Fiyat (Önceki kodla aynı) ---
    console.log('Seeding Lookup Tables...');
    // ... (Lookup tabloları, TepsiTava, Kutu, Urun, Fiyat seed kodları buraya gelecek - önceki cevaplardan alabilirsin) ...
    // ÖNEMLİ: Bu tabloların dolu olduğundan emin ol!
    await prisma.teslimatTuru.createMany({
      data: [
        { ad: "Evine Gönderilecek", kodu: "TT001" },
        { ad: "Kendisi Alacak", kodu: "TT002" },
        { ad: "Mtn", kodu: "TT003" },
        { ad: "Otobüs", kodu: "TT004" },
        { ad: "Şubeden Teslim", kodu: "TT005" },
        { ad: "Yurtiçi Kargo", kodu: "TT006" },
        { ad: "Şubeden Şubeye", kodu: "TT007" }
      ], skipDuplicates: true
    });
    await prisma.sube.createMany({ data: [{ ad: "Hava-1", kodu: "SB001" }, { ad: "Hava-3", kodu: "SB002" }, { ad: "Hitit", kodu: "SB003" }, { ad: "İbrahimli", kodu: "SB004" }, { ad: "Karagöz", kodu: "SB005" }, { ad: "Otogar", kodu: "SB006" }], skipDuplicates: true });
    await prisma.gonderenAliciTipi.createMany({ data: [{ ad: "Gönderen ve Alıcı", kodu: "GA001" }, { ad: "Tek Gönderen", kodu: "GA002" }, { ad: "Özel", kodu: "GA003" }], skipDuplicates: true });
    await prisma.ambalaj.createMany({ data: [{ ad: "Kutu", kodu: "AMB01" }, { ad: "Tepsi/Tava", kodu: "AMB02" }, { ad: "Özel", kodu: "AMB03" }], skipDuplicates: true });
    const tepsiTavaDataForUpsert = [{ ad: "1 Li Tava", kodu: "TP001", fiyat: 70 }, { ad: "1,5 Lu Tava", kodu: "TP003", fiyat: 80 }, { ad: "2 Li Tava", kodu: "TP006", fiyat: 110 }, { ad: "800 Lük Tava", kodu: "TP012", fiyat: 140 }, { ad: "1000 Lik Tava", kodu: "TP005", fiyat: 180 }, { ad: "1 Li Tepsi", kodu: "TP002", fiyat: 70 }, { ad: "1,5 Lu Tepsi", kodu: "TP004", fiyat: 90 }, { ad: "2 Li Tepsi", kodu: "TP007", fiyat: 100 }, { ad: "2,5 Lu Tepsi", kodu: "TP008", fiyat: 130 }, { ad: "3 Lü Tepsi", kodu: "TP009", fiyat: 150 }, { ad: "4 Lü Tepsi", kodu: "TP010", fiyat: 200 }, { ad: "5 Li Tepsi", kodu: "TP011", fiyat: 250 },];
    for (const item of tepsiTavaDataForUpsert) { await prisma.tepsiTava.upsert({ where: { ad: item.ad }, update: { fiyat: item.fiyat, kodu: item.kodu }, create: { ad: item.ad, kodu: item.kodu, fiyat: item.fiyat }, }); }
    await prisma.kutu.createMany({ data: [{ ad: "1 Kg Kare Kutusu", kodu: "KT001" }, { ad: "1 Kg Kutu", kodu: "KT002" }, { ad: "1 Kg POŞET TF", kodu: "KT003" }, { ad: "1 Kg TAHTA TF Kutusu", kodu: "KT004" }, { ad: "1 Kg TF Kutusu", kodu: "KT005" }, { ad: "1,5 Kg Kutu", kodu: "KT006" }, { ad: "250 gr Kutu", kodu: "KT007" }, { ad: "500 gr Kare Kutusu", kodu: "KT008" }, { ad: "500 gr Kutu", kodu: "KT009" }, { ad: "500 gr POŞET TF", kodu: "KT010" }, { ad: "500 gr TAHTA TF Kutusu", kodu: "KT011" }, { ad: "500 gr TF Kutusu", kodu: "KT012" }, { ad: "750 gr Kutu", kodu: "KT013" }, { ad: "Tekli HD Kutusu", kodu: "KT014" }, { ad: "Tekli Kare Kutusu", kodu: "KT015" }], skipDuplicates: true });
    await prisma.urun.createMany({ data: [{ ad: "Antep Peynirli Su Böreği", kodu: "UR001" }, { ad: "Bayram Tepsisi", kodu: "UR002" }, { ad: "Cevizli Bülbül Yuvası", kodu: "UR003" }, { ad: "Cevizli Eski Usûl Dolama", kodu: "UR004" }, { ad: "Cevizli Özel Kare Baklava", kodu: "UR005" }, { ad: "Cevizli Şöbiyet", kodu: "UR006" }, { ad: "Cevizli Yaş Baklava", kodu: "UR007" }, { ad: "Doğum Günü Tepsisi", kodu: "UR008" }, { ad: "Düz Kadayıf", kodu: "UR009" }, { ad: "Fındıklı Çikolatalı Midye Baklava", kodu: "UR010" }, { ad: "Fıstık Ezmesi", kodu: "UR011" }, { ad: "Fıstıklı Burma Kadayıf", kodu: "UR012" }, { ad: "Fıstıklı Bülbül Yuvası", kodu: "UR013" }, { ad: "Fıstıklı Çikolatalı Midye Baklava", kodu: "UR014" }, { ad: "Fıstıklı Dolama", kodu: "UR015" }, { ad: "Fıstıklı Eski Usûl Dolama", kodu: "UR016" }, { ad: "Fıstıklı Havuç Dilimi Baklava", kodu: "UR017" }, { ad: "Fıstıklı Kurabiye", kodu: "UR018" }, { ad: "Fıstıklı Kuru Baklava", kodu: "UR019" }, { ad: "Fıstıklı Midye", kodu: "UR020" }, { ad: "Fıstıklı Özel Kare Baklava", kodu: "UR021" }, { ad: "Fıstıklı Özel Şöbiyet", kodu: "UR022" }, { ad: "Fıstıklı Şöbiyet", kodu: "UR023" }, { ad: "Fıstıklı Yaprak Şöbiyet", kodu: "UR024" }, { ad: "Fıstıklı Yaş Baklava", kodu: "UR025" }, { ad: "İç Fıstık", kodu: "UR026" }, { ad: "Kare Fıstık Ezmesi", kodu: "UR027" }, { ad: "Karışık Baklava", kodu: "UR028" }, { ad: "Kaymaklı Baklava", kodu: "UR029" }, { ad: "Kaymaklı Havuç Dilimi Baklava", kodu: "UR030" }, { ad: "Özel Karışık Baklava", kodu: "UR031" }, { ad: "Sade Kurabiye", kodu: "UR032" }, { ad: "Sade Yağ", kodu: "UR033" }, { ad: "Sargılı Fıstık Ezmesi", kodu: "UR034" }, { ad: "Soğuk Baklava", kodu: "UR035" }, { ad: "Tuzlu Antep Fıstığı", kodu: "UR036" }, { ad: "Yazılı Karışık Tepsi", kodu: "UR037" }, { ad: "Yılbaşı Tepsisi", kodu: "UR038" }], skipDuplicates: true });
    const fiyatlarData = [{ urunId: 1, fiyat: 1212.50, birim: "KG", gecerliTarih: new Date("2023-11-21"), bitisTarihi: null }, /* ... diğer fiyatlar ... */]; // Örnek, kendi fiyatlarınızı ekleyin
    await prisma.fiyat.createMany({ data: fiyatlarData, skipDuplicates: true });
    console.log('Lookup tables, products, and prices seeded.');

    // --- DUMMY SİPARİŞ OLUŞTURMA (20 Adet) ---
    console.log('Creating 20 dummy orders...');
    try {
      // Gerekli ID'leri ve verileri topluca çekelim
      const teslimatTurleri = await prisma.teslimatTuru.findMany({ select: { id: true } });
      const subeler = await prisma.sube.findMany({ select: { id: true } });
      const gonderenTipleri = await prisma.gonderenAliciTipi.findMany({ select: { id: true } });
      const ambalajlar = await prisma.ambalaj.findMany({ select: { id: true, ad: true } });
      const urunler = await prisma.urun.findMany({ select: { id: true } }); // Sadece ID'ler yeterli
      const kutular = await prisma.kutu.findMany({ select: { id: true } });
      const tepsiler = await prisma.tepsiTava.findMany({ select: { id: true, fiyat: true } });

      // Gerekli veri yoksa hata ver
      if (!teslimatTurleri.length || !urunler.length || !ambalajlar.length) {
        console.error("!!! Temel lookup verileri (TeslimatTuru, Urun, Ambalaj) bulunamadı. Seed işlemi durduruldu.");
        return;
      }

      const ambalajKutu = ambalajlar.find(a => a.ad === 'Kutu');
      const ambalajTepsi = ambalajlar.find(a => a.ad === 'Tepsi/Tava');
      const ambalajOzel = ambalajlar.find(a => a.ad === 'Özel');

      const musteriler = [ /* ... (Önceki cevaptaki müşteri listesi) ... */
        { gAd: 'Ali Veli', gTel: '5551110011', aAd: 'Ayşe Yılmaz', aTel: '5551110012' }, { gAd: 'Mehmet Demir', gTel: '5552220022' },
        { gAd: 'Fatma Kaya', gTel: '5553330033', aAd: 'Can Öztürk', aTel: '5553330034' }, { gAd: 'Zeynep Şahin', gTel: '5554440044' },
        { gAd: 'Mustafa Arslan', gTel: '5555550055', aAd: 'Elif Doğan', aTel: '5555550056' }, { gAd: 'Emine Yıldız', gTel: '5556660066' },
        { gAd: 'Hüseyin Çelik', gTel: '5557770077', aAd: 'Hatice Aksoy', aTel: '5557770078' }, { gAd: 'Hasan Aydın', gTel: '5558880088' },
        { gAd: 'Ayşe Güneş', gTel: '5559990099', aAd: 'Ahmet Kurt', aTel: '5559990090' }, { gAd: 'Murat Polat', gTel: '5551010011' },
        { gAd: 'Sultan Özdemir', gTel: '5551210022', aAd: 'İsmail Can', aTel: '5551210023' }, { gAd: 'Yusuf Korkmaz', gTel: '5551310033' },
        { gAd: 'Meryem Aslan', gTel: '5551410044', aAd: 'Osman Şimşek', aTel: '5551410045' }, { gAd: 'Ömer Koç', gTel: '5551510055' },
        { gAd: 'Rabia Tekin', gTel: '5551610066', aAd: 'Adem Yıldırım', aTel: '5551610067' },
      ];

      for (let i = 0; i < 20; i++) { // 20 sipariş oluştur
        const musteri = musteriler[i % musteriler.length];
        const siparisTarihi = getRandomDate(); // Rastgele tarih (son 30 gün)
        const onayDurumu = Math.random() < 0.7; // %70 onaylı
        const hazirlanma = onayDurumu ? (Math.random() < 0.4 ? "Hazırlandı" : "Bekliyor") : "Bekliyor"; // Onaylıların %40'ı hazırlandı
        const kalemSayisi = getRandomInt(2, 8); // 2 ile 8 arası kalem

        const paketTipiRandom = Math.random();
        const paketTipi = paketTipiRandom < 0.5 && ambalajKutu ? ambalajKutu : (paketTipiRandom < 0.85 && ambalajTepsi ? ambalajTepsi : ambalajOzel);
        const seciliKutuId = paketTipi.id === ambalajKutu?.id && kutular.length > 0 ? kutular[getRandomInt(0, kutular.length - 1)].id : null;
        const seciliTepsi = paketTipi.id === ambalajTepsi?.id && tepsiler.length > 0 ? tepsiler[getRandomInt(0, tepsiler.length - 1)] : null;
        const seciliTepsiId = seciliTepsi?.id || null;
        const tepsiMaliyeti = seciliTepsi?.fiyat || 0;

        const kalemlerDataPromises = [];
        const kullanilanUrunler = new Set();

        for (let j = 0; j < kalemSayisi; j++) {
          let rastgeleUrun;
          let denemeSayisi = 0; // Sonsuz döngüden kaçınma
          do {
            rastgeleUrun = urunler[getRandomInt(0, urunler.length - 1)];
            denemeSayisi++;
          } while (kullanilanUrunler.has(rastgeleUrun.id) && denemeSayisi < urunler.length * 2); // Eğer tüm ürünler kullanıldıysa döngüden çık

          if (kullanilanUrunler.has(rastgeleUrun.id)) continue; // Ekleyecek farklı ürün kalmadıysa atla
          kullanilanUrunler.add(rastgeleUrun.id);

          const birim = Math.random() < 0.3 ? "Adet" : "Gram";
          const miktar = birim === "Adet" ? getRandomInt(1, 15) : getRandomInt(100, 2500);

          // Fiyatı bulmak için promise oluştur (doğrudan prisma kullanılıyor)
          kalemlerDataPromises.push(
            getPriceForDate(rastgeleUrun.id, birim === "Gram" ? "KG" : "Adet", siparisTarihi)
              .then(birimFiyat => ({
                ambalajId: paketTipi.id,
                urunId: rastgeleUrun.id,
                miktar: miktar,
                birim: birim,
                birimFiyat: birimFiyat,
                kutuId: seciliKutuId,
                tepsiTavaId: seciliTepsiId,
              }))
          );
        }

        const kalemlerData = await Promise.all(kalemlerDataPromises);
        const gecerliKalemler = kalemlerData.filter(k => k !== null && k.urunId !== undefined); // Geçerli kalemleri al

        if (gecerliKalemler.length > 0) {
          await prisma.siparis.create({
            data: {
              tarih: siparisTarihi,
              teslimatTuruId: teslimatTurleri[getRandomInt(0, teslimatTurleri.length - 1)].id,
              subeId: Math.random() < 0.2 && subeler.length > 0 ? subeler[getRandomInt(0, subeler.length - 1)].id : null,
              gonderenTipiId: musteri.aAd && gonderenTipleri.length > 0 ? gonderenTipleri[0].id : null,
              gonderenAdi: musteri.gAd,
              gonderenTel: musteri.gTel,
              aliciAdi: musteri.aAd || null,
              aliciTel: musteri.aTel || null,
              adres: Math.random() < 0.4 ? `Dummy Adres ${i + 1} Cad. No: ${i + 10}` : null,
              aciklama: Math.random() < 0.3 ? `Dummy Açıklama ${i + 1} - Test Notu` : null,
              gorunecekAd: musteri.aAd || musteri.gAd,
              onaylandiMi: onayDurumu,
              hazirlanmaDurumu: hazirlanma,
              toplamTepsiMaliyeti: tepsiMaliyeti,
              kargoUcreti: Math.random() < 0.1 ? parseFloat((Math.random() * 50 + 50).toFixed(2)) : 0,
              digerHizmetTutari: Math.random() < 0.05 ? parseFloat((Math.random() * 30 + 20).toFixed(2)) : 0,
              kalemler: {
                createMany: { data: gecerliKalemler }
              }
            }
          });
          console.log(`Dummy Order ${i + 1} created.`);
        } else {
          console.warn(`Skipping Dummy Order ${i + 1} due to no valid items.`);
        }
      } // 20 sipariş döngüsü sonu

    } catch (error) {
      console.error('Creating dummy orders failed:', error);
    }
    console.log('Dummy order creation section finished.');

    // --- STOCK MANAGEMENT SEED ---
    await seedStockManagement(prisma);

    // --- REÇETE SEED ---
    await seedReceteler(prisma);

    await seedUrunlerVeFiyatlar(prisma);

    await seedCarilerFromCSV(prisma);

    await seedOrnekAdresler(prisma);

    await importCarilerFromCSV();

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
