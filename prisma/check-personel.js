const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('👥 PERSONEL VERİLERİ KONTROLÜ\n');

    const users = await prisma.user.findMany({
        include: {
            sube: true
        },
        orderBy: {
            ad: 'asc'
        }
    });

    console.log(`👥 Toplam Personel: ${users.length} kişi\n`);

    // Aktif/Pasif durum
    const aktif = users.filter(u => u.aktif).length;
    const pasif = users.filter(u => !u.aktif).length;

    console.log(`📊 DURUM RAPORU:`);
    console.log(`   • Aktif: ${aktif} kişi`);
    console.log(`   • Pasif: ${pasif} kişi`);

    // Şube dağılımı
    console.log(`\n🏢 ŞUBE DAĞILIMI:`);
    const subeDagilim = {};
    users.forEach(user => {
        const subeAdi = user.sube ? user.sube.ad : 'Şubesiz';
        subeDagilim[subeAdi] = (subeDagilim[subeAdi] || 0) + 1;
    });

    Object.entries(subeDagilim).forEach(([sube, sayi]) => {
        console.log(`   • ${sube}: ${sayi} kişi`);
    });

    // SGK durumu
    const sgkVar = users.filter(u => u.sgkDurumu === 'VAR').length;
    const sgkYok = users.filter(u => u.sgkDurumu === 'YOK').length;

    console.log(`\n💼 SGK DURUMU:`);
    console.log(`   • SGK Var: ${sgkVar} kişi`);
    console.log(`   • SGK Yok: ${sgkYok} kişi`);

    // Örnek personel bilgileri
    console.log(`\n👤 ÖRNEK PERSONEL BİLGİLERİ:`);
    users.slice(0, 5).forEach(user => {
        console.log(`   • ${user.ad} (${user.username})`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Şube: ${user.sube ? user.sube.ad : 'Şubesiz'}`);
        console.log(`     Durum: ${user.aktif ? 'Aktif' : 'Pasif'}`);
        console.log(`     Ücret: ${user.gunlukUcret} TL/gün`);
        console.log('');
    });

    console.log('✅ PERSONEL VERİLERİ KONTROLÜ TAMAMLANDI!');
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 