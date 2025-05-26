// test-adres-secimi.js
// Adres seçimi sorununu test et

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAdresSecimi() {
    try {
        console.log('🔍 Adres seçimi sorunu test ediliyor...\n');

        // 1. Cari listesini kontrol et
        const cariler = await prisma.cari.findMany({
            include: {
                adresler: true
            },
            orderBy: { ad: 'asc' }
        });

        console.log(`📋 Toplam cari sayısı: ${cariler.length}\n`);

        // 2. Adresli carileri listele
        const adresliCariler = cariler.filter(c => c.adresler && c.adresler.length > 0);
        console.log(`🏠 Adresli cari sayısı: ${adresliCariler.length}\n`);

        if (adresliCariler.length > 0) {
            console.log('📍 Adresli cariler:');
            adresliCariler.forEach((cari, index) => {
                console.log(`\n${index + 1}. ${cari.ad} (ID: ${cari.id})`);
                console.log(`   📞 Telefon: ${cari.telefon || 'Yok'}`);
                console.log(`   📧 Email: ${cari.email || 'Yok'}`);
                console.log(`   🏠 Adresler (${cari.adresler.length}):`);

                cari.adresler.forEach((adres, adresIndex) => {
                    console.log(`      ${adresIndex + 1}. ${adres.tip}: ${adres.adres}`);
                });
            });
        }

        // 3. Dropdown API formatını test et
        console.log('\n🔧 Dropdown API formatı:');
        const dropdownFormat = cariler.map(item => ({
            id: item.id,
            ad: item.ad,
            telefon: item.telefon ? String(item.telefon) : '',
            adresler: Array.isArray(item.adresler) ? item.adresler : []
        }));

        console.log('📤 İlk 3 cari dropdown formatı:');
        dropdownFormat.slice(0, 3).forEach((cari, index) => {
            console.log(`\n${index + 1}. ${JSON.stringify(cari, null, 2)}`);
        });

        // 4. Adres seçimi simülasyonu
        console.log('\n🎯 Adres seçimi simülasyonu:');

        if (adresliCariler.length > 0) {
            const testCari = adresliCariler[0];
            console.log(`\n📝 Test carisi: ${testCari.ad}`);

            // Frontend'de yapılan işlemi simüle et
            const cariAdresler = testCari.adresler.map(a => ({
                adres: a.adres,
                tip: a.tip,
                adresGosterim: a.tip ? `${a.tip}: ${a.adres}` : a.adres
            }));

            console.log('🔄 Frontend formatına dönüştürülen adresler:');
            cariAdresler.forEach((adres, index) => {
                console.log(`   ${index + 1}. Tip: "${adres.tip}"`);
                console.log(`      Adres: "${adres.adres}"`);
                console.log(`      Gösterim: "${adres.adresGosterim}"`);
                console.log('');
            });

            // İlk adresin seçilmesi
            if (cariAdresler.length > 0) {
                const selectedAdres = cariAdresler[0].adres;
                const formAdres = cariAdresler[0].adres;

                console.log('✅ Seçilen adres:');
                console.log(`   selectedAdres: "${selectedAdres}"`);
                console.log(`   form.adres: "${formAdres}"`);

                // Object kontrolü
                if (typeof selectedAdres === 'object') {
                    console.log('❌ SORUN: selectedAdres bir object!');
                    console.log('   Object içeriği:', selectedAdres);
                } else {
                    console.log('✅ selectedAdres string formatında');
                }
            }
        }

        // 5. Yeni cari oluşturma testi
        console.log('\n🆕 Yeni cari oluşturma testi:');

        const testCariAdi = `Test Cari ${Date.now()}`;
        const yeniCari = await prisma.cari.create({
            data: {
                ad: testCariAdi,
                musteriKodu: `TC${Date.now()}`,
                telefon: '05551234567',
                adresler: {
                    create: [
                        { tip: 'Ev', adres: 'Test Ev Adresi, Ankara' },
                        { tip: 'İş', adres: 'Test İş Adresi, İstanbul' }
                    ]
                }
            },
            include: { adresler: true }
        });

        console.log('✅ Yeni cari oluşturuldu:');
        console.log(`   ID: ${yeniCari.id}`);
        console.log(`   Ad: ${yeniCari.ad}`);
        console.log(`   Telefon: ${yeniCari.telefon}`);
        console.log(`   Adres sayısı: ${yeniCari.adresler.length}`);

        yeniCari.adresler.forEach((adres, index) => {
            console.log(`   ${index + 1}. ${adres.tip}: ${adres.adres}`);
        });

        // Test carisini sil
        await prisma.cari.delete({
            where: { id: yeniCari.id }
        });
        console.log('🗑️ Test carisi silindi');

        console.log('\n🎉 Adres seçimi testi tamamlandı!');

    } catch (error) {
        console.error('❌ Test hatası:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

testAdresSecimi(); 