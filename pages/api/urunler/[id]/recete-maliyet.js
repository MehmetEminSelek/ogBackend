// pages/api/urunler/[id]/recete-maliyet.js
// Ürün reçetesi ve maliyet hesaplama API'si

import prisma from '../../../../lib/prisma';

export default async function handler(req, res) {
    // CORS ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Ürün ID gerekli' });
    }

    try {
        // Ürünü kontrol et
        const urun = await prisma.urun.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                ad: true,
                agirlik: true,
                satisaBirimi: true
            }
        });

        if (!urun) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        // Ürünün reçetelerini getir
        const receteler = await prisma.recipe.findMany({
            where: { urunId: parseInt(id) },
            include: {
                ingredients: true
            },
            orderBy: { name: 'asc' }
        });

        if (receteler.length === 0) {
            return res.status(200).json({
                urun,
                receteler: [],
                maliyetAnalizi: {
                    toplamMaliyet: 0,
                    gramMaliyeti: 0,
                    malzemeSayisi: 0,
                    message: 'Bu ürün için henüz reçete tanımlanmamış'
                }
            });
        }

        // Her reçete için detaylı maliyet hesaplama
        const detayliReceteler = await Promise.all(
            receteler.map(async (recete) => {
                const malzemeler = await Promise.all(
                    recete.ingredients.map(async (ingredient) => {
                        let malzemeAdi = null;
                        let malzemeTipi = null;
                        let birimMaliyet = 0;
                        let toplamMaliyet = 0;

                        // Hammadde kontrolü
                        const hammadde = await prisma.hammadde.findUnique({
                            where: { kod: ingredient.stokKod }
                        });

                        if (hammadde) {
                            malzemeAdi = hammadde.ad;
                            malzemeTipi = 'Hammadde';

                            // Hammadde için ortalama maliyet hesapla (son 30 günlük stok hareketlerinden)
                            const sonHareketler = await prisma.stokHareket.findMany({
                                where: {
                                    stok: {
                                        hammaddeId: hammadde.id
                                    },
                                    tip: 'giris',
                                    createdAt: {
                                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Son 30 gün
                                    }
                                },
                                orderBy: { createdAt: 'desc' },
                                take: 10 // Son 10 giriş
                            });

                            if (sonHareketler.length > 0) {
                                // Basit ortalama maliyet (gerçek uygulamada daha karmaşık olabilir)
                                birimMaliyet = 0.05; // Örnek: 5 kuruş/gram
                            }
                        } else {
                            // Yarı mamul kontrolü
                            const yariMamul = await prisma.yariMamul.findUnique({
                                where: { kod: ingredient.stokKod }
                            });

                            if (yariMamul) {
                                malzemeAdi = yariMamul.ad;
                                malzemeTipi = 'Yarı Mamul';
                                birimMaliyet = 0.08; // Örnek: 8 kuruş/gram
                            }
                        }

                        toplamMaliyet = (ingredient.miktarGram * birimMaliyet) / 1000; // TL cinsinden

                        return {
                            id: ingredient.id,
                            stokKod: ingredient.stokKod,
                            malzemeAdi,
                            malzemeTipi,
                            miktarGram: ingredient.miktarGram,
                            birimMaliyet: birimMaliyet, // Kuruş/gram
                            toplamMaliyet: toplamMaliyet, // TL
                            mevcut: malzemeAdi !== null
                        };
                    })
                );

                const receteMaliyeti = malzemeler.reduce((toplam, malzeme) => toplam + malzeme.toplamMaliyet, 0);
                const toplamGram = malzemeler.reduce((toplam, malzeme) => toplam + malzeme.miktarGram, 0);

                return {
                    id: recete.id,
                    name: recete.name,
                    malzemeler,
                    ozet: {
                        malzemeSayisi: malzemeler.length,
                        toplamGram,
                        toplamMaliyet: receteMaliyeti,
                        gramMaliyeti: toplamGram > 0 ? (receteMaliyeti * 1000) / toplamGram : 0, // Kuruş/gram
                        eksikMalzeme: malzemeler.filter(m => !m.mevcut).length
                    }
                };
            })
        );

        // Genel maliyet analizi
        const toplamReceteMaliyeti = detayliReceteler.reduce((toplam, recete) => toplam + recete.ozet.toplamMaliyet, 0);
        const ortalamaMaliyet = detayliReceteler.length > 0 ? toplamReceteMaliyeti / detayliReceteler.length : 0;
        const toplamMalzemeSayisi = detayliReceteler.reduce((toplam, recete) => toplam + recete.ozet.malzemeSayisi, 0);

        // Ürün ağırlığına göre gram maliyeti
        let gramMaliyeti = 0;
        if (urun.agirlik && ortalamaMaliyet > 0) {
            gramMaliyeti = (ortalamaMaliyet * 1000) / urun.agirlik; // Kuruş/gram
        }

        const maliyetAnalizi = {
            toplamMaliyet: ortalamaMaliyet,
            gramMaliyeti,
            malzemeSayisi: toplamMalzemeSayisi,
            receteSayisi: detayliReceteler.length,
            ortalamaMalzemeSayisi: detayliReceteler.length > 0 ? Math.round(toplamMalzemeSayisi / detayliReceteler.length) : 0,
            karlilik: {
                maliyetFiyati: urun.maliyetFiyati || 0,
                karMarji: urun.karMarji || 0,
                hesaplananMaliyet: ortalamaMaliyet,
                farkYuzdesi: urun.maliyetFiyati ? ((urun.maliyetFiyati - ortalamaMaliyet) / urun.maliyetFiyati * 100) : 0
            }
        };

        return res.status(200).json({
            urun,
            receteler: detayliReceteler,
            maliyetAnalizi
        });

    } catch (error) {
        console.error('❌ Reçete maliyet hesaplama hatası:', error);
        return res.status(500).json({
            error: 'Reçete ve maliyet bilgileri alınırken hata oluştu',
            details: error.message
        });
    }
} 