
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.teslimatTuru.createMany({
    data: [
      { ad: "Evine Gönderilecek", kodu: "TT001" },
      { ad: "Kendisi Alacak", kodu: "TT002" },
      { ad: "Mtn", kodu: "TT003" },
      { ad: "Otobüs", kodu: "TT004" },
      { ad: "Şubeden Teslim", kodu: "TT005" },
      { ad: "Yurtiçi Kargo", kodu: "TT006" }
    ],
    skipDuplicates: true
  })

  await prisma.sube.createMany({
    data: [
      { ad: "Hava-1", kodu: "SB001" },
      { ad: "Hava-3", kodu: "SB002" },
      { ad: "Hitit", kodu: "SB003" },
      { ad: "İbrahimli", kodu: "SB004" },
      { ad: "Karagöz", kodu: "SB005" },
      { ad: "Otogar", kodu: "SB006" }
    ],
    skipDuplicates: true
  })

  await prisma.gonderenAliciTipi.createMany({
    data: [
      { ad: "Gönderen ve Alıcı", kodu: "GA001" },
      { ad: "Tek Gönderen", kodu: "GA002" }
    ],
    skipDuplicates: true
  })

  await prisma.ambalaj.createMany({
    data: [
      { ad: "Kutu", kodu: "AMB01" },
      { ad: "Tepsi/Tava", kodu: "AMB02" },
      { ad: "Özel", kodu: "AMB03" } // <<< EKLENDİ
    ],
    skipDuplicates: true
  })

  await prisma.tepsiTava.createMany({
    data: [
      { ad: "1 Li Tava", kodu: "TP001" },
      { ad: "1 Li Tepsi", kodu: "TP002" },
      { ad: "1,5 Lu Tava", kodu: "TP003" },
      { ad: "1,5 Lu Tepsi", kodu: "TP004" },
      { ad: "1000 Lik Tava", kodu: "TP005" },
      { ad: "2 Li Tava", kodu: "TP006" },
      { ad: "2 Li Tepsi", kodu: "TP007" },
      { ad: "2,5 Lu Tepsi", kodu: "TP008" },
      { ad: "3 Lü Tepsi", kodu: "TP009" },
      { ad: "4 Lü Tepsi", kodu: "TP010" },
      { ad: "5 Li Tepsi", kodu: "TP011" },
      { ad: "800 Lük Tava", kodu: "TP012" }
    ],
    skipDuplicates: true
  })

  await prisma.kutu.createMany({
    data: [
      { ad: "1 Kg Kare Kutusu", kodu: "KT001" },
      { ad: "1 Kg Kutu", kodu: "KT002" },
      { ad: "1 Kg POŞET TF", kodu: "KT003" },
      { ad: "1 Kg TAHTA TF Kutusu", kodu: "KT004" },
      { ad: "1 Kg TF Kutusu", kodu: "KT005" },
      { ad: "1,5 Kg Kutu", kodu: "KT006" },
      { ad: "250 gr Kutu", kodu: "KT007" },
      { ad: "500 gr Kare Kutusu", kodu: "KT008" },
      { ad: "500 gr Kutu", kodu: "KT009" },
      { ad: "500 gr POŞET TF", kodu: "KT010" },
      { ad: "500 gr TAHTA TF Kutusu", kodu: "KT011" },
      { ad: "500 gr TF Kutusu", kodu: "KT012" },
      { ad: "750 gr Kutu", kodu: "KT013" },
      { ad: "Tekli HD Kutusu", kodu: "KT014" },
      { ad: "Tekli Kare Kutusu", kodu: "KT015" }
    ],
    skipDuplicates: true
  })

  await prisma.urun.createMany({
    data: [
      { ad: "Antep Peynirli Su Böreği", kodu: "UR001" },
      { ad: "Bayram Tepsisi", kodu: "UR002" },
      { ad: "Cevizli Bülbül Yuvası", kodu: "UR003" },
      { ad: "Cevizli Eski Usûl Dolama", kodu: "UR004" },
      { ad: "Cevizli Özel Kare Baklava", kodu: "UR005" },
      { ad: "Cevizli Şöbiyet", kodu: "UR006" },
      { ad: "Cevizli Yaş Baklava", kodu: "UR007" },
      { ad: "Doğum Günü Tepsisi", kodu: "UR008" },
      { ad: "Düz Kadayıf", kodu: "UR009" },
      { ad: "Fındıklı Çikolatalı Midye Baklava", kodu: "UR010" },
      { ad: "Fıstık Ezmesi", kodu: "UR011" }
    ],
    skipDuplicates: true
  })
}

main()
  .then(() => console.log('Seed completed ✅'))
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
