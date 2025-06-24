// pages/api/fiyatlar/index.js
// Gelişmiş Fiyat Yönetimi API'si

import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
    // CORS ayarları
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (req.method) {
            case 'GET':
                return await getFiyatlar(req, res);
            case 'POST':
                return await createFiyat(req, res);
            case 'PUT':
                return await updateFiyat(req, res);
            case 'DELETE':
                return await deleteFiyat(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error('❌ Fiyat API Hatası:', error);
        return res.status(500).json({
            error: 'Sunucu hatası oluştu',
            details: error.message
        });
    }
}

// Fiyatları listele
async function getFiyatlar(req, res) {
    const {
        page = 1,
        limit = 20,
        urunId = '',
        fiyatTipi = '',
        aktif = '',
        search = '',
        sortBy = 'gecerliTarih',
        sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    try {
        const where = {};

        // Ürün filtresi
        if (urunId) {
            where.urunId = parseInt(urunId);
        }

        // Fiyat tipi filtresi
        if (fiyatTipi) {
            where.fiyatTipi = fiyatTipi;
        }

        // Aktif filtresi
        if (aktif !== '') {
            where.aktif = aktif === 'true';
        }

        // Arama filtresi (ürün adında arama)
        if (search) {
            where.urun = {
                OR: [
                    { ad: { contains: search, mode: 'insensitive' } },
                    { kodu: { contains: search, mode: 'insensitive' } }
                ]
            };
        }

        // Sıralama
        const orderBy = {};
        orderBy[sortBy] = sortOrder;

        // Toplam sayı
        const total = await prisma.fiyat.count({ where });

        // Fiyatlar
        const fiyatlar = await prisma.fiyat.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                urun: {
                    select: {
                        id: true,
                        ad: true,
                        kodu: true,
                        kategori: {
                            select: {
                                ad: true,
                                renk: true
                            }
                        }
                    }
                }
            }
        });

        return res.status(200).json({
            fiyatlar,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ Fiyat listesi hatası:', error);
        return res.status(500).json({ error: 'Fiyatlar listelenirken hata oluştu' });
    }
}

// Yeni fiyat oluştur
async function createFiyat(req, res) {
    const {
        urunId,
        fiyat,
        birim = 'KG',
        fiyatTipi = 'normal',
        minMiktar,
        maxMiktar,
        iskonto = 0,
        vergiOrani = 18,
        gecerliTarih,
        bitisTarihi,
        aktif = true,
        createdBy
    } = req.body;

    // Zorunlu alanları kontrol et
    if (!urunId || !fiyat || !gecerliTarih) {
        return res.status(400).json({
            error: 'Ürün, fiyat ve geçerlilik tarihi zorunludur'
        });
    }

    try {
        // Transaction başlat
        const result = await prisma.$transaction(async (tx) => {
            // Aynı tarih aralığında çakışan fiyat var mı kontrol et
            const cakisanFiyat = await tx.fiyat.findFirst({
                where: {
                    urunId: parseInt(urunId),
                    birim,
                    fiyatTipi,
                    aktif: true,
                    AND: [
                        {
                            OR: [
                                { bitisTarihi: null },
                                { bitisTarihi: { gte: new Date(gecerliTarih) } }
                            ]
                        },
                        {
                            gecerliTarih: {
                                lte: bitisTarihi ? new Date(bitisTarihi) : new Date('2099-12-31')
                            }
                        }
                    ]
                }
            });

            if (cakisanFiyat) {
                throw new Error('Bu tarih aralığında zaten aktif bir fiyat bulunmaktadır');
            }

            // Yeni fiyat eklendiğinde, aynı ürün ve birim için eski aktif fiyatları pasife al
            await tx.fiyat.updateMany({
                where: {
                    urunId: parseInt(urunId),
                    birim,
                    fiyatTipi,
                    aktif: true,
                    // Yeni fiyatın geçerlilik tarihinden önce başlayan ve bitiş tarihi olmayan veya yeni fiyatın geçerlilik tarihinden sonra biten fiyatlar
                    OR: [
                        {
                            gecerliTarih: { lt: new Date(gecerliTarih) },
                            OR: [
                                { bitisTarihi: null },
                                { bitisTarihi: { gte: new Date(gecerliTarih) } }
                            ]
                        }
                    ]
                },
                data: {
                    aktif: false,
                    bitisTarihi: new Date(gecerliTarih) // Eski fiyatın bitiş tarihini yeni fiyatın başlangıç tarihi yap
                }
            });

            // Yeni fiyatı oluştur
            const yeniFiyat = await tx.fiyat.create({
                data: {
                    urunId: parseInt(urunId),
                    fiyat: parseFloat(fiyat),
                    birim,
                    fiyatTipi,
                    minMiktar: minMiktar ? parseFloat(minMiktar) : null,
                    maxMiktar: maxMiktar ? parseFloat(maxMiktar) : null,
                    iskonto: parseFloat(iskonto),
                    vergiOrani: parseFloat(vergiOrani),
                    gecerliTarih: new Date(gecerliTarih),
                    bitisTarihi: bitisTarihi ? new Date(bitisTarihi) : null,
                    aktif,
                    createdBy: createdBy ? parseInt(createdBy) : null
                },
                include: {
                    urun: {
                        select: {
                            ad: true,
                            kodu: true
                        }
                    }
                }
            });

            return yeniFiyat;
        });

        return res.status(201).json({
            message: 'Fiyat başarıyla oluşturuldu ve eski fiyatlar pasife alındı',
            fiyat: result
        });

    } catch (error) {
        console.error('❌ Fiyat oluşturma hatası:', error);

        if (error.message.includes('aktif bir fiyat bulunmaktadır')) {
            return res.status(400).json({
                error: error.message
            });
        }

        return res.status(500).json({
            error: 'Fiyat oluşturulurken hata oluştu',
            details: error.message
        });
    }
}

