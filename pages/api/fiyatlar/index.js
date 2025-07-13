// pages/api/fiyatlar/index.js
// Gelişmiş Fiyat Yönetimi API'si

import prisma from '../../../lib/prisma';
import { withRBAC, PERMISSIONS } from '../../../lib/rbac';

async function handler(req, res) {

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
        const fiyatlar = await prisma.urunFiyat.findMany({
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
            orderBy: { baslangicTarihi: 'desc' }
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
        kgFiyati,
        birim = 'KG',
        fiyatTipi = 'NORMAL',
        baslangicTarihi,
        bitisTarihi,
        aktif = true
    } = req.body;

    if (!urunId || !kgFiyati || !baslangicTarihi) {
        return res.status(400).json({
            error: 'Ürün, fiyat ve başlangıç tarihi zorunludur'
        });
    }

    try {
        const yeniFiyat = await prisma.urunFiyat.create({
            data: {
                urunId: parseInt(urunId),
                kgFiyati: parseFloat(kgFiyati),
                birim,
                fiyatTipi,
                baslangicTarihi: new Date(baslangicTarihi),
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
        const guncellenenFiyat = await prisma.urunFiyat.update({
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
        await prisma.urunFiyat.delete({
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

// Export with RBAC protection
export default withRBAC(handler, {
    permission: PERMISSIONS.VIEW_FINANCIAL // Base permission, specific methods will be checked inside
}); 