// pages/api/prices.js
import prisma from '../../lib/prisma'; // Prisma Client import yolu

export default async function handler(req, res) {
  // CORS ve OPTIONS Handling (dropdown.js'deki gibi)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece GET isteklerini kabul et
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  // Query parametrelerini al (frontend'den gelen 'product' ve 'date')
  const { product: urunAdi, date: tarihStr } = req.query;

  // Parametreler eksikse hata döndür
  if (!urunAdi || !tarihStr) {
    return res.status(400).json({ message: 'Eksik parametre: product ve date gereklidir.' });
  }

  try {
    // Tarihi Date nesnesine çevir (saat bilgisini sıfırla)
    const gecerlilikTarihi = new Date(tarihStr);
    gecerlilikTarihi.setHours(0, 0, 0, 0); // Sadece tarih kısmı önemli

    // 1. Ürünü adına göre bul
    const urun = await prisma.urun.findUnique({
      where: { ad: urunAdi },
    });

    if (!urun) {
      return res.status(404).json({ message: `Ürün bulunamadı: ${urunAdi}` });
    }

    // 2. Ürünün ID'sini kullanarak, verilen tarihte veya öncesinde geçerli olan
    //    en son fiyatı bul
    const fiyatKaydi = await prisma.fiyat.findFirst({
      where: {
        urunId: urun.id,
        gecerliTarih: {
          lte: gecerlilikTarihi, // Geçerli tarihi, istenen tarihe eşit veya ondan küçük olanlar
        },
      },
      orderBy: {
        gecerliTarih: 'desc', // En yakın (en son) geçerli tarihi bulmak için ters sırala
      },
    });

    if (!fiyatKaydi) {
      // Belirtilen tarih için geçerli fiyat bulunamadı
      // Varsayılan olarak 0 dönebilir veya hata verebilirsiniz
      console.warn(`'${urunAdi}' için ${tarihStr} tarihinde geçerli fiyat bulunamadı.`);
      return res.status(200).json({ price: 0 }); // Fiyat yoksa 0 dön (frontend bunu bekliyor gibi)
      // veya return res.status(404).json({ message: 'Belirtilen tarih için fiyat bulunamadı.' });
    }

    // Fiyat bulundu, frontend'e gönder
    console.log(`Fiyat bulundu: ${fiyatKaydi.fiyat} (Geçerli Tarih: ${fiyatKaydi.gecerliTarih})`);
    return res.status(200).json({ price: fiyatKaydi.fiyat });

  } catch (error) {
    console.error('❌ /api/prices HATA:', error);
    return res.status(500).json({
      message: 'Fiyat alınırken bir sunucu hatası oluştu.',
      error: error.message,
    });
  }
}