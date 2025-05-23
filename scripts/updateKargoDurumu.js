import prisma from '../lib/prisma.js';

async function main() {
    // Kargo teslimat türü kodları
    const kargoTeslimatKodlari = ['TT001', 'TT003', 'TT004', 'TT006'];
    // İlgili teslimat türlerinin id'lerini bul
    const teslimatTurleri = await prisma.teslimatTuru.findMany({
        where: { kodu: { in: kargoTeslimatKodlari } },
        select: { id: true }
    });
    const teslimatTuruIdSet = new Set(teslimatTurleri.map(t => t.id));

    // Güncellenecek siparişleri bul
    const siparisler = await prisma.siparis.findMany({
        where: {
            teslimatTuruId: { in: Array.from(teslimatTuruIdSet) },
            hazirlanmaDurumu: 'Hazırlandı',
        },
        select: { id: true, kargoDurumu: true }
    });

    let updatedCount = 0;
    for (const s of siparisler) {
        if (s.kargoDurumu !== 'Kargoya Verilecek') {
            await prisma.siparis.update({
                where: { id: s.id },
                data: { kargoDurumu: 'Kargoya Verilecek' }
            });
            updatedCount++;
        }
    }
    console.log(`Güncellenen sipariş sayısı: ${updatedCount}`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); }); 