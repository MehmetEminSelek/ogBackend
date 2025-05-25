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
        // Aynı tarih aralığında çakışan fiyat var mı kontrol et
        const cakisanFiyat = await prisma.fiyat.findFirst({
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
            return res.status(400).json({
                error: 'Bu tarih aralığında zaten aktif bir fiyat bulunmaktadır'
            });
        }

        const yeniFiyat = await prisma.fiyat.create({
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

        return res.status(201).json({
            message: 'Fiyat başarıyla oluşturuldu',
            fiyat: yeniFiyat
        });

    } catch (error) {
        console.error('❌ Fiyat oluşturma hatası:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                error: 'Bu ürün için aynı birim ve tarihte zaten fiyat bulunmaktadır'
            });
        }

        return res.status(500).json({ error: 'Fiyat oluşturulurken hata oluştu' });
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

        const guncellenenFiyat = await prisma.fiyat.update({
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

        return res.status(200).json({
            message: 'Fiyat başarıyla güncellendi',
            fiyat: guncellenenFiyat
        });

    } catch (error) {
        console.error('❌ Fiyat güncelleme hatası:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                error: 'Bu ürün için aynı birim ve tarihte zaten fiyat bulunmaktadır'
            });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Fiyat bulunamadı' });
        }

        return res.status(500).json({ error: 'Fiyat güncellenirken hata oluştu' });
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