// Fiyat güncelle
async function updateFiyat(req, res) {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Fiyat ID gerekli' });
    }

    try {
        // Önce mevcut fiyatı al
        const mevcutFiyat = await prisma.fiyat.findUnique({
            where: { id: parseInt(id) },
            include: {
                urun: {
                    select: {
                        ad: true,
                        kodu: true
                    }
                }
            }
        });

        if (!mevcutFiyat) {
            return res.status(404).json({ error: 'Fiyat bulunamadı' });
        }

        // Sayısal alanları dönüştür
        const processedData = { ...updateData };

        if (processedData.urunId) {
            processedData.urunId = parseInt(processedData.urunId);
        }
        if (processedData.fiyat) {
            processedData.fiyat = parseFloat(processedData.fiyat);
        }
        if (processedData.minMiktar) {
            processedData.minMiktar = parseFloat(processedData.minMiktar);
        }
        if (processedData.maxMiktar) {
            processedData.maxMiktar = parseFloat(processedData.maxMiktar);
        }
        if (processedData.iskonto !== undefined) {
            processedData.iskonto = parseFloat(processedData.iskonto);
        }
        if (processedData.vergiOrani) {
            processedData.vergiOrani = parseFloat(processedData.vergiOrani);
        }
        if (processedData.gecerliTarih) {
            processedData.gecerliTarih = new Date(processedData.gecerliTarih);
        }
        if (processedData.bitisTarihi) {
            processedData.bitisTarihi = new Date(processedData.bitisTarihi);
        }
        if (processedData.createdBy) {
            processedData.createdBy = parseInt(processedData.createdBy);
        }

        // Transaction ile güncelleme
        const result = await prisma.$transaction(async (tx) => {
            // Eğer geçerlilik tarihi değişiyorsa, çakışma kontrolü yap
            if (processedData.gecerliTarih &&
                processedData.gecerliTarih.getTime() !== mevcutFiyat.gecerliTarih.getTime()) {

                // Çakışan fiyat kontrolü (kendisi hariç)
                const cakisanFiyat = await tx.fiyat.findFirst({
                    where: {
                        id: { not: parseInt(id) },
                        urunId: processedData.urunId || mevcutFiyat.urunId,
                        birim: processedData.birim || mevcutFiyat.birim,
                        fiyatTipi: processedData.fiyatTipi || mevcutFiyat.fiyatTipi,
                        aktif: true,
                        AND: [
                            {
                                OR: [
                                    { bitisTarihi: null },
                                    { bitisTarihi: { gte: processedData.gecerliTarih } }
                                ]
                            },
                            {
                                gecerliTarih: {
                                    lte: processedData.bitisTarihi ? processedData.bitisTarihi : new Date('2099-12-31')
                                }
                            }
                        ]
                    }
                });

                if (cakisanFiyat) {
                    throw new Error('Bu tarih aralığında zaten aktif bir fiyat bulunmaktadır');
                }

                // Eski aktif fiyatları pasife al (kendisi hariç)
                await tx.fiyat.updateMany({
                    where: {
                        id: { not: parseInt(id) },
                        urunId: processedData.urunId || mevcutFiyat.urunId,
                        birim: processedData.birim || mevcutFiyat.birim,
                        fiyatTipi: processedData.fiyatTipi || mevcutFiyat.fiyatTipi,
                        aktif: true,
                        OR: [
                            {
                                gecerliTarih: { lt: processedData.gecerliTarih },
                                OR: [
                                    { bitisTarihi: null },
                                    { bitisTarihi: { gte: processedData.gecerliTarih } }
                                ]
                            }
                        ]
                    },
                    data: {
                        aktif: false,
                        bitisTarihi: processedData.gecerliTarih
                    }
                });
            }

            // Fiyatı güncelle
            const guncellenenFiyat = await tx.fiyat.update({
                where: { id: parseInt(id) },
                data: processedData,
                include: {
                    urun: {
                        select: {
                            ad: true,
                            kodu: true
                        }
                    }
                }
            });

            return guncellenenFiyat;
        });

        return res.status(200).json({
            message: 'Fiyat başarıyla güncellendi',
            fiyat: result
        });

    } catch (error) {
        console.error('❌ Fiyat güncelleme hatası:', error);

        if (error.message.includes('aktif bir fiyat bulunmaktadır')) {
            return res.status(400).json({
                error: error.message
            });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Fiyat bulunamadı' });
        }

        return res.status(500).json({
            error: 'Fiyat güncellenirken hata oluştu',
            details: error.message
        });
    }
}

// Fiyat sil
async function deleteFiyat(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Fiyat ID gerekli' });
    }

    try {
        await prisma.fiyat.delete({
            where: { id: parseInt(id) }
        });

        return res.status(200).json({
            message: 'Fiyat başarıyla silindi'
        });

    } catch (error) {
        console.error('❌ Fiyat silme hatası:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Fiyat bulunamadı' });
        }

        return res.status(500).json({ error: 'Fiyat silinirken hata oluştu' });
    }
} 