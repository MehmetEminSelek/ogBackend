// pages/api/orders.js
import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    try {
      const { status, startDate, endDate } = req.query;
      console.log(`GET /api/orders isteği alındı. Parametreler:`, req.query);

      const whereClause = {};
      if (status === 'pending') { whereClause.onaylandiMi = false; }
      else if (status === 'approved') { whereClause.onaylandiMi = true; }

      if (startDate && endDate) {
        try {
          const start = new Date(startDate); start.setHours(0, 0, 0, 0);
          const end = new Date(endDate); end.setHours(23, 59, 59, 999);
          if (isNaN(start.getTime()) || isNaN(end.getTime())) { throw new Error('Geçersiz tarih formatı.'); }
          whereClause.tarih = { gte: start, lte: end };
        } catch (dateError) {
          console.error("Tarih aralığı hatası:", dateError);
          return res.status(400).json({ message: 'Geçersiz tarih formatı. YYYY-MM-DD kullanın.' });
        }
      }

      const siparisler = await prisma.siparis.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
          teslimatTuru: { select: { ad: true } },
          sube: { select: { ad: true } },
          gonderenAliciTipi: { select: { ad: true } },
          kalemler: {
            orderBy: { id: 'asc' },
            //birimFiyat alanı select'ten kaldırıldı
            select: {
              id: true,
              miktar: true,
              birim: true,
              birimFiyat: true, // <<< KALDIRILDI
              urun: { select: { id: true, ad: true } },
              ambalaj: { select: { id: true, ad: true } },
              kutu: { select: { id: true, ad: true } },
              tepsiTava: { select: { id: true, ad: true } }
            }
          }
        }
      });

      console.log(`${siparisler.length} adet sipariş bulundu.`);
      return res.status(200).json(siparisler);

    } catch (error) {
      console.error('❌ GET /api/orders HATA:', error);
      return res.status(500).json({ message: 'Siparişler listelenirken hata oluştu.', error: error.message });
    }
  }

  console.log(`Desteklenmeyen metot: ${req.method} for /api/orders`);
  res.setHeader('Allow', ['GET', 'OPTIONS']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
