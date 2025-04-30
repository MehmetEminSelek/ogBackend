// pages/api/dropdown.js
// Bu dosya SADECE dropdown seçeneklerini getirmek (GET) içindir.

import prisma from '../../lib/prisma'; // Prisma Client import yolunu kontrol et

export default async function handler(req, res) {
  // CORS ve OPTIONS Handling
  res.setHeader('Access-Control-Allow-Origin', '*'); // Production'da domain belirt
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Sadece GET ve OPTIONS
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('OPTIONS /api/dropdown isteği yanıtlandı.');
    return res.status(200).end();
  }

  // Sadece GET isteklerini işle
  if (req.method === 'GET') {
    console.log('GET /api/dropdown isteği alındı...');
    try {
      // Verileri paralel çek
      const [
        teslimatTurleri,
        subeler,
        aliciTipleri,
        ambalajlar,
        urunler,
        tepsiTavalar,
        kutular,
      ] = await Promise.all([
        prisma.teslimatTuru.findMany({ orderBy: { ad: 'asc' } }),
        prisma.sube.findMany({ orderBy: { ad: 'asc' } }),
        prisma.gonderenAliciTipi.findMany({ orderBy: { ad: 'asc' } }),
        prisma.ambalaj.findMany({ orderBy: { ad: 'asc' } }),
        prisma.urun.findMany({ orderBy: { ad: 'asc' } }),
        prisma.tepsiTava.findMany({ orderBy: { ad: 'asc' } }),
        prisma.kutu.findMany({ orderBy: { ad: 'asc' } }),
      ]);

      console.log('Veritabanından dropdown verileri başarıyla çekildi.');

      // Yanıtı formatla (ID ve Ad ile)
      const responseData = {
        teslimatTurleri: teslimatTurleri.map(item => ({ id: item.id, ad: item.ad })),
        subeler: subeler.map(item => ({ id: item.id, ad: item.ad })),
        aliciTipleri: aliciTipleri.map(item => ({ id: item.id, ad: item.ad })),
        ambalajlar: ambalajlar.map(item => ({ id: item.id, ad: item.ad })),
        urunler: urunler.map(item => ({ id: item.id, ad: item.ad })),
        tepsiTavalar: tepsiTavalar.map(item => ({ id: item.id, ad: item.ad })),
        kutular: kutular.map(item => ({ id: item.id, ad: item.ad })),
      };

      // Başarılı yanıtı gönder
      return res.status(200).json(responseData);

    } catch (error) { // try bloğunun catch'i
      console.error('❌ /api/dropdown HATA:', error);
      // Hata yanıtını gönder
      return res.status(500).json({
        message: 'Dropdown verileri alınırken bir sunucu hatası oluştu.',
        error: error.message,
      });
    } // catch bloğu bitti
  } // if (req.method === 'GET') bloğu bitti
  else { // GET veya OPTIONS değilse
    // Desteklenmeyen metot için 405 hatası
    console.log(`Desteklenmeyen metot: ${req.method} for /api/dropdown`);
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
} // handler fonksiyonu bitti
