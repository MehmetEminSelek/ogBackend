import prisma from '../../../lib/prisma';

// Reçete maliyeti hesaplama fonksiyonu
async function calculateRecipeCost(recipeId, tx = prisma) {
    try {
        // 1. Recipe'yi ve içindeki malzemeleri al
        const recipe = await tx.recipe.findUnique({
            where: { id: recipeId },
            include: {
                ingredients: true,
                urun: {
                    include: {
                        fiyatlar: {
                            where: { aktif: true },
                            orderBy: { gecerliTarih: 'desc' },
                            take: 1
                        }
                    }
                }
            }
        });

        if (!recipe) {
            throw new Error(`Recipe bulunamadı (ID: ${recipeId})`);
        }

        let toplamMaliyet = 0;
        const maliyetDetaylari = [];
        let toplamGram = 0;

        // 2. Her ingredient için maliyet hesapla
        for (const ingredient of recipe.ingredients) {
            // Dinamik malzeme fiyatını al
            const malzemeFiyati = await getMalzemeFiyati(ingredient.stokKod, tx);

            // KG fiyatını gram fiyatına çevir
            const gramFiyat = malzemeFiyati.fiyat / 1000;

            // Recipe'deki miktar ile çarp
            const malzemeMaliyet = gramFiyat * ingredient.miktarGram;

            // Toplam grama ekle
            toplamGram += ingredient.miktarGram;

            // Toplama ekle
            toplamMaliyet += malzemeMaliyet;

            // Detay ekle
            maliyetDetaylari.push({
                malzemeId: ingredient.id,
                stokKodu: ingredient.stokKod,
                malzemeTipi: malzemeFiyati.tip,
                malzemeAdi: malzemeFiyati.ad,
                miktar: ingredient.miktarGram.toFixed(2),
                birim: 'g',
                birimFiyat: malzemeFiyati.fiyat,
                birimFiyatBirim: 'KG',
                toplamMaliyet: malzemeMaliyet.toFixed(2),
                yuzde: 0 // Şimdilik 0, sonra hesaplanacak
            });
        }

        // Yüzdeleri hesapla (toplam maliyet belli olduktan sonra)
        maliyetDetaylari.forEach(detay => {
            detay.yuzde = toplamMaliyet > 0 ? ((parseFloat(detay.toplamMaliyet) / toplamMaliyet) * 100).toFixed(1) : '0';
        });

        // 3. Satış fiyatını bul
        let satisFiyati = 0;
        if (recipe.urun?.fiyatlar?.[0]) {
            satisFiyati = recipe.urun.fiyatlar[0].fiyat;
        }

        // 4. Kar ve marj hesapla
        const kar = satisFiyati - toplamMaliyet;
        const karMarji = satisFiyati > 0 ? ((kar / satisFiyati) * 100).toFixed(1) : '0';

        // 5. Sonucu formatla
        const sonuc = {
            recipeId,
            receteAdi: recipe.name,
            urunKodu: recipe.urun?.kodu,
            toplamGram,
            // 1000g için değerler
            binGramMaliyet: toplamMaliyet.toFixed(2),
            kgMaliyeti: toplamMaliyet.toFixed(2),
            binGramKar: kar.toFixed(2),
            karMarji: karMarji,
            // Fiyat analizi
            fiyatAnalizi: {
                satisFiyati: satisFiyati.toFixed(2),
                maliyet: toplamMaliyet.toFixed(2),
                kar: kar.toFixed(2)
            },
            // Recipe detayları
            malzemeSayisi: maliyetDetaylari.length,
            malzemeler: maliyetDetaylari,
            birim: 'KG'
        };

        return sonuc;

    } catch (error) {
        console.error(`❌ Recipe maliyet hesaplama hatası (ID: ${recipeId}):`, error);
        throw error;
    }
}

// Dinamik malzeme fiyatı alma fonksiyonu
async function getMalzemeFiyati(stokKod, tx = prisma) {
    // Önce hammadde tablosunda ara
    const hammadde = await tx.hammadde.findUnique({
        where: { kod: stokKod },
        select: { ad: true, fiyat: true }
    });

    if (hammadde) {
        return {
            stokKod,
            ad: hammadde.ad,
            fiyat: hammadde.fiyat || getDefaultHammaddeFiyat(stokKod),
            tip: 'Hammadde'
        };
    }

    // Yarı mamul tablosunda ara
    const yariMamul = await tx.yariMamul.findUnique({
        where: { kod: stokKod },
        select: { ad: true, fiyat: true }
    });

    if (yariMamul) {
        return {
            stokKod,
            ad: yariMamul.ad,
            fiyat: yariMamul.fiyat || getDefaultYariMamulFiyat(stokKod),
            tip: 'Yarı Mamul'
        };
    }

    // Bulunamadıysa varsayılan değer döndür
    return {
        stokKod,
        ad: `Bilinmeyen Malzeme (${stokKod})`,
        fiyat: 15.00, // Varsayılan fiyat
        tip: 'Bilinmeyen'
    };
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

// API endpoint handler
export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { recipeId, miktar } = req.query;

        if (!recipeId) {
            return res.status(400).json({ message: 'recipeId parametresi gerekli' });
        }

        // Recipe maliyetini hesapla
        const maliyetSonucu = await calculateRecipeCost(parseInt(recipeId));

        // Eğer miktar belirtildiyse, o miktara göre hesapla
        if (miktar) {
            const gramMiktar = parseFloat(miktar);
            if (isNaN(gramMiktar)) {
                return res.status(400).json({ message: 'Geçersiz miktar' });
            }

            // KG maliyetini istenen gram miktarına oranla
            const oranlanmisMaliyet = (parseFloat(maliyetSonucu.kgMaliyeti) / 1000) * gramMiktar;

            return res.status(200).json({
                ...maliyetSonucu,
                istenenMiktar: gramMiktar,
                istenenMiktarBirim: 'gram',
                oranlanmisMaliyet: oranlanmisMaliyet.toFixed(2)
            });
        }

        return res.status(200).json(maliyetSonucu);

    } catch (error) {
        console.error('❌ Recipe maliyet API hatası:', error);
        return res.status(500).json({
            message: 'Recipe maliyeti hesaplanırken bir hata oluştu',
            error: error.message
        });
    }
} 