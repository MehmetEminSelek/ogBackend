const { PrismaClient } = require('@prisma/client');
const { calculateOrderItemPrice } = require('./lib/fiyat');

const prisma = new PrismaClient();

async function fixPricingDatabase() {
    console.log('🔧 Fiyatlandırma veritabanı düzeltme işlemi başlıyor...');

    try {
        // Tüm siparişleri al
        const orders = await prisma.siparis.findMany({
            include: {
                kalemler: {
                    include: {
                        urun: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`📊 ${orders.length} sipariş bulundu, fiyatlar kontrol ediliyor...`);

        let totalFixed = 0;
        let totalChecked = 0;

        for (const order of orders) {
            console.log(`\n🔍 Sipariş ${order.id} kontrol ediliyor (Tarih: ${order.tarih.toISOString().split('T')[0]})`);

            for (const item of order.kalemler) {
                totalChecked++;

                try {
                    // Yeni fiyatlandırma sistemi ile doğru fiyatı hesapla
                    const correctPrice = await calculateOrderItemPrice(
                        item.urunId,
                        item.miktar,
                        item.birim,
                        order.tarih
                    );

                    const currentUnitPrice = parseFloat(item.birimFiyat);
                    const correctUnitPrice = correctPrice.birimFiyat;
                    const correctTotalPrice = correctPrice.toplamFiyat;

                    // Fiyat farkı %10'dan fazlaysa düzelt
                    const priceDifference = Math.abs(currentUnitPrice - correctUnitPrice);
                    const priceChangePercentage = (priceDifference / correctUnitPrice) * 100;

                    if (priceChangePercentage > 10) {
                        console.log(`  ⚠️  Kalem ${item.id} (${item.urun.ad}) fiyat hatası tespit edildi:`);
                        console.log(`      Mevcut: ${currentUnitPrice} ${item.birim}`);
                        console.log(`      Doğru:  ${correctUnitPrice} ${item.birim}`);
                        console.log(`      Fark:   %${priceChangePercentage.toFixed(1)}`);

                        // Veritabanında düzelt
                        await prisma.siparisKalemi.update({
                            where: { id: item.id },
                            data: {
                                birimFiyat: correctUnitPrice,
                                araToplam: correctTotalPrice,
                                toplamTutar: correctTotalPrice * 1.18 // %18 KDV dahil
                            }
                        });

                        totalFixed++;
                        console.log(`      ✅ Düzeltildi!`);
                    } else {
                        console.log(`  ✓ Kalem ${item.id} (${item.urun.ad}) fiyatı doğru`);
                    }

                } catch (error) {
                    console.error(`  ❌ Kalem ${item.id} fiyat hesaplaması başarısız:`, error.message);
                }
            }

            // Sipariş toplamını yeniden hesapla
            const updatedItems = await prisma.siparisKalemi.findMany({
                where: { siparisId: order.id }
            });

            const newOrderTotal = updatedItems.reduce((sum, item) => sum + parseFloat(item.toplamTutar || item.araToplam || 0), 0);

            if (Math.abs(parseFloat(order.toplamTutar || 0) - newOrderTotal) > 1) {
                await prisma.siparis.update({
                    where: { id: order.id },
                    data: { toplamTutar: newOrderTotal }
                });
                console.log(`  📊 Sipariş toplam tutarı güncellendi: ${newOrderTotal.toFixed(2)} TL`);
            }
        }

        console.log(`\n🎉 Fiyatlandırma düzeltme işlemi tamamlandı!`);
        console.log(`📈 Kontrol edilen kalem sayısı: ${totalChecked}`);
        console.log(`🔧 Düzeltilen kalem sayısı: ${totalFixed}`);
        console.log(`✅ Başarı oranı: %${(((totalChecked - totalFixed) / totalChecked) * 100).toFixed(1)}`);

    } catch (error) {
        console.error('❌ Fiyatlandırma düzeltme işlemi başarısız:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Script'i çalıştır
if (require.main === module) {
    fixPricingDatabase();
}

module.exports = { fixPricingDatabase }; 