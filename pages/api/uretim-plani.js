import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Başlangıç ve bitiş tarihi gereklidir.' });
    }
    try {
        // 1. Belirtilen aralıktaki onaylanmış siparişleri ve kalemlerini çek
        const siparisler = await prisma.siparis.findMany({
            where: {
                tarih: { gte: new Date(startDate), lte: new Date(endDate) },
                onaylandiMi: true
            },
            include: {
                kalemler: { include: { urun: true } },
                gonderenAdi: true,
                aliciAdi: true
            }
        });
        // 2. Üretim Planı: Tüm sipariş kalemleri için reçeteleri bul, toplam hammadde/yarı mamul ihtiyacını hesapla
        const receteler = await prisma.recipe.findMany({ include: { ingredients: true, urun: true } });
        // Map: urunId -> recipe
        const recipeMap = {};
        for (const rec of receteler) {
            if (rec.urunId) recipeMap[rec.urunId] = rec;
        }
        // Toplam ihtiyaçları hesapla
        const stokIhtiyac = {};
        for (const sip of siparisler) {
            for (const kalem of sip.kalemler) {
                const recipe = recipeMap[kalem.urunId];
                if (!recipe) continue;
                const miktar = kalem.birim.toLowerCase() === 'gram' ? kalem.miktar : kalem.miktar * 1000;
                for (const ing of recipe.ingredients) {
                    if (!stokIhtiyac[ing.stokKod]) stokIhtiyac[ing.stokKod] = { stokKod: ing.stokKod, toplamGram: 0 };
                    stokIhtiyac[ing.stokKod].toplamGram += (ing.miktarGram * miktar) / 1000;
                }
            }
        }
        // Stok adlarını ve tiplerini bul
        const hammaddeler = await prisma.hammadde.findMany();
        const yariMamuller = await prisma.yariMamul.findMany();
        const stokAdMap = {};
        for (const h of hammaddeler) stokAdMap[h.kod] = { ad: h.ad, tip: 'Hammadde' };
        for (const y of yariMamuller) stokAdMap[y.kod] = { ad: y.ad, tip: 'Yarı Mamul' };
        const uretimPlani = Object.values(stokIhtiyac).map(x => ({
            stokKod: x.stokKod,
            stokAd: stokAdMap[x.stokKod]?.ad || '-',
            stokTip: stokAdMap[x.stokKod]?.tip || '-',
            toplamGram: Math.round(x.toplamGram)
        })).sort((a, b) => a.stokAd.localeCompare(b.stokAd));

        // 3. Sipariş Raporu: Ürün ve müşteri bazlı toplam miktar
        const siparisRaporu = [];
        for (const sip of siparisler) {
            for (const kalem of sip.kalemler) {
                siparisRaporu.push({
                    urunAd: kalem.urun?.ad || '-',
                    musteri: sip.gorunecekAd || sip.gonderenAdi || sip.aliciAdi || '-',
                    toplamMiktar: kalem.miktar,
                    birim: kalem.birim
                });
            }
        }
        return res.status(200).json({ uretimPlani, siparisRaporu });
    } catch (error) {
        return res.status(500).json({ message: 'Rapor oluşturulurken hata oluştu.', error: error.message });
    }
} 