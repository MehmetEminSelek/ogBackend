// ===================================================================
// 📦 KUTU SEED SCRIPT
// CSV'den kutu verilerini kaydetme
// ===================================================================

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * CSV'den alınan kutu verileri
 */
const kutuData = [
    {
        ad: '1 Kg Kare Kutusu',
        kod: 'KT001',
        aciklama: '1 kilogram kapasiteli kare kutu',
        fiyat: 5.00,
        agirlik: 50, // gram
        boyutlar: { en: 15, boy: 15, yukseklik: 8 },
        aktif: true
    },
    {
        ad: '1 Kg Kutu',
        kod: 'KT002',
        aciklama: '1 kilogram kapasiteli standart kutu',
        fiyat: 4.50,
        agirlik: 45,
        boyutlar: { en: 20, boy: 10, yukseklik: 6 },
        aktif: true
    },
    {
        ad: '1 Kg POŞET TF',
        kod: 'KT003',
        aciklama: '1 kilogram poşet türü kutu',
        fiyat: 2.00,
        agirlik: 20,
        boyutlar: { en: 25, boy: 15, yukseklik: 3 },
        aktif: true
    },
    {
        ad: '1 Kg TAHTA TF Kutusu',
        kod: 'KT004',
        aciklama: '1 kilogram tahta görünümlü kutu',
        fiyat: 8.00,
        agirlik: 80,
        boyutlar: { en: 18, boy: 12, yukseklik: 7 },
        aktif: true
    },
    {
        ad: '1 Kg TF Kutusu',
        kod: 'KT005',
        aciklama: '1 kilogram TF kutusu',
        fiyat: 6.00,
        agirlik: 55,
        boyutlar: { en: 16, boy: 16, yukseklik: 6 },
        aktif: true
    },
    {
        ad: '1,5 Kg Kutu',
        kod: 'KT006',
        aciklama: '1.5 kilogram kapasiteli kutu',
        fiyat: 7.00,
        agirlik: 70,
        boyutlar: { en: 22, boy: 12, yukseklik: 8 },
        aktif: true
    },
    {
        ad: '250 gr Kutu',
        kod: 'KT007',
        aciklama: '250 gram kapasiteli küçük kutu',
        fiyat: 2.50,
        agirlik: 25,
        boyutlar: { en: 10, boy: 10, yukseklik: 4 },
        aktif: true
    },
    {
        ad: '500 gr Kare Kutusu',
        kod: 'KT008',
        aciklama: '500 gram kapasiteli kare kutu',
        fiyat: 3.50,
        agirlik: 35,
        boyutlar: { en: 12, boy: 12, yukseklik: 6 },
        aktif: true
    },
    {
        ad: '500 gr Kutu',
        kod: 'KT009',
        aciklama: '500 gram kapasiteli standart kutu',
        fiyat: 3.00,
        agirlik: 30,
        boyutlar: { en: 15, boy: 10, yukseklik: 5 },
        aktif: true
    },
    {
        ad: '500 gr POŞET TF',
        kod: 'KT010',
        aciklama: '500 gram poşet türü kutu',
        fiyat: 1.50,
        agirlik: 15,
        boyutlar: { en: 20, boy: 12, yukseklik: 2 },
        aktif: true
    },
    {
        ad: '500 gr TAHTA TF Kutusu',
        kod: 'KT011',
        aciklama: '500 gram tahta görünümlü kutu',
        fiyat: 6.00,
        agirlik: 60,
        boyutlar: { en: 14, boy: 10, yukseklik: 6 },
        aktif: true
    },
    {
        ad: '500 gr TF Kutusu',
        kod: 'KT012',
        aciklama: '500 gram TF kutusu',
        fiyat: 4.00,
        agirlik: 40,
        boyutlar: { en: 13, boy: 13, yukseklik: 5 },
        aktif: true
    },
    {
        ad: '750 gr Kutu',
        kod: 'KT013',
        aciklama: '750 gram kapasiteli kutu',
        fiyat: 4.50,
        agirlik: 45,
        boyutlar: { en: 18, boy: 11, yukseklik: 6 },
        aktif: true
    },
    {
        ad: 'Tekli HD Kutusu',
        kod: 'KT014',
        aciklama: 'Tekli hediye kutusu',
        fiyat: 3.50,
        agirlik: 35,
        boyutlar: { en: 8, boy: 8, yukseklik: 4 },
        aktif: true
    },
    {
        ad: 'Tekli Kare Kutusu',
        kod: 'KT015',
        aciklama: 'Tekli kare kutu',
        fiyat: 3.00,
        agirlik: 30,
        boyutlar: { en: 9, boy: 9, yukseklik: 5 },
        aktif: true
    }
];

/**
 * Ana seed fonksiyonu
 */
