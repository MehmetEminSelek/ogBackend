// pages/api/malzeme-fiyatlari.js
// Malzeme (Hammadde ve Yarı Mamul) Fiyatları API'si

import prisma from '../lib/prisma';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const { stokKod } = req.query;

            if (stokKod) {
                // Belirli bir malzeme için fiyat
                const fiyat = await getMalzemeFiyati(stokKod);
                return res.status(200).json({ stokKod, fiyat });
            } else {
                // Tüm malzeme fiyatları
                const fiyatlar = await getAllMalzemeFiyatlari();
                return res.status(200).json(fiyatlar);
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
            const { stokKod, fiyat, birim = 'KG', aciklama } = req.body;

            if (!stokKod || !fiyat) {
                return res.status(400).json({
                    error: 'Stok kodu ve fiyat zorunludur'
                });
            }

            // Malzeme fiyatını güncelle veya oluştur
            const sonuc = await updateMalzemeFiyati(stokKod, fiyat, birim, aciklama);
            return res.status(200).json(sonuc);
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

// Belirli bir malzeme için fiyat al
async function getMalzemeFiyati(stokKod) {
    // Önce hammadde tablosunda ara
    const hammadde = await prisma.hammadde.findUnique({
        where: { kod: stokKod },
        select: { ad: true, fiyat: true }
    });

    if (hammadde) {
        return {
            stokKod,
            ad: hammadde.ad,
            fiyat: hammadde.fiyat || getDefaultHammaddeFiyat(stokKod),
            tip: 'Hammadde',
            birim: 'KG'
        };
    }

    // Yarı mamul tablosunda ara
    const yariMamul = await prisma.yariMamul.findUnique({
        where: { kod: stokKod },
        select: { ad: true, fiyat: true }
    });

    if (yariMamul) {
        return {
            stokKod,
            ad: yariMamul.ad,
            fiyat: yariMamul.fiyat || getDefaultYariMamulFiyat(stokKod),
            tip: 'Yarı Mamul',
            birim: 'KG'
        };
    }

    // Bulunamadıysa varsayılan fiyat döndür
    return {
        stokKod,
        ad: `Bilinmeyen Malzeme (${stokKod})`,
        fiyat: 15.00, // Varsayılan fiyat
        tip: 'Bilinmeyen',
        birim: 'KG'
    };
}

// Tüm malzeme fiyatlarını al
async function getAllMalzemeFiyatlari() {
    // Hammaddeler
    const hammaddeler = await prisma.hammadde.findMany({
        select: { kod: true, ad: true, fiyat: true }
    });

    // Yarı mamuller
    const yariMamuller = await prisma.yariMamul.findMany({
        select: { kod: true, ad: true, fiyat: true }
    });

    const hammaddeFiyatlari = hammaddeler.map(h => ({
        stokKod: h.kod,
        ad: h.ad,
        fiyat: h.fiyat || getDefaultHammaddeFiyat(h.kod),
        tip: 'Hammadde',
        birim: 'KG'
    }));

    const yariMamulFiyatlari = yariMamuller.map(y => ({
        stokKod: y.kod,
        ad: y.ad,
        fiyat: y.fiyat || getDefaultYariMamulFiyat(y.kod),
        tip: 'Yarı Mamul',
        birim: 'KG'
    }));

    return {
        hammaddeler: hammaddeFiyatlari,
        yariMamuller: yariMamulFiyatlari,
        toplam: hammaddeFiyatlari.length + yariMamulFiyatlari.length
    };
}

// Malzeme fiyatını güncelle
async function updateMalzemeFiyati(stokKod, fiyat, birim = 'KG', aciklama = '') {
    // Önce hammadde tablosunda ara
    const hammadde = await prisma.hammadde.findUnique({
        where: { kod: stokKod }
    });

    if (hammadde) {
        const guncellenen = await prisma.hammadde.update({
            where: { kod: stokKod },
            data: { fiyat: parseFloat(fiyat) },
            select: { kod: true, ad: true, fiyat: true }
        });

        return {
            message: 'Hammadde fiyatı güncellendi',
            malzeme: {
                stokKod: guncellenen.kod,
                ad: guncellenen.ad,
                fiyat: guncellenen.fiyat,
                tip: 'Hammadde',
                birim
            }
        };
    }

    // Yarı mamul tablosunda ara
    const yariMamul = await prisma.yariMamul.findUnique({
        where: { kod: stokKod }
    });

    if (yariMamul) {
        const guncellenen = await prisma.yariMamul.update({
            where: { kod: stokKod },
            data: { fiyat: parseFloat(fiyat) },
            select: { kod: true, ad: true, fiyat: true }
        });

        return {
            message: 'Yarı mamul fiyatı güncellendi',
            malzeme: {
                stokKod: guncellenen.kod,
                ad: guncellenen.ad,
                fiyat: guncellenen.fiyat,
                tip: 'Yarı Mamul',
                birim
            }
        };
    }

    throw new Error(`Malzeme bulunamadı: ${stokKod}`);
}

// Varsayılan hammadde fiyatları
function getDefaultHammaddeFiyat(stokKod) {
    const hammaddeFiyatlari = {
        'HM001': 15.00,   // Un
        'HM002': 25.00,   // Şeker
        'HM003': 45.00,   // Tereyağı
        'HM004': 8.00,    // Tuz
        'HM005': 12.00,   // Maya
        'HM006': 35.00,   // Yumurta
        'HM007': 18.00,   // Süt
        'HM008': 120.00,  // Antep Fıstığı
        'HM009': 80.00,   // Ceviz
        'HM010': 90.00,   // Fındık
        'HM011': 22.00,   // Bal
        'HM012': 28.00,   // Peynir
        'HM013': 16.00,   // Margarin
        'HM014': 32.00,   // Krema
        'HM015': 14.00,   // Nişasta
        'HM016': 26.00,   // Kakao
        'HM017': 38.00,   // Çikolata
        'HM018': 42.00,   // Vanilya
        'HM019': 19.00,   // Limon
        'HM020': 24.00,   // Portakal
    };
    return hammaddeFiyatlari[stokKod] || 15.00;
}

// Varsayılan yarı mamul fiyatları
function getDefaultYariMamulFiyat(stokKod) {
    const yariMamulFiyatlari = {
        'YM001': 20.00,   // Şerbet
        'YM002': 35.00,   // Krema
        'YM003': 25.00,   // Hamur
        'YM004': 30.00,   // İç Harç
        'YM005': 45.00,   // Fıstık Ezmesi
        'YM006': 40.00,   // Ceviz Ezmesi
        'YM007': 38.00,   // Fındık Ezmesi
        'YM008': 22.00,   // Şeker Şurubu
        'YM009': 28.00,   // Karamel
        'YM010': 33.00,   // Çikolata Sosu
    };
    return yariMamulFiyatlari[stokKod] || 20.00;
} 