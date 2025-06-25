// pages/api/fiyatlar/index.js
// Gelişmiş Fiyat Yönetimi API'si

import prisma from '../../../lib/prisma';
// import { verifyAuth } from '../../../lib/auth'; // GELİŞTİRME İÇİN GEÇİCİ OLARAK KAPALI

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
    try {
        const fiyatlar = await prisma.fiyat.findMany({
            include: {
                urun: {
                    select: {
                        id: true,
                        ad: true,
                        kod: true,
                        kategori: {
                            select: {
                                ad: true
                            }
                        }
                    }
                }
            },
            orderBy: { gecerliTarih: 'desc' }
        });

        return res.status(200).json({
            fiyatlar,
            total: fiyatlar.length
        });
    } catch (error) {
        console.error('❌ Fiyat listesi hatası:', error);
        return res.status(500).json({
            error: 'Fiyatlar listelenirken hata oluştu',
            details: error.message
        });
    }
}

// Yeni fiyat oluştur
async function createFiyat(req, res) {
    const {
        urunId,
        fiyat,
        birim = 'KG',
        fiyatTipi = 'NORMAL',
        gecerliTarih,
        bitisTarihi,
        aktif = true
    } = req.body;

    if (!urunId || !fiyat || !gecerliTarih) {
        return res.status(400).json({
            error: 'Ürün, fiyat ve geçerlilik tarihi zorunludur'
        });
    }

    try {
        const yeniFiyat = await prisma.fiyat.create({
            data: {
                urunId: parseInt(urunId),
                fiyat: parseFloat(fiyat),
                birim,
                fiyatTipi,
                gecerliTarih: new Date(gecerliTarih),
                bitisTarihi: bitisTarihi ? new Date(bitisTarihi) : null,
                aktif
            },
            include: {
                urun: {
                    select: {
                        ad: true,
                        kod: true
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
        return res.status(500).json({
            error: 'Fiyat oluşturulurken hata oluştu',
            details: error.message
        });
    }
}

// Fiyat güncelle
async function updateFiyat(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Fiyat ID gerekli' });
    }

    try {
        const guncellenenFiyat = await prisma.fiyat.update({
            where: { id: parseInt(id) },
            data: req.body,
            include: {
                urun: {
                    select: {
                        ad: true,
                        kod: true
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
        return res.status(500).json({
            error: 'Fiyat silinirken hata oluştu',
            details: error.message
        });
    }
} 