async function main() {
    console.log('📦 KUTU SEED İŞLEMİ BAŞLIYOR...\n');

    let eklenen = 0;
    let guncellenen = 0;
    let hatalar = 0;

    try {
        console.log('📊 Mevcut kutular kontrol ediliyor...');
        const mevcutSayisi = await prisma.kutu.count();
        console.log(`   📋 Mevcut kayıt sayısı: ${mevcutSayisi}\n`);

        // Her kutuyu işle
        for (const kutu of kutuData) {
            try {
                console.log(`📦 ${kutu.ad} (${kutu.kod}) işleniyor...`);

                // Mevcut kayıt var mı kontrol et
                const existingKutu = await prisma.kutu.findUnique({
                    where: { kod: kutu.kod }
                });

                if (existingKutu) {
                    console.log(`   ℹ️  ${kutu.ad} (${kutu.kod}) zaten mevcut - güncelleniyor`);

                    // Güncelle
                    await prisma.kutu.update({
                        where: { kod: kutu.kod },
                        data: {
                            ad: kutu.ad,
                            aciklama: kutu.aciklama,
                            fiyat: kutu.fiyat,
                            agirlik: kutu.agirlik,
                            boyutlar: kutu.boyutlar,
                            aktif: kutu.aktif
                        }
                    });

                    guncellenen++;
                } else {
                    console.log(`   ✅ ${kutu.ad} (${kutu.kod}) oluşturuluyor`);

                    // Yeni oluştur
                    await prisma.kutu.create({
                        data: {
                            ad: kutu.ad,
                            kod: kutu.kod,
                            aciklama: kutu.aciklama,
                            fiyat: kutu.fiyat,
                            agirlik: kutu.agirlik,
                            boyutlar: kutu.boyutlar,
                            aktif: kutu.aktif
                        }
                    });

                    eklenen++;
                }

                console.log(`   💰 Fiyat: ${kutu.fiyat} TL`);
                console.log(`   ⚖️  Ağırlık: ${kutu.agirlik} gr`);
                console.log(`   📏 Boyutlar: ${kutu.boyutlar.en}x${kutu.boyutlar.boy}x${kutu.boyutlar.yukseklik} cm`);
                console.log(`   ✅ Aktif: ${kutu.aktif ? 'Evet' : 'Hayır'}\n`);

            } catch (error) {
                console.error(`❌ ${kutu.ad} kaydedilirken hata:`, error.message);
                hatalar++;
            }
        }

        // Final durum kontrolü
        console.log('📊 KAYIT DURUMU KONTROLÜ:');

        const kutular = await prisma.kutu.findMany({
            where: { aktif: true },
            select: { kod: true, ad: true, fiyat: true, agirlik: true },
            orderBy: { kod: 'asc' }
        });

        console.log(`\n📦 AKTİF KUTULAR (${kutular.length} adet):`);
        kutular.forEach(k => {
            console.log(`   • ${k.kod}: ${k.ad} (${k.fiyat} TL, ${k.agirlik}gr)`);
        });

        // Kategorilere ayır
        const kucukKutular = kutular.filter(k => k.ad.includes('250 gr') || k.ad.includes('Tekli'));
        const ortaKutular = kutular.filter(k => k.ad.includes('500 gr') || k.ad.includes('750 gr'));
        const buyukKutular = kutular.filter(k => k.ad.includes('1 Kg') || k.ad.includes('1,5 Kg'));

        console.log(`\n📦 BOYUT KATEGORİLERİ:`);
        console.log(`   🔸 Küçük kutular (≤500gr): ${kucukKutular.length} adet`);
        console.log(`   🔶 Orta kutular (500-750gr): ${ortaKutular.length} adet`);
        console.log(`   🔷 Büyük kutular (≥1kg): ${buyukKutular.length} adet`);

        // Fiyat analizi
        const ortalmaFiyat = kutular.reduce((sum, k) => sum + k.fiyat, 0) / kutular.length;
        const enUcuz = kutular.reduce((min, k) => k.fiyat < min.fiyat ? k : min);
        const enPahali = kutular.reduce((max, k) => k.fiyat > max.fiyat ? k : max);

        console.log(`\n💰 FİYAT ANALİZİ:`);
        console.log(`   📊 Ortalama fiyat: ${ortalmaFiyat.toFixed(2)} TL`);
        console.log(`   🔽 En ucuz: ${enUcuz.ad} (${enUcuz.fiyat} TL)`);
        console.log(`   🔼 En pahalı: ${enPahali.ad} (${enPahali.fiyat} TL)`);

        // Final özet
        console.log('\n🎉 KUTU SEED İŞLEMİ TAMAMLANDI!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Yeni eklenen: ${eklenen}`);
        console.log(`🔄 Güncellenen: ${guncellenen}`);
        console.log(`❌ Hata sayısı: ${hatalar}`);
        console.log(`📋 Toplam aktif kutu: ${kutular.length}`);
        console.log(`💰 Toplam kutu değeri: ${kutular.reduce((sum, k) => sum + k.fiyat, 0).toFixed(2)} TL`);

    } catch (error) {
        console.error('❌ Fatal Hata:', error);
        process.exit(1);
    }
}

// Script'i çalıştır
main()
    .catch((e) => {
        console.error('❌ Fatal Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 