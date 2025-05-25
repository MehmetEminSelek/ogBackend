import prisma from '../../lib/prisma';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method === 'GET') {
        try {
            // Tüm reçeteleri, ilişkili ürün adı ve içerik (malzeme) listesiyle birlikte getir
            const recipes = await prisma.recipe.findMany({
                include: {
                    urun: { select: { ad: true } },
                    ingredients: true
                },
                orderBy: { name: 'asc' },
            });
            // Her içerik için stok adını ve tipini bul
            const enriched = await Promise.all(recipes.map(async (rec) => {
                const ingredientsDetailed = await Promise.all(rec.ingredients.map(async (ing) => {
                    let stokAd = null;
                    let stokTip = null;
                    const hammadde = await prisma.hammadde.findUnique({ where: { kod: ing.stokKod } });
                    if (hammadde) { stokAd = hammadde.ad; stokTip = 'Hammadde'; }
                    else {
                        const yariMamul = await prisma.yariMamul.findUnique({ where: { kod: ing.stokKod } });
                        if (yariMamul) { stokAd = yariMamul.ad; stokTip = 'Yarı Mamul'; }
                    }
                    return {
                        id: ing.id,
                        stokKod: ing.stokKod,
                        stokAd,
                        stokTip,
                        miktarGram: ing.miktarGram
                    };
                }));
                return {
                    id: rec.id,
                    name: rec.name,
                    urunAd: rec.urun?.ad || null,
                    ingredients: ingredientsDetailed
                };
            }));
            console.log('API /api/receteler dönen reçete sayısı:', enriched.length, 'IDler:', enriched.map(r => r.id));
            return res.status(200).json(enriched);
        } catch (error) {
            console.error('Reçeteler GET hatası:', error);
            return res.status(500).json({ message: 'Reçeteler listelenirken hata oluştu.', error: error.message });
        }
    }

    // --- REÇETE EKLEME ---
    if (req.method === 'POST') {
        try {
            const { name, urunId, ingredients } = req.body;
            if (!name || !Array.isArray(ingredients) || ingredients.length === 0) {
                return res.status(400).json({ message: 'Reçete adı ve en az bir malzeme gereklidir.' });
            }
            const created = await prisma.recipe.create({
                data: {
                    name,
                    urunId: urunId || null,
                    ingredients: {
                        create: ingredients.map(ing => ({ stokKod: ing.stokKod, miktarGram: ing.miktarGram }))
                    }
                },
                include: { ingredients: true }
            });
            return res.status(201).json(created);
        } catch (error) {
            console.error('Reçeteler POST hatası:', error);
            return res.status(500).json({ message: 'Reçete eklenirken hata oluştu.', error: error.message });
        }
    }

    // --- REÇETE GÜNCELLEME ---
    if (req.method === 'PUT') {
        try {
            const { id, name, urunId, ingredients } = req.body;
            if (!id || !name || !Array.isArray(ingredients) || ingredients.length === 0) {
                return res.status(400).json({ message: 'ID, reçete adı ve en az bir malzeme gereklidir.' });
            }
            // Eski ingredients'ları sil, yenilerini ekle (basit yol)
            await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
            const updated = await prisma.recipe.update({
                where: { id },
                data: {
                    name,
                    urunId: urunId || null,
                    ingredients: {
                        create: ingredients.map(ing => ({ stokKod: ing.stokKod, miktarGram: ing.miktarGram }))
                    }
                },
                include: { ingredients: true }
            });
            return res.status(200).json(updated);
        } catch (error) {
            console.error('Reçeteler PUT hatası:', error);
            return res.status(500).json({ message: 'Reçete güncellenirken hata oluştu.', error: error.message });
        }
    }

    // --- REÇETE SİLME ---
    if (req.method === 'DELETE') {
        try {
            const { id } = req.body;
            if (!id) return res.status(400).json({ message: 'ID gereklidir.' });
            await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
            await prisma.recipe.delete({ where: { id } });
            return res.status(204).end();
        } catch (error) {
            console.error('Reçeteler DELETE hatası:', error);
            return res.status(500).json({ message: 'Reçete silinirken hata oluştu.', error: error.message });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}