const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestCari() {
    try {
        console.log('🆕 Test carisi oluşturuluyor...\n');

        // Test carisi oluştur
        const testCari = await prisma.cari.create({
            data: {
                ad: 'Test Müşteri Adres',
                musteriKodu: `TEST${Date.now()}`,
                telefon: '05551234567',
                email: 'test@example.com',
                adresler: {
                    create: [
                        {
                            tip: 'Ev',
                            adres: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:123, Çankaya/Ankara'
                        },
                        {
                            tip: 'İş',
                            adres: 'Kızılay Meydanı, İş Merkezi Kat:5 No:12, Çankaya/Ankara'
                        },
                        {
                            tip: 'Diğer',
                            adres: 'Bahçelievler Mahallesi, Barış Sokak No:45, Etimesgut/Ankara'
                        }
                    ]
                }
            },
            include: { adresler: true }
        });

        console.log('✅ Test carisi oluşturuldu:');
        console.log(`   ID: ${testCari.id}`);
        console.log(`   Ad: ${testCari.ad}`);
        console.log(`   Müşteri Kodu: ${testCari.musteriKodu}`);
        console.log(`   Telefon: ${testCari.telefon}`);
        console.log(`   Email: ${testCari.email}`);
        console.log(`   Adres sayısı: ${testCari.adresler.length}\n`);

        console.log('📍 Adresler:');
        testCari.adresler.forEach((adres, index) => {
            console.log(`   ${index + 1}. ${adres.tip}: ${adres.adres}`);
        });

        // Frontend formatına dönüştür
        console.log('\n🔄 Frontend formatına dönüştürme:');
        const cariAdresler = testCari.adresler.map(a => ({
            adres: a.adres,
            tip: a.tip,
            adresGosterim: a.tip ? `${a.tip}: ${a.adres}` : a.adres
        }));

        console.log('📤 Frontend formatı:');
        cariAdresler.forEach((adres, index) => {
            console.log(`   ${index + 1}. Tip: "${adres.tip}"`);
            console.log(`      Adres: "${adres.adres}"`);
            console.log(`      Gösterim: "${adres.adresGosterim}"`);
            console.log('');
        });

        // İlk adresin seçilmesi simülasyonu
        if (cariAdresler.length > 0) {
            const selectedAdres = cariAdresler[0].adres;
            const formAdres = cariAdresler[0].adres;

            console.log('✅ Adres seçimi simülasyonu:');
            console.log(`   selectedAdres: "${selectedAdres}"`);
            console.log(`   form.adres: "${formAdres}"`);
            console.log(`   Tip: ${typeof selectedAdres}`);
            console.log(`   Uzunluk: ${selectedAdres.length}`);

            if (selectedAdres.includes('[object Object]')) {
                console.log('❌ SORUN: [object Object] tespit edildi!');
            } else {
                console.log('✅ Adres düzgün string formatında');
            }
        }

        // Dropdown API formatını test et
        console.log('\n🔧 Dropdown API formatı:');
        const dropdownFormat = {
            id: testCari.id,
            ad: testCari.ad,
            telefon: testCari.telefon ? String(testCari.telefon) : '',
            adresler: Array.isArray(testCari.adresler) ? testCari.adresler : []
        };

        console.log('📤 Dropdown formatı:');
        console.log(JSON.stringify(dropdownFormat, null, 2));

        console.log('\n🎉 Test başarılı! Cari ID:', testCari.id);
        console.log('Bu cariyi sipariş formunda test edebilirsiniz.');

    } catch (error) {
        console.error('❌ Hata:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

createTestCari(); 