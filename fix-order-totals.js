const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixOrderTotals() {
    console.log('🔧 Sipariş toplamları düzeltme işlemi başlıyor...');

    try {
        // Tüm siparişleri ve kalemlerini al
        const orders = await prisma.siparis.findMany({
            include: {
                kalemler: {
                    select: {
                        araToplam: true,
                        kdvTutari: true,
                        toplamTutar: true,
                        tepsiTava: {
                            select: {
                                fiyat: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`📊 ${orders.length} sipariş bulundu, toplamlar kontrol ediliyor...`);

        let totalFixed = 0;
        let totalChecked = 0;

        for (const order of orders) {
            totalChecked++;

            try {
                // Kalemlerin toplamlarını hesapla
                const araToplam = order.kalemler.reduce((sum, item) => sum + parseFloat(item.araToplam || 0), 0);
                const kdvToplam = order.kalemler.reduce((sum, item) => sum + parseFloat(item.kdvTutari || 0), 0);

                // Tepsi/Tava ücretlerini hesapla
                const tepsiToplam = order.kalemler.reduce((sum, item) => {
                    return sum + parseFloat(item.tepsiTava?.fiyat || 0);
                }, 0);

                // Genel toplam hesapla
                const hesaplananToplamTutar = araToplam + kdvToplam + tepsiToplam +
                    parseFloat(order.kargoUcreti || 0) +
                    parseFloat(order.digerHizmetTutari || 0);

                // Mevcut değerlerle karşılaştır
                const mevcutAraToplam = parseFloat(order.araToplam || 0);
                const mevcutKdvToplam = parseFloat(order.kdvToplam || 0);
                const mevcutToplamTutar = parseFloat(order.toplamTutar || 0);

                const aratoplamFarki = Math.abs(mevcutAraToplam - araToplam);
                const kdvFarki = Math.abs(mevcutKdvToplam - kdvToplam);
                const toplamFarki = Math.abs(mevcutToplamTutar - hesaplananToplamTutar);

                // Fark varsa düzelt (1 TL'den fazla fark varsa)
                if (aratoplamFarki > 1 || kdvFarki > 1 || toplamFarki > 1) {
                    console.log(`\n⚠️  Sipariş ${order.id} toplam hatası tespit edildi:`);
                    console.log(`      Ara Toplam - Mevcut: ${mevcutAraToplam.toFixed(2)} ₺, Doğru: ${araToplam.toFixed(2)} ₺`);
                    console.log(`      KDV Toplam - Mevcut: ${mevcutKdvToplam.toFixed(2)} ₺, Doğru: ${kdvToplam.toFixed(2)} ₺`);
                    console.log(`      Genel Toplam - Mevcut: ${mevcutToplamTutar.toFixed(2)} ₺, Doğru: ${hesaplananToplamTutar.toFixed(2)} ₺`);
                    console.log(`      Tepsi Ücreti: ${tepsiToplam.toFixed(2)} ₺`);
                    console.log(`      Kargo Ücreti: ${parseFloat(order.kargoUcreti || 0).toFixed(2)} ₺`);

                    // Veritabanında düzelt
                    await prisma.siparis.update({
                        where: { id: order.id },
                        data: {
                            araToplam: araToplam,
                            kdvToplam: kdvToplam,
                            toplamTutar: hesaplananToplamTutar
                        }
                    });

                    totalFixed++;
                    console.log(`      ✅ Düzeltildi!`);
                } else {
                    console.log(`✓ Sipariş ${order.id} toplamları doğru`);
                }

            } catch (error) {
                console.error(`❌ Sipariş ${order.id} toplam hesaplaması başarısız:`, error.message);
            }
        }

        console.log(`\n🎉 Sipariş toplamları düzeltme işlemi tamamlandı!`);
        console.log(`📈 Kontrol edilen sipariş sayısı: ${totalChecked}`);
        console.log(`🔧 Düzeltilen sipariş sayısı: ${totalFixed}`);
        console.log(`✅ Başarı oranı: %${(((totalChecked - totalFixed) / totalChecked) * 100).toFixed(1)}`);

    } catch (error) {
        console.error('❌ Sipariş toplamları düzeltme işlemi başarısız:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Script'i çalıştır
if (require.main === module) {
    fixOrderTotals();
}

module.exports = { fixOrderTotals }; 