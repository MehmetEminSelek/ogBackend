// ===================================================================
// 🌱 ÖMER GÜLLÜ SİSTEMİ - ANA SEED DOSYASI
// Tüm CSV verilerini sıralı olarak veritabanına yükler
// ===================================================================

const { PrismaClient } = require('@prisma/client');

// Seed modülleri
const { seedPersonelBilgileri } = require('./seed-personel-bilgileri');
const { seedOdemeYontemleri } = require('./odeme-yontemleri');
const { seedSubeOperasyonBirimleri } = require('./sube-operasyon-birimleri');
const { seedReceteler } = require('./receteler');
const { seedHammadeYariMamuller } = require('./hammade-yari-mamuller');
const { seedGuncelUrunFiyatlari } = require('./guncel-urun-fiyatlari');
const { seedSiparisDropdownListeleri } = require('./siparis-dropdown-listeleri');
const { seedCariMusteriler } = require('./seed-cari-musteriler');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Ömer Güllü Sistemi - Toplu Seed İşlemi Başlatılıyor...\n');

    try {
        // 1. Temel Veriler
        console.log('1️⃣ Temel veriler yükleniyor...');
        await seedPersonelBilgileri();
        await seedOdemeYontemleri();
        await seedSubeOperasyonBirimleri();

        // 2. Ürün ve Malzeme Verileri
        console.log('\n2️⃣ Ürün ve malzeme verileri yükleniyor...');
        await seedHammadeYariMamuller();
        await seedGuncelUrunFiyatlari();
        await seedReceteler();

        // 3. Sipariş Sistemi Verileri
        console.log('\n3️⃣ Sipariş sistemi verileri yükleniyor...');
        await seedSiparisDropdownListeleri();

        // 4. Müşteri Verileri
        console.log('\n4️⃣ Müşteri verileri yükleniyor...');
        await seedCariMusteriler();

        console.log('\n🎉 TÜM SEED İŞLEMLERİ BAŞARIYLA TAMAMLANDI!');
        console.log('📊 Sistem kullanıma hazır.');

    } catch (error) {
        console.error('\n❌ Seed işlemi sırasında hata oluştu:', error);
        throw error;
    }
}

// Ana seed fonksiyonu
main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

module.exports = { main }; 