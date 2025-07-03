const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🚚 TESLİMAT TÜRLERİ VE DİĞER VERİLER YÜKLENİYOR...\n');

    try {
        // Teslimat türleri
        const teslimatTurleri = [
            {
                ad: 'Adrese Teslimat',
                kod: 'ADRES',
                aciklama: 'Kargo ile adrese teslimat',
                varsayilanKargo: 'MNG Kargo',
                ekstraMaliyet: 25,
                aktif: true,
                siraNo: 1
            },
            {
                ad: 'Şubeden Al',
                kod: 'SUBE_AL',
                aciklama: 'Müşteri şubeden teslim alır',
                ekstraMaliyet: 0,
                aktif: true,
                siraNo: 2
            },
            {
                ad: 'Şubeden Şubeye',
                kod: 'SUBE_SUBE',
                aciklama: 'Şubeden başka şubeye transfer',
                ekstraMaliyet: 15,
                aktif: true,
                siraNo: 3
            },
            {
                ad: 'Express Teslimat',
                kod: 'EXPRESS',
                aciklama: 'Aynı gün hızlı teslimat',
                varsayilanKargo: 'Yurtiçi Express',
                ekstraMaliyet: 50,
                aktif: true,
                siraNo: 4
            },
            {
                ad: 'Toplu Teslimat',
                kod: 'TOPLU',
                aciklama: 'Büyük siparişler için özel teslimat',
                ekstraMaliyet: 100,
                aktif: true,
                siraNo: 5
            },
            {
                ad: 'Ücretsiz Teslimat',
                kod: 'UCRETSIZ',
                aciklama: 'Belirli tutarın üzerinde ücretsiz',
                ekstraMaliyet: 0,
                aktif: true,
                siraNo: 6
            }
        ];

        console.log('🚚 Teslimat türleri ekleniyor...');
        for (const teslimat of teslimatTurleri) {
            await prisma.teslimatTuru.upsert({
                where: { kod: teslimat.kod },
                update: teslimat,
                create: teslimat
            });
        }
        console.log(`✅ ${teslimatTurleri.length} teslimat türü eklendi`);

        // Şubeler (eğer sadece 1 varsa diğerlerini ekle)
        const mevcutSubeSayisi = await prisma.sube.count();
        if (mevcutSubeSayisi < 5) {
            const subeler = [
                {
                    ad: 'Merkez Şube',
                    kod: 'MERKEZ',
                    adres: 'Atatürk Cad. No:123 Merkez/İstanbul',
                    telefon: '0212 555 0101',
                    email: 'merkez@ogform.com',
                    mudur: 'Ahmet Yılmaz',
                    aktif: true,
                    siraNo: 1
                },
                {
                    ad: 'Kadıköy Şube',
                    kod: 'KADIKOY',
                    adres: 'Bağdat Cad. No:456 Kadıköy/İstanbul',
                    telefon: '0216 555 0202',
                    email: 'kadikoy@ogform.com',
                    mudur: 'Mehmet Demir',
                    aktif: true,
                    siraNo: 2
                },
                {
                    ad: 'Beylikdüzü Şube',
                    kod: 'BEYLIKDUZU',
                    adres: 'E-5 Karayolu No:789 Beylikdüzü/İstanbul',
                    telefon: '0212 555 0303',
                    email: 'beylikduzu@ogform.com',
                    mudur: 'Ayşe Kaya',
                    aktif: true,
                    siraNo: 3
                },
                {
                    ad: 'Ankara Şube',
                    kod: 'ANKARA',
                    adres: 'Kızılay Meydan No:321 Çankaya/Ankara',
                    telefon: '0312 555 0404',
                    email: 'ankara@ogform.com',
                    mudur: 'Ali Özkan',
                    aktif: true,
                    siraNo: 4
                },
                {
                    ad: 'İzmir Şube',
                    kod: 'IZMIR',
                    adres: 'Alsancak Kordon No:654 Konak/İzmir',
                    telefon: '0232 555 0505',
                    email: 'izmir@ogform.com',
                    mudur: 'Fatma Çelik',
                    aktif: true,
                    siraNo: 5
                }
            ];

            console.log('\n🏢 Ek şubeler ekleniyor...');
            for (const sube of subeler) {
                await prisma.sube.upsert({
                    where: { kod: sube.kod },
                    update: sube,
                    create: sube
                });
            }
            console.log(`✅ ${subeler.length} şube eklendi`);
        }

        // Kullanıcılar (admin hesabı)
        const adminVarMi = await prisma.user.findFirst({
            where: { email: 'admin@ogform.com' }
        });

        if (!adminVarMi) {
            console.log('\n👤 Admin kullanıcısı ekleniyor...');
            await prisma.user.create({
                data: {
                    email: 'admin@ogform.com',
                    username: 'admin',
                    passwordHash: '$2b$10$sample.hash.for.testing', // Test amaçlı
                    ad: 'System',
                    soyad: 'Admin',
                    role: 'ADMIN',
                    aktif: true,
                    telefon: '0555 123 4567'
                }
            });
            console.log('✅ Admin kullanıcısı eklendi');
        }

        // Final durum raporu
        const [teslimatSayisi, subeSayisi, urunSayisi, ambalajSayisi] = await Promise.all([
            prisma.teslimatTuru.count(),
            prisma.sube.count(),
            prisma.urun.count(),
            prisma.ambalaj.count()
        ]);

        console.log('\n📊 SİSTEM VERİLERİ DURUMU:');
        console.log(`   ✅ ${teslimatSayisi} teslimat türü`);
        console.log(`   ✅ ${subeSayisi} şube`);
        console.log(`   ✅ ${urunSayisi} ürün`);
        console.log(`   ✅ ${ambalajSayisi} ambalaj türü`);

        console.log('\n🎉 TÜM TEMEL VERİLER HAZIR!');

    } catch (error) {
        console.error('❌ HATA:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 