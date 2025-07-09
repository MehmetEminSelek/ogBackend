const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export default async function handler(req, res) {
    const { method } = req;

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        switch (method) {
            case 'GET':
                return await getMaterials(req, res);
            case 'POST':
                return await createMaterial(req, res);
            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Materials API Error:', error);
        return res.status(500).json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * GET /api/materials
 * Malzemeleri listele (filtreleme, sayfalama, arama)
 */
async function getMaterials(req, res) {
    const {
        page = 1,
        limit = 20,
        search = '',
        tipi = '',
        birim = '',
        aktif = '',
        sortBy = 'ad',
        sortOrder = 'asc'
    } = req.query;

    // Build where clause
    const where = {};

    if (search) {
        where.OR = [
            { ad: { contains: search, mode: 'insensitive' } },
            { kod: { contains: search, mode: 'insensitive' } },
            { aciklama: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (tipi) {
        where.tipi = tipi;
    }

    if (birim) {
        where.birim = birim;
    }

    if (aktif !== '') {
        where.aktif = aktif === 'true';
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Execute queries
    const [materials, totalCount] = await Promise.all([
        prisma.material.findMany({
            where,
            orderBy,
            skip,
            take,
            select: {
                id: true,
                ad: true,
                kod: true,
                tipi: true,
                birim: true,
                birimFiyat: true,
                mevcutStok: true,
                minStokSeviye: true,
                maxStokSeviye: true,
                kritikSeviye: true,
                aciklama: true,
                tedarikci: true,
                aktif: true,
                createdAt: true,
                updatedAt: true,
                // Recipe relations count
                _count: {
                    select: {
                        receteIcerikleri: true
                    }
                }
            }
        }),
        prisma.material.count({ where })
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / take);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
        success: true,
        data: materials,
        pagination: {
            page: parseInt(page),
            limit: take,
            total: totalCount,
            totalPages,
            hasNextPage,
            hasPrevPage
        },
        filters: {
            search,
            tipi,
            birim,
            aktif
        }
    });
}

/**
 * POST /api/materials
 * Yeni malzeme oluştur
 */
async function createMaterial(req, res) {
    const {
        ad,
        kod,
        tipi,
        birim,
        birimFiyat = 0,
        mevcutStok = 0,
        minStokSeviye = 0,
        maxStokSeviye,
        kritikSeviye = 10,
        aciklama,
        tedarikci,
        rafOmru,
        saklamaKosullari,
        aktif = true
    } = req.body;

    // Validation
    if (!ad || !kod || !tipi || !birim) {
        return res.status(400).json({
            message: 'Zorunlu alanlar eksik',
            required: ['ad', 'kod', 'tipi', 'birim']
        });
    }

    // Check if material with same code exists
    const existingMaterial = await prisma.material.findUnique({
        where: { kod }
    });

    if (existingMaterial) {
        return res.status(409).json({
            message: 'Bu kod ile malzeme zaten mevcut',
            field: 'kod'
        });
    }

    // Create material
    const material = await prisma.material.create({
        data: {
            ad,
            kod,
            tipi,
            birim,
            birimFiyat: parseFloat(birimFiyat),
            mevcutStok: parseFloat(mevcutStok),
            minStokSeviye: parseFloat(minStokSeviye),
            maxStokSeviye: maxStokSeviye ? parseFloat(maxStokSeviye) : null,
            kritikSeviye: parseFloat(kritikSeviye),
            aciklama,
            tedarikci,
            rafOmru: rafOmru ? parseInt(rafOmru) : null,
            saklamaKosullari,
            aktif
        }
    });

    return res.status(201).json({
        success: true,
        data: material,
        message: 'Malzeme başarıyla oluşturuldu'
    });
} 