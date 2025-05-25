// pages/api/fiyatlar.js
// Tüm fiyat kayıtlarını getirir (ürün bilgisiyle birlikte)

import prisma from '../../lib/prisma'; // Prisma Client import yolu (kendi yapınıza göre düzeltin)
import { Prisma } from '@prisma/client';

export default async function handler(req, res) {
  // CORS ve OPTIONS Handling
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS'); // Bu endpoint sadece GET ve OPTIONS destekler
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sadece GET isteklerini işle
  if (req.method === 'GET') {
    try {
      // 1. Get the latest gecerliTarih for each (urunId, birim)
      const latestPrices = await prisma.fiyat.groupBy({
        by: ['urunId', 'birim'],
        _max: { gecerliTarih: true }
      });

      // 2. Fetch the full price record for each group
      const fiyatlar = await Promise.all(
        latestPrices.map(async (item) => {
          return prisma.fiyat.findFirst({
            where: {
              urunId: item.urunId,
              birim: item.birim,
              gecerliTarih: item._max.gecerliTarih
            },
            include: {
              urun: {
                select: {
                  id: true,
                  ad: true,
                  kodu: true
                }
              }
            }
          });
        })
      );

      return res.status(200).json(fiyatlar.filter(Boolean));
    } catch (error) {
      console.error('❌ GET /api/fiyatlar HATA:', error);
      return res.status(500).json({ message: 'Fiyatlar listelenirken hata oluştu.', error: error.message });
    }
  }

  // YENİ: Fiyat ekleme (POST)
  if (req.method === 'POST') {
    try {
      const { urunId, birim, fiyat, gecerliTarih, bitisTarihi } = req.body;
      if (!urunId || !birim || typeof fiyat !== 'number' || !gecerliTarih) {
        return res.status(400).json({ message: 'urunId, birim, fiyat (number), gecerliTarih zorunludur.' });
      }
      const created = await prisma.fiyat.create({
        data: {
          urunId: parseInt(urunId),
          birim,
          fiyat,
          gecerliTarih: new Date(gecerliTarih),
          bitisTarihi: bitisTarihi ? new Date(bitisTarihi) : null
        },
        include: {
          urun: {
            select: { id: true, ad: true, kodu: true }
          }
        }
      });
      return res.status(201).json(created);
    } catch (error) {
      console.error('❌ POST /api/fiyatlar HATA:', error);
      return res.status(500).json({ message: 'Fiyat eklenirken hata oluştu.', error: error.message });
    }
  }

  // YENİ: Tüm fiyat geçmişini getir (opsiyonel urunId ve birim ile)
  if (req.method === 'GET' && req.query.all === 'true') {
    try {
      const where = {};
      if (req.query.urunId) where.urunId = parseInt(req.query.urunId);
      if (req.query.birim) where.birim = req.query.birim;
      const fiyatlar = await prisma.fiyat.findMany({
        where,
        include: { urun: { select: { id: true, ad: true, kodu: true } } },
        orderBy: { gecerliTarih: 'desc' }
      });
      return res.status(200).json(fiyatlar);
    } catch (error) {
      console.error('❌ GET /api/fiyatlar?all=true HATA:', error);
      return res.status(500).json({ message: 'Fiyat geçmişi listelenirken hata oluştu.', error: error.message });
    }
  }

  // GET /api/fiyatlar/active?urunId=...&birim=...&date=...
  if (req.method === 'GET' && req.query.active === 'true') {
    try {
      const { urunId, birim, date } = req.query;
      if (!urunId || !birim || !date) {
        return res.status(400).json({ message: 'urunId, birim ve date zorunludur.' });
      }
      const targetDate = new Date(date);
      const fiyat = await prisma.fiyat.findFirst({
        where: {
          urunId: parseInt(urunId),
          birim,
          gecerliTarih: { lte: targetDate },
          OR: [
            { bitisTarihi: null },
            { bitisTarihi: { gt: targetDate } }
          ]
        },
        orderBy: { gecerliTarih: 'desc' }
      });
      if (!fiyat) return res.status(404).json({ message: 'Belirtilen tarihte geçerli fiyat bulunamadı.' });
      return res.status(200).json(fiyat);
    } catch (error) {
      return res.status(500).json({ message: 'Aktif fiyat sorgulanırken hata oluştu.', error: error.message });
    }
  }

  // Desteklenmeyen metot
  console.log(`Desteklenmeyen metot: ${req.method} for /api/fiyatlar`);
  res.setHeader('Allow', ['GET', 'OPTIONS']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
