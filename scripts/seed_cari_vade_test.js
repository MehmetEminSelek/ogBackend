import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Cari ekle
        const cari = await prisma.cari.create({
            data: {
                ad: 'Test Cari',
                email: 'testcari@example.com',
                telefon: '5551112233',
                adres: 'Test Mah. Test Cad. No:1',
                aciklama: 'Vade test carisi',
            },
        });

        console.log('Test carisi eklendi:', cari);

        // 2. 40 gün önce vadesi geçmiş borç hareketi ekle
        const vadeTarihi = new Date();
        vadeTarihi.setDate(vadeTarihi.getDate() - 40);
        const borcHareketi = await prisma.cariHareket.create({
            data: {
                cariId: cari.id,
                tip: 'manuel',
                tutar: 150,
                aciklama: 'Test borç',
                vadeTarihi,
                direction: 'borc',
            },
        });

        console.log('Borç hareketi eklendi:', borcHareketi);

        // 3. 10 gün önce alacak hareketi ekle (kısmi ödeme)
        const odemeTarihi = new Date();
        odemeTarihi.setDate(odemeTarihi.getDate() - 10);
        const odemeHareketi = await prisma.cariHareket.create({
            data: {
                cariId: cari.id,
                tip: 'odeme',
                tutar: 50,
                aciklama: 'Kısmi ödeme',
                vadeTarihi: odemeTarihi,
                direction: 'alacak',
            },
        });

        console.log('Ödeme hareketi eklendi:', odemeHareketi);
        console.log('Test carisi ve hareketleri başarıyla eklendi!');
    } catch (error) {
        console.error('Test verisi eklenirken hata:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error); 