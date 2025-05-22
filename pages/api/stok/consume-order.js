import prisma from '../../../lib/prisma';

// Yardımcı fonksiyon: Reçeteyi recursive olarak çöz ve hammaddeye kadar in
async function resolveRecipe(stokKod, miktar) {
    const hammadde = await prisma.hammadde.findUnique({ where: { kod: stokKod } });
    if (hammadde) {
        return [{ stokKod, miktar }];
    }
    const yariMamul = await prisma.yariMamul.findUnique({ where: { kod: stokKod } });
    if (yariMamul) {
        const recipe = await prisma.recipe.findFirst({ where: { name: { contains: yariMamul.ad, mode: 'insensitive' } }, include: { ingredients: true } });
        if (!recipe) return [];
        let result = [];
        for (const ing of recipe.ingredients) {
            const sub = await resolveRecipe(ing.stokKod, miktar * (ing.miktarGram / 1000));
            result = result.concat(sub);
        }
        return result;
    }
    return [];
}

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });
    const { siparisId } = req.body;
    if (!siparisId) return res.status(400).json({ message: 'siparisId gereklidir.' });

    const siparis = await prisma.siparis.findUnique({
        where: { id: siparisId },
        include: { kalemler: { include: { urun: { include: { recipes: { include: { ingredients: true } } } } } } }
    });
    if (!siparis) return res.status(404).json({ message: 'Sipariş bulunamadı.' });
    if (siparis.hazirlanmaDurumu !== 'Hazırlandı') return res.status(400).json({ message: 'Sadece Hazırlandı statüsündeki siparişler için stok düşülebilir.' });

    let stokIhtiyaclari = {};
    for (const kalem of siparis.kalemler) {
        const recipe = kalem.urun.recipes[0];
        if (!recipe) continue;
        for (const ing of recipe.ingredients) {
            const resolved = await resolveRecipe(ing.stokKod, kalem.miktar * (ing.miktarGram / 1000));
            for (const h of resolved) {
                if (!stokIhtiyaclari[h.stokKod]) stokIhtiyaclari[h.stokKod] = 0;
                stokIhtiyaclari[h.stokKod] += h.miktar;
            }
        }
    }

    let hareketler = [];
    for (const stokKod in stokIhtiyaclari) {
        const miktar = stokIhtiyaclari[stokKod];
        let stok = await prisma.stok.findFirst({
            where: {
                OR: [
                    { hammadde: { kod: stokKod } },
                    { yariMamul: { kod: stokKod } }
                ]
            }
        });
        if (!stok) {
            console.warn('Stok kaydı bulunamadı:', stokKod);
            continue;
        }
        // DEBUG: Önceki miktarı logla
        console.log(`Stok düşülüyor: ${stokKod} | Önceki miktar: ${stok.miktarGram} | Düşülecek miktar: ${miktar}`);
        // Stoktan düş (birim uyumlu, çarpan yok)
        await prisma.stok.update({ where: { id: stok.id }, data: { miktarGram: { decrement: miktar } } });
        // Sonraki miktarı logla
        const stokSonra = await prisma.stok.findUnique({ where: { id: stok.id } });
        console.log(`Stok düşüldü: ${stokKod} | Sonraki miktar: ${stokSonra.miktarGram}`);
        await prisma.stokHareket.create({
            data: {
                stokId: stok.id,
                tip: 'cikis',
                miktarGram: miktar,
                aciklama: `Sipariş #${siparisId} için otomatik stok düşümü (reçete)`
            }
        });
        hareketler.push({ stokKod, miktar });
    }

    return res.status(200).json({ message: 'Stoklar başarıyla düşüldü.', hareketler });
} 