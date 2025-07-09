// pages/api/urunler/index.js
// Kapsamlı Ürün Yönetimi API'si

import prisma from '../../../lib/prisma';
import { withRBAC, PERMISSIONS } from '../../../lib/rbac';

async function handler(req, res) {

    try {
        switch (req.method) {
            case 'GET':
                return await getUrunler(req, res);
            case 'POST':
                return await createUrun(req, res);
            case 'PUT':
                return await updateUrun(req, res);
            case 'DELETE':
                return await deleteUrun(req, res);
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
        }
    } catch (error) {
        console.error('❌ Ürün API Hatası:', error);
        return res.status(500).json({
            error: 'Sunucu hatası oluştu',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}

// Ürünleri listele (gelişmiş filtreleme ve arama)
async function getUrunler(req, res) {
    const {
        page = 1,
        limit = 20,
        search = '',
        kategori = '',
        aktif = '',
        satisaUygun = '',
        ozelUrun = '',
        yeniUrun = '',
        indirimliUrun = '',
        sortBy = 'ad',
        sortOrder = 'asc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Filtreleme koşulları
    const where = {};

    // Arama
    if (search) {
        where.OR = [
            { ad: { contains: search, mode: 'insensitive' } },
            { kod: { contains: search, mode: 'insensitive' } },
            { aciklama: { contains: search, mode: 'insensitive' } },
            { stokKodu: { contains: search, mode: 'insensitive' } },
            { barkod: { contains: search, mode: 'insensitive' } }
        ];
    }

    // Kategori filtresi
    if (kategori) {
        where.kategoriId = parseInt(kategori);
    }

    // Boolean filtreler
    if (aktif !== '') {
        where.aktif = aktif === 'true';
    }
    if (satisaUygun !== '') {
        where.satisaUygun = satisaUygun === 'true';
    }
    if (ozelUrun !== '') {
        where.ozelUrun = ozelUrun === 'true';
    }
    if (yeniUrun !== '') {
        where.yeniUrun = yeniUrun === 'true';
    }
    if (indirimliUrun !== '') {
        where.indirimliUrun = indirimliUrun === 'true';
    }

    // Sıralama
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    try {
        // Toplam sayı
        const total = await prisma.urun.count({ where });

        // Ürünler
        const urunler = await prisma.urun.findMany({
            where,
            skip,
            take,
            orderBy,
            include: {
                kategori: {
                    select: {
                        id: true,
                        ad: true
                    }
                },
                fiyatlar: {
                    where: {
                        aktif: true,
                        OR: [
                            { bitisTarihi: null },
                            { bitisTarihi: { gte: new Date() } }
                        ]
                    },
                    orderBy: { gecerliTarih: 'desc' },
                    take: 1,
                    select: {
                        id: true,
                        fiyat: true,
                        birim: true,
                        fiyatTipi: true,
                        iskonto: true
                    }
                },
                _count: {
                    select: {
                        siparisKalemleri: true,
                        receteler: true
                    }
                }
            }
        });

        // Ürünleri formatla
        const formattedUrunler = urunler.map(urun => ({
            ...urun,
            guncelFiyat: urun.fiyatlar[0] || null,
            siparisAdedi: urun._count.siparisKalemleri,
            receteAdedi: urun._count.receteler
        }));

        return res.status(200).json({
            urunler: formattedUrunler,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error('❌ Ürün listesi hatası:', error);
        return res.status(500).json({
            error: 'Ürünler listelenirken hata oluştu',
            details: error.message
        });
    }
}

// Yeni ürün oluştur
async function createUrun(req, res) {
    const {
        ad,
        kodu,
        aciklama,
        kisaAciklama,
        kategoriId,
        anaGorsel,
        galeriGorseller = [],
        agirlik,
        boyutlar,
        renk,
        malzeme,
        mensei,
        stokKodu,
        barkod,
        minStokMiktari = 0,
        maxStokMiktari,
        kritikStokSeviye = 10,
        satisaBirimi = 'KG',
        minSatisMiktari = 1,
        maxSatisMiktari,
        aktif = true,
        satisaUygun = true,
        ozelUrun = false,
        yeniUrun = false,
        indirimliUrun = false,
        seoBaslik,
        seoAciklama,
        anahtarKelimeler = [],
        uretimSuresi,
        rafOmru,
        saklamaKosullari,
        maliyetFiyati,
        karMarji,
        createdBy
    } = req.body;

    // Zorunlu alanları kontrol et
    if (!ad) {
        return res.status(400).json({ error: 'Ürün adı zorunludur' });
    }

    try {
        const yeniUrun = await prisma.urun.create({
            data: {
                ad,
                kodu,
                aciklama,
                kisaAciklama,
                kategoriId: kategoriId ? parseInt(kategoriId) : null,
                anaGorsel,
                galeriGorseller,
                agirlik: agirlik ? parseFloat(agirlik) : null,
                boyutlar,
                renk,
                malzeme,
                mensei,
                stokKodu,
                barkod,
                minStokMiktari: parseFloat(minStokMiktari),
                maxStokMiktari: maxStokMiktari ? parseFloat(maxStokMiktari) : null,
                kritikStokSeviye: parseFloat(kritikStokSeviye),
                satisaBirimi,
                minSatisMiktari: parseFloat(minSatisMiktari),
                maxSatisMiktari: maxSatisMiktari ? parseFloat(maxSatisMiktari) : null,
                aktif,
                satisaUygun,
                ozelUrun,
                yeniUrun,
                indirimliUrun,
                seoBaslik,
                seoAciklama,
                anahtarKelimeler,
                uretimSuresi: uretimSuresi ? parseInt(uretimSuresi) : null,
                rafOmru: rafOmru ? parseInt(rafOmru) : null,
                saklamaKosullari,
                maliyetFiyati: maliyetFiyati ? parseFloat(maliyetFiyati) : null,
                karMarji: karMarji ? parseFloat(karMarji) : null,
                createdBy: createdBy ? parseInt(createdBy) : null
            },
            include: {
                kategori: true
            }
        });

        return res.status(201).json({
            message: 'Ürün başarıyla oluşturuldu',
            urun: yeniUrun
        });

    } catch (error) {
        console.error('❌ Ürün oluşturma hatası:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                error: 'Bu ürün adı, kodu veya barkod zaten kullanımda'
            });
        }

        return res.status(500).json({ error: 'Ürün oluşturulurken hata oluştu' });
    }
}

// Ürün güncelle
async function updateUrun(req, res) {
    const { id } = req.query;
    const updateData = req.body;

    if (!id) {
        return res.status(400).json({ error: 'Ürün ID gerekli' });
    }

    try {
        // Sayısal alanları dönüştür
        const processedData = { ...updateData };

        if (processedData.kategoriId) {
            processedData.kategoriId = parseInt(processedData.kategoriId);
        }
        if (processedData.agirlik) {
            processedData.agirlik = parseFloat(processedData.agirlik);
        }
        if (processedData.minStokMiktari !== undefined) {
            processedData.minStokMiktari = parseFloat(processedData.minStokMiktari);
        }
        if (processedData.maxStokMiktari) {
            processedData.maxStokMiktari = parseFloat(processedData.maxStokMiktari);
        }
        if (processedData.kritikStokSeviye !== undefined) {
            processedData.kritikStokSeviye = parseFloat(processedData.kritikStokSeviye);
        }
        if (processedData.minSatisMiktari !== undefined) {
            processedData.minSatisMiktari = parseFloat(processedData.minSatisMiktari);
        }
        if (processedData.maxSatisMiktari) {
            processedData.maxSatisMiktari = parseFloat(processedData.maxSatisMiktari);
        }
        if (processedData.uretimSuresi) {
            processedData.uretimSuresi = parseInt(processedData.uretimSuresi);
        }
        if (processedData.rafOmru) {
            processedData.rafOmru = parseInt(processedData.rafOmru);
        }
        if (processedData.maliyetFiyati) {
            processedData.maliyetFiyati = parseFloat(processedData.maliyetFiyati);
        }
        if (processedData.karMarji) {
            processedData.karMarji = parseFloat(processedData.karMarji);
        }
        if (processedData.updatedBy) {
            processedData.updatedBy = parseInt(processedData.updatedBy);
        }

        const guncellenenUrun = await prisma.urun.update({
            where: { id: parseInt(id) },
            data: processedData,
            include: {
                kategori: true,
                fiyatlar: {
                    where: { aktif: true },
                    orderBy: { gecerliTarih: 'desc' },
                    take: 1
                }
            }
        });

        return res.status(200).json({
            message: 'Ürün başarıyla güncellendi',
            urun: guncellenenUrun
        });

    } catch (error) {
        console.error('❌ Ürün güncelleme hatası:', error);

        if (error.code === 'P2002') {
            return res.status(400).json({
                error: 'Bu ürün adı, kodu veya barkod zaten kullanımda'
            });
        }
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        return res.status(500).json({ error: 'Ürün güncellenirken hata oluştu' });
    }
}

// Ürün sil
async function deleteUrun(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Ürün ID gerekli' });
    }

    try {
        // Ürünün kullanımda olup olmadığını kontrol et
        const urun = await prisma.urun.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        siparisKalemleri: true,
                        receteler: true,
                        ozelTepsiIcerikleri: true
                    }
                }
            }
        });

        if (!urun) {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        // Kullanımda olan ürünü silmeye izin verme
        const toplamKullanim = urun._count.siparisKalemleri +
            urun._count.receteler +
            urun._count.ozelTepsiIcerikleri;

        if (toplamKullanim > 0) {
            return res.status(400).json({
                error: 'Bu ürün kullanımda olduğu için silinemez',
                details: {
                    siparisKalemleri: urun._count.siparisKalemleri,
                    receteler: urun._count.receteler,
                    ozelTepsiIcerikleri: urun._count.ozelTepsiIcerikleri
                }
            });
        }

        await prisma.urun.delete({
            where: { id: parseInt(id) }
        });

        return res.status(200).json({
            message: 'Ürün başarıyla silindi'
        });

    } catch (error) {
        console.error('❌ Ürün silme hatası:', error);

        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Ürün bulunamadı' });
        }

        return res.status(500).json({ error: 'Ürün silinirken hata oluştu' });
    }
}

// Export with RBAC protection
export default withRBAC(handler, {
    permission: PERMISSIONS.VIEW_PRODUCTS // Base permission, specific methods will be checked inside
}); 