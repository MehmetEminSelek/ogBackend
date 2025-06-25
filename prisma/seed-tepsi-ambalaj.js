const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 TEPSİ/TAVA VE AMBALAJ VERİLERİ YÜKLENİYOR...\n');

    // 1️⃣ TEPSİ/TAVA VERİLERİ
    console.log('🍽️ Tepsi/Tava verileri ekleniyor...');
    const tepsiTavalar = await Promise.all([
        prisma.tepsiTava.create({
            data: {
                ad: '1 Li Tava',
                kod: 'TP001',
                fiyat: 100,
                boyut: 'Medium',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '1 litrelik tava'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '1 Li Tepsi',
                kod: 'TP002',
                fiyat: 150,
                boyut: 'Medium',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '1 litrelik tepsi'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '1,5 Lu Tava',
                kod: 'TP003',
                fiyat: 200,
                boyut: 'Large',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '1,5 litrelik tava'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '1,5 Lu Tepsi',
                kod: 'TP004',
                fiyat: 80,
                boyut: 'Large',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '1,5 litrelik tepsi'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '1000 Lik Tava',
                kod: 'TP005',
                fiyat: 110,
                boyut: 'Medium',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '1000 ml tava'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '2 Li Tava',
                kod: 'TP006',
                fiyat: 90,
                boyut: 'Large',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '2 litrelik tava'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '2 Li Tepsi',
                kod: 'TP007',
                fiyat: 180,
                boyut: 'Large',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '2 litrelik tepsi'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '2,5 Lu Tepsi',
                kod: 'TP008',
                fiyat: 70,
                boyut: 'XLarge',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '2,5 litrelik tepsi'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '3 Lü Tepsi',
                kod: 'TP009',
                fiyat: 70,
                boyut: 'XLarge',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '3 litrelik tepsi'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '4 Lü Tepsi',
                kod: 'TP010',
                fiyat: 130,
                boyut: 'XXLarge',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '4 litrelik tepsi'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '5 Li Tepsi',
                kod: 'TP011',
                fiyat: 250,
                boyut: 'XXLarge',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '5 litrelik tepsi'
            }
        }),
        prisma.tepsiTava.create({
            data: {
                ad: '800 Lük Tava',
                kod: 'TP012',
                fiyat: 140,
                boyut: 'Small',
                malzeme: 'Aluminum',
                aktif: true,
                aciklama: '800 ml tava'
            }
        })
    ]);
    console.log(`✅ ${tepsiTavalar.length} tepsi/tava eklendi`);

    // 2️⃣ KUTU VERİLERİ
    console.log('📦 Kutu verileri ekleniyor...');
    const kutular = await Promise.all([
        prisma.kutu.create({
            data: {
                ad: '1 Kg Kare Kutusu',
                kod: 'KT001',
                fiyat: 15,
                boyutlar: { en: 20, boy: 20, yukseklik: 10 },
                aktif: true,
                aciklama: '1 kg kapasiteli kare kutu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '1 Kg Kutu',
                kod: 'KT002',
                fiyat: 12,
                boyutlar: { en: 25, boy: 15, yukseklik: 8 },
                aktif: true,
                aciklama: '1 kg kapasiteli kutu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '1 Kg POŞET TF',
                kod: 'KT003',
                fiyat: 8,
                aktif: true,
                aciklama: '1 kg poşet takı fırını'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '1 Kg TAHTA TF Kutusu',
                kod: 'KT004',
                fiyat: 25,
                boyutlar: { en: 22, boy: 18, yukseklik: 12 },
                aktif: true,
                aciklama: '1 kg tahta takı fırını kutusu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '1 Kg TF Kutusu',
                kod: 'KT005',
                fiyat: 18,
                boyutlar: { en: 20, boy: 16, yukseklik: 10 },
                aktif: true,
                aciklama: '1 kg takı fırını kutusu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '1,5 Kg Kutu',
                kod: 'KT006',
                fiyat: 20,
                boyutlar: { en: 28, boy: 18, yukseklik: 10 },
                aktif: true,
                aciklama: '1,5 kg kapasiteli kutu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '250 gr Kutu',
                kod: 'KT007',
                fiyat: 5,
                boyutlar: { en: 12, boy: 8, yukseklik: 5 },
                aktif: true,
                aciklama: '250 gram kapasiteli kutu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '500 gr Kare Kutusu',
                kod: 'KT008',
                fiyat: 8,
                boyutlar: { en: 15, boy: 15, yukseklik: 6 },
                aktif: true,
                aciklama: '500 gram kare kutu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '500 gr Kutu',
                kod: 'KT009',
                fiyat: 7,
                boyutlar: { en: 18, boy: 12, yukseklik: 6 },
                aktif: true,
                aciklama: '500 gram kapasiteli kutu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '500 gr POŞET TF',
                kod: 'KT010',
                fiyat: 4,
                aktif: true,
                aciklama: '500 gram poşet takı fırını'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '500 gr TAHTA TF Kutusu',
                kod: 'KT011',
                fiyat: 15,
                boyutlar: { en: 16, boy: 12, yukseklik: 8 },
                aktif: true,
                aciklama: '500 gram tahta takı fırını kutusu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '500 gr TF Kutusu',
                kod: 'KT012',
                fiyat: 10,
                boyutlar: { en: 15, boy: 10, yukseklik: 6 },
                aktif: true,
                aciklama: '500 gram takı fırını kutusu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: '750 gr Kutu',
                kod: 'KT013',
                fiyat: 10,
                boyutlar: { en: 20, boy: 14, yukseklik: 7 },
                aktif: true,
                aciklama: '750 gram kapasiteli kutu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: 'Tekli HD Kutusu',
                kod: 'KT014',
                fiyat: 3,
                boyutlar: { en: 8, boy: 6, yukseklik: 4 },
                aktif: true,
                aciklama: 'Tekli hediye kutusu'
            }
        }),
        prisma.kutu.create({
            data: {
                ad: 'Tekli Kare Kutusu',
                kod: 'KT015',
                fiyat: 3,
                boyutlar: { en: 8, boy: 8, yukseklik: 4 },
                aktif: true,
                aciklama: 'Tekli kare kutu'
            }
        })
    ]);
    console.log(`✅ ${kutular.length} kutu eklendi`);

    // 3️⃣ AMBALAJ VERİLERİ
    console.log('📦 Ambalaj verileri ekleniyor...');
    const ambalajlar = await Promise.all([
        prisma.ambalaj.create({
            data: {
                ad: 'Kutu',
                kod: 'AM001',
                fiyat: 5,
                aktif: true,
                aciklama: 'Genel kutu ambalajı'
            }
        }),
        prisma.ambalaj.create({
            data: {
                ad: 'Tepsi/Tava',
                kod: 'AM002',
                fiyat: 10,
                aktif: true,
                aciklama: 'Tepsi ve tava ambalajları'
            }
        })
    ]);
    console.log(`✅ ${ambalajlar.length} ambalaj türü eklendi`);

    console.log(`\n🎉 TOPLAM EKLENEN VERİLER:`);
    console.log(`   • ${tepsiTavalar.length} tepsi/tava`);
    console.log(`   • ${kutular.length} kutu`);
    console.log(`   • ${ambalajlar.length} ambalaj türü`);
    console.log(`\n✅ TEPSİ/TAVA VE AMBALAJ VERİLERİ BAŞARIYLA YÜKLENDİ!`);
}

main()
    .catch((e) => {
        console.error('❌ Seed hatası:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 