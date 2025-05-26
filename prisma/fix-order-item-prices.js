const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const kalemler = await prisma.siparisKalemi.findMany({
        where: { birimFiyat: 0 },
        include: { urun: { include: { fiyatlar: true } } }
    });

    for (const kalem of kalemler) {
        let birimFiyat = 0;
        if (kalem.birim === 'Gram') {
            // Önce GR birimini dene, yoksa KG/1000
            let fiyatKaydi = kalem.urun.fiyatlar.find(f => f.birim.toUpperCase() === 'GR' && f.aktif);
            if (fiyatKaydi) {
                birimFiyat = fiyatKaydi.fiyat;
            } else {
                fiyatKaydi = kalem.urun.fiyatlar.find(f => f.birim.toUpperCase() === 'KG' && f.aktif);
                if (fiyatKaydi) birimFiyat = fiyatKaydi.fiyat / 1000;
            }
        } else if (kalem.birim === 'Adet') {
            const fiyatKaydi = kalem.urun.fiyatlar.find(f => f.birim.toUpperCase() === 'ADET' && f.aktif);
            if (fiyatKaydi) birimFiyat = fiyatKaydi.fiyat;
        }
        if (birimFiyat > 0) {
            await prisma.siparisKalemi.update({
                where: { id: kalem.id },
                data: { birimFiyat }
            });
            console.log(`Güncellendi: SiparişKalemi #${kalem.id} -> ${birimFiyat} TL`);
        } else {
            console.log(`Fiyat bulunamadı: SiparişKalemi #${kalem.id}`);
        }
    }
    await prisma.$disconnect();
}
main(); 