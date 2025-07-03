const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Centralized pricing function - ALWAYS returns prices in the requested unit
 * @param {string} urunId - Product ID
 * @param {string} birim - Unit (KG or GRAM)
 * @param {Date} tarih - Date for price lookup
 * @returns {number} Price in the requested unit
 */
async function getFiyatByBirim(urunId, birim, tarih = new Date()) {
    try {
        // Always fetch the KG price from database (all prices stored as KG)
        const fiyat = await prisma.fiyat.findFirst({
            where: {
                urunId: urunId,
                birim: 'KG', // Her zaman KG fiyatını çek
                gecerliTarih: {
                    lte: tarih
                },
                OR: [
                    { bitisTarihi: null },
                    { bitisTarihi: { gte: tarih } }
                ]
            },
            orderBy: {
                gecerliTarih: 'desc'
            }
        });

        if (!fiyat) {
            console.warn(`No price found for product ${urunId} on ${tarih}`);
            return 0;
        }

        const kgPrice = parseFloat(fiyat.fiyat);

        // If requesting GRAM price, convert from KG to GRAM (divide by 1000)
        if (birim === 'GRAM') {
            return kgPrice / 1000;
        }

        // If requesting KG price, return as is
        return kgPrice;

    } catch (error) {
        console.error('Error in getFiyatByBirim:', error);
        return 0;
    }
}

/**
 * Calculate total price for order item with KDV
 * @param {string} urunId - Product ID
 * @param {number} miktar - Quantity
 * @param {string} birim - Unit (KG or GRAM)
 * @param {Date} tarih - Date
 * @returns {Object} { birimFiyat, araToplam, kdvOrani, kdvTutari, toplamFiyat }
 */
async function calculateOrderItemPrice(urunId, miktar, birim, tarih = new Date()) {
    try {
        const birimFiyat = await getFiyatByBirim(urunId, birim, tarih);
        const araToplam = birimFiyat * miktar;

        // Get KDV rate from product
        let kdvOrani = 18.0; // Default 18%

        if (urunId && !isNaN(parseInt(urunId))) {
            try {
                const urun = await prisma.urun.findUnique({
                    where: { id: parseInt(urunId) },
                    select: { kdvOrani: true }
                });
                kdvOrani = urun?.kdvOrani || 18.0;
            } catch (error) {
                console.warn(`Could not fetch KDV rate for product ${urunId}:`, error.message);
                kdvOrani = 18.0; // Fallback to default
            }
        }
        const kdvTutari = (araToplam * kdvOrani) / 100;
        const toplamFiyat = araToplam + kdvTutari;

        return {
            birimFiyat: parseFloat(birimFiyat.toFixed(4)),
            araToplam: parseFloat(araToplam.toFixed(2)),
            kdvOrani: parseFloat(kdvOrani.toFixed(2)),
            kdvTutari: parseFloat(kdvTutari.toFixed(2)),
            toplamFiyat: parseFloat(toplamFiyat.toFixed(2))
        };
    } catch (error) {
        console.error('Error in calculateOrderItemPrice:', error);
        return {
            birimFiyat: 0,
            araToplam: 0,
            kdvOrani: 18.0,
            kdvTutari: 0,
            toplamFiyat: 0
        };
    }
}

/**
 * Recalculate prices for existing order items (for fixing database)
 * @param {Array} orderItems - Array of order items
 * @param {Date} orderDate - Order date
 * @returns {Array} Updated order items with correct prices
 */
async function recalculateOrderItemPrices(orderItems, orderDate) {
    const updatedItems = [];

    for (const item of orderItems) {
        try {
            // Check if item has valid urunId
            if (!item.urunId) {
                console.warn(`Item ${item.id} has no urunId, skipping price recalculation`);
                updatedItems.push(item);
                continue;
            }

            const { birimFiyat, araToplam, kdvOrani, kdvTutari, toplamFiyat } = await calculateOrderItemPrice(
                item.urunId,
                item.miktar,
                item.birim,
                orderDate
            );

            updatedItems.push({
                ...item,
                birimFiyat,
                araToplam,
                kdvOrani,
                kdvTutari,
                toplamFiyat
            });
        } catch (error) {
            console.error(`Error recalculating price for item ${item.id}:`, error);
            updatedItems.push(item);
        }
    }

    return updatedItems;
}

module.exports = {
    getFiyatByBirim,
    calculateOrderItemPrice,
    recalculateOrderItemPrices
}; 