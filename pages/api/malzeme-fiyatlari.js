// pages/api/malzeme-fiyatlari.js
// Malzeme Fiyatları API'si - Yeni Material Schema'sı

import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const { kod } = req.query;

            if (kod) {
                // Belirli bir malzeme için fiyat
                const material = await prisma.material.findUnique({
                    where: { kod },
                    select: {
                        id: true,
                        ad: true,
                        kod: true,
                        tipi: true,
                        birim: true,
                        birimFiyat: true,
                        mevcutStok: true,
                        minStokSeviye: true,
                        kritikSeviye: true,
                        aciklama: true,
                        tedarikci: true,
                        aktif: true
                    }
                });

                if (!material) {
                    return res.status(404).json({
                        error: 'Malzeme bulunamadı',
                        kod
                    });
                }

                return res.status(200).json({
                    kod: material.kod,
                    ad: material.ad,
                    fiyat: material.birimFiyat || 0,
                    birim: material.birim,
                    tipi: material.tipi,
                    mevcutStok: material.mevcutStok,
                    minStokSeviye: material.minStokSeviye,
                    kritikDurum: material.mevcutStok <= material.kritikSeviye,
                    tedarikci: material.tedarikci,
                    aktif: material.aktif
                });
            } else {
                // Tüm malzeme fiyatları
                const materials = await prisma.material.findMany({
                    where: { aktif: true },
                    select: {
                        id: true,
                        ad: true,
                        kod: true,
                        tipi: true,
                        birim: true,
                        birimFiyat: true,
                        mevcutStok: true,
                        minStokSeviye: true,
                        kritikSeviye: true,
                        aciklama: true,
                        tedarikci: true,
                        aktif: true
                    },
                    orderBy: [
                        { tipi: 'asc' },
                        { ad: 'asc' }
                    ]
                });

                const gruppedMaterials = {
                    HAMMADDE: [],
                    YARI_MAMUL: [],
                    YARDIMCI_MADDE: [],
                    AMBALAJ_MALZEMESI: []
                };

                materials.forEach(m => {
                    const materialData = {
                        kod: m.kod,
                        ad: m.ad,
                        fiyat: m.birimFiyat || 0,
                        birim: m.birim,
                        tipi: m.tipi,
                        mevcutStok: m.mevcutStok,
                        minStokSeviye: m.minStokSeviye,
                        kritikDurum: m.mevcutStok <= m.kritikSeviye,
                        tedarikci: m.tedarikci,
                        aktif: m.aktif
                    };

                    if (gruppedMaterials[m.tipi]) {
                        gruppedMaterials[m.tipi].push(materialData);
                    }
                });

                return res.status(200).json({
                    hammaddeler: gruppedMaterials.HAMMADDE,
                    yariMamuller: gruppedMaterials.YARI_MAMUL,
                    yardimciMaddeler: gruppedMaterials.YARDIMCI_MADDE,
                    ambalajMalzemeleri: gruppedMaterials.AMBALAJ_MALZEMESI,
                    toplam: materials.length,
                    kritikSeviyedekiler: materials.filter(m => m.mevcutStok <= m.kritikSeviye).length
                });
            }
        } catch (error) {
            console.error('❌ Malzeme fiyatları GET hatası:', error);
            return res.status(500).json({
                error: 'Malzeme fiyatları alınırken hata oluştu',
                details: error.message
            });
        }
    }

    if (req.method === 'POST') {
        try {
            const { kod, fiyat, birim = 'KG', aciklama } = req.body;

            if (!kod || fiyat === undefined || fiyat === null) {
                return res.status(400).json({
                    error: 'Malzeme kodu ve fiyat zorunludur'
                });
            }

            // Malzemeyi bul ve fiyatını güncelle
            const material = await prisma.material.findUnique({
                where: { kod }
            });

            if (!material) {
                return res.status(404).json({
                    error: 'Malzeme bulunamadı',
                    kod
                });
            }

            const updatedMaterial = await prisma.material.update({
                where: { kod },
                data: {
                    birimFiyat: parseFloat(fiyat)
                }
            });

            return res.status(200).json({
                message: 'Malzeme fiyatı başarıyla güncellendi',
                malzeme: {
                    kod: updatedMaterial.kod,
                    ad: updatedMaterial.ad,
                    fiyat: updatedMaterial.birimFiyat,
                    birim: updatedMaterial.birim,
                    tipi: updatedMaterial.tipi
                }
            });
        } catch (error) {
            console.error('❌ Malzeme fiyatı güncelleme hatası:', error);
            return res.status(500).json({
                error: 'Malzeme fiyatı güncellenirken hata oluştu',
                details: error.message
            });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
} 