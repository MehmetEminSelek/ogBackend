// pages/api/cleanup-ambalaj.js
// Ambalaj temizleme ve yönetim API'si

import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // İzin verilen ambalaj türleri
    const IZINLI_AMBALAJLAR = ['Kutu', 'Tepsi/Tava', 'Özel'];

    if (req.method === 'GET') {
        // Ambalaj kullanım analizi
        try {
            const ambalajAnaliz = await prisma.ambalaj.findMany({
                include: {
                    siparisKalemleri: {
                        select: {
                            id: true,
                            siparis: {
                                select: {
                                    id: true,
                                    tarih: true,
                                    gonderenAdi: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            siparisKalemleri: true
                        }
                    }
                },
                orderBy: { ad: 'asc' }
            });

            const analiz = ambalajAnaliz.map(ambalaj => ({
                id: ambalaj.id,
                ad: ambalaj.ad,
                kodu: ambalaj.kodu,
                kullanımSayisi: ambalaj._count.siparisKalemleri,
                izinliAmbalaj: IZINLI_AMBALAJLAR.includes(ambalaj.ad),
                silinecek: !IZINLI_AMBALAJLAR.includes(ambalaj.ad),
                silinebilir: ambalaj._count.siparisKalemleri === 0,
                sonKullanim: ambalaj.siparisKalemleri.length > 0
                    ? ambalaj.siparisKalemleri[ambalaj.siparisKalemleri.length - 1]?.siparis?.tarih
                    : null,
                kullananSiparisler: ambalaj.siparisKalemleri.slice(0, 5) // İlk 5 sipariş
            }));

            // Kategorilere ayır
            const izinliAmbalajlar = analiz.filter(a => a.izinliAmbalaj);
            const silinecekAmbalajlar = analiz.filter(a => a.silinecek);
            const silinecekAmaKullanimda = silinecekAmbalajlar.filter(a => !a.silinebilir);

            return res.status(200).json({
                ambalajlar: analiz,
                ozet: {
                    toplam: analiz.length,
                    izinli: izinliAmbalajlar.length,
                    silinecek: silinecekAmbalajlar.length,
                    silinecekAmaKullanimda: silinecekAmaKullanimda.length,
                    guvenliSilinebilir: silinecekAmbalajlar.filter(a => a.silinebilir).length
                },
                kategoriler: {
                    izinliAmbalajlar,
                    silinecekAmbalajlar,
                    silinecekAmaKullanimda
                }
            });

        } catch (error) {
            console.error('❌ Ambalaj analizi hatası:', error);
            return res.status(500).json({ error: 'Analiz yapılırken hata oluştu' });
        }
    }

    if (req.method === 'DELETE') {
        const { action } = req.body;

        try {
            if (action === 'CLEANUP_UNAUTHORIZED_AMBALAJ') {
                // İzinsiz ambalajları ve bunları kullanan siparişleri sil

                // 1. İzinsiz ambalajları bul
                const izinsizAmbalajlar = await prisma.ambalaj.findMany({
                    where: {
                        ad: {
                            notIn: IZINLI_AMBALAJLAR
                        }
                    },
                    include: {
                        siparisKalemleri: {
                            select: {
                                siparisId: true
                            }
                        }
                    }
                });

                if (izinsizAmbalajlar.length === 0) {
                    return res.status(200).json({
                        message: 'Silinecek izinsiz ambalaj bulunamadı',
                        silinenAmbalaj: 0,
                        silinenSiparis: 0
                    });
                }

                // 2. Bu ambalajları kullanan siparişlerin ID'lerini topla
                const silinecekSiparisIds = new Set();
                izinsizAmbalajlar.forEach(ambalaj => {
                    ambalaj.siparisKalemleri.forEach(kalem => {
                        silinecekSiparisIds.add(kalem.siparisId);
                    });
                });

                const siparisIdsArray = Array.from(silinecekSiparisIds);

                // 3. Önce siparişleri sil (cascade ile kalemler de silinir)
                if (siparisIdsArray.length > 0) {
                    await prisma.siparis.deleteMany({
                        where: {
                            id: { in: siparisIdsArray }
                        }
                    });
                    console.log(`✅ ${siparisIdsArray.length} sipariş silindi`);
                }

                // 4. Sonra izinsiz ambalajları sil
                const silinenAmbalajlar = await prisma.ambalaj.deleteMany({
                    where: {
                        ad: {
                            notIn: IZINLI_AMBALAJLAR
                        }
                    }
                });

                console.log(`✅ ${silinenAmbalajlar.count} izinsiz ambalaj silindi`);

                return res.status(200).json({
                    message: 'İzinsiz ambalajlar ve ilgili siparişler başarıyla silindi',
                    silinenSiparis: siparisIdsArray.length,
                    silinenAmbalaj: silinenAmbalajlar.count,
                    silinenAmbalajlar: izinsizAmbalajlar.map(a => a.ad),
                    korunanAmbalajlar: IZINLI_AMBALAJLAR
                });
            }

            if (action === 'DELETE_SAFE_UNAUTHORIZED') {
                // Sadece kullanılmayan izinsiz ambalajları sil
                const kullanilmayanIzinsizAmbalajlar = await prisma.ambalaj.findMany({
                    where: {
                        AND: [
                            {
                                ad: {
                                    notIn: IZINLI_AMBALAJLAR
                                }
                            },
                            {
                                siparisKalemleri: {
                                    none: {}
                                }
                            }
                        ]
                    }
                });

                if (kullanilmayanIzinsizAmbalajlar.length === 0) {
                    return res.status(200).json({
                        message: 'Güvenli silinebilir izinsiz ambalaj bulunamadı',
                        silinenAmbalaj: 0
                    });
                }

                await prisma.ambalaj.deleteMany({
                    where: {
                        id: { in: kullanilmayanIzinsizAmbalajlar.map(a => a.id) }
                    }
                });

                return res.status(200).json({
                    message: 'Kullanılmayan izinsiz ambalajlar silindi',
                    silinenAmbalaj: kullanilmayanIzinsizAmbalajlar.length,
                    silinenler: kullanilmayanIzinsizAmbalajlar.map(a => a.ad),
                    korunanAmbalajlar: IZINLI_AMBALAJLAR
                });
            }

            return res.status(400).json({ error: 'Geçersiz action' });

        } catch (error) {
            console.error('❌ Silme işlemi hatası:', error);
            return res.status(500).json({
                error: 'Silme işlemi sırasında hata oluştu',
                details: error.message
            });
        }
    }

    if (req.method === 'POST') {
        const { action } = req.body;

        try {
            if (action === 'ENSURE_REQUIRED_AMBALAJ') {
                // Gerekli ambalajların var olduğundan emin ol
                const mevcutAmbalajlar = await prisma.ambalaj.findMany({
                    where: {
                        ad: { in: IZINLI_AMBALAJLAR }
                    }
                });

                const mevcutAdlar = mevcutAmbalajlar.map(a => a.ad);
                const eksikAmbalajlar = IZINLI_AMBALAJLAR.filter(ad => !mevcutAdlar.includes(ad));

                if (eksikAmbalajlar.length > 0) {
                    const yeniAmbalajlar = await Promise.all(
                        eksikAmbalajlar.map(ad =>
                            prisma.ambalaj.create({
                                data: {
                                    ad,
                                    kodu: ad === 'Kutu' ? 'AMB01' :
                                        ad === 'Tepsi/Tava' ? 'AMB02' : 'AMB03'
                                }
                            })
                        )
                    );

                    return res.status(201).json({
                        message: 'Eksik ambalajlar eklendi',
                        eklenenAmbalajlar: yeniAmbalajlar.map(a => a.ad),
                        mevcutAmbalajlar: mevcutAdlar
                    });
                } else {
                    return res.status(200).json({
                        message: 'Tüm gerekli ambalajlar mevcut',
                        mevcutAmbalajlar: mevcutAdlar
                    });
                }
            }

            return res.status(400).json({ error: 'Geçersiz action' });

        } catch (error) {
            console.error('❌ Ambalaj ekleme hatası:', error);
            return res.status(500).json({
                error: 'Ambalaj işlemi sırasında hata oluştu',
                details: error.message
            });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
} 