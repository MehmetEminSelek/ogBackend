import prisma from '../../lib/prisma';
import { Prisma } from '@prisma/client';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') { return res.status(200).end(); }

    if (req.method === 'GET') {
        try {
            console.log('GET /api/hazirlanacak isteği alındı...');

            const siparisler = await prisma.siparis.findMany({
                where: {
                    onaylandiMi: true,
                    hazirlanmaDurumu: "Bekliyor"
                },
                orderBy: { tarih: 'asc' },
                include: {
                    cari: {
                        select: { ad: true, telefon: true }
                    },
                    teslimatTuru: { select: { ad: true } },
                    sube: { select: { ad: true } },
                    kalemler: {
                        orderBy: { id: 'asc' },
                        include: {
                            urun: {
                                select: {
                                    ad: true,
                                    kodu: true,
                                    maliyetFiyati: true,
                                    recipes: {
                                        include: {
                                            ingredients: true
                                        }
                                    }
                                }
                            },
                            ambalaj: { select: { ad: true } },
                            kutu: { select: { ad: true } },
                            tepsiTava: { select: { ad: true, fiyat: true } }
                        }
                    }
                }
            });

            console.log(`${siparisler.length} adet hazırlanacak sipariş bulundu.`);
            return res.status(200).json(siparisler);

        } catch (error) {
            console.error('❌ GET /api/hazirlanacak HATA:', error);
            return res.status(500).json({ message: 'Hazırlanacak siparişler listelenirken hata oluştu.', error: error.message });
        }
    }

    console.log(`Desteklenmeyen metot: ${req.method} for /api/hazirlanacak`);
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}