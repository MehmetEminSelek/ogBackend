const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// CSV parsing function
function parseCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index] ? values[index].trim() : null;
        });
        return obj;
    });
}

// Telefon numarası temizleme ve doğrulama
function cleanPhoneNumber(phone) {
    if (!phone) return null;

    // Sadece rakamları al
    const cleaned = phone.replace(/\D/g, '');

    // Türk telefon numarası formatı: 5XX XXX XXXX (10 haneli) veya +90 5XX XXX XXXX
    if (cleaned.length === 10 && cleaned.startsWith('5')) {
        return cleaned;
    } else if (cleaned.length === 13 && cleaned.startsWith('905')) {
        return cleaned.substring(2); // +90 kısmını kaldır
    } else if (cleaned.length === 12 && cleaned.startsWith('90')) {
        return cleaned.substring(2); // 90 kısmını kaldır
    }

    return cleaned.length >= 10 ? cleaned : null;
}

// Müşteri tipini belirleme
function determineCariTipi(cariAdi, cariGrubu) {
    const companyKeywords = [
        'LTD', 'ŞTİ', 'A.Ş', 'A.S', 'SAN.', 'TİC.', 'İNŞAAT', 'TEKSTİL',
        'GIDA', 'MARKET', 'SÜPERMARKET', 'OTEL', 'RESTORAN', 'KARGO',
        'BANKANESİ', 'HASTANESİ', 'MÜDÜRLÜĞÜ', 'BELEDİYE', 'HOLDING',
        'GRUP', 'SİSTEM', 'TİCARET', 'SANAYİ', 'PLASTİK', 'AMBALAJ'
    ];

    const upperCariAdi = cariAdi.toUpperCase();

    if (companyKeywords.some(keyword => upperCariAdi.includes(keyword))) {
        return 'KURUMSAL';
    }

    return 'BIREYSEL';
}

// Müşteri segmenti belirleme
function determineMusteriSegmenti(cariGrubu, cariAdi) {
    if (cariGrubu) return cariGrubu;

    // Kurumsal müşteriler için özel segment
    const upperCariAdi = cariAdi.toUpperCase();
    if (upperCariAdi.includes('HOLDING') || upperCariAdi.includes('BANK')) {
        return 'Premium';
    } else if (upperCariAdi.includes('BELEDİYE') || upperCariAdi.includes('MÜDÜRLÜĞÜ')) {
        return 'Kurumsal';
    }

    return 'Standart';
}

// İsim ve soyisim ayırma
function splitName(fullName) {
    if (!fullName) return { ad: null, soyad: null };

    const parts = fullName.trim().split(' ');
    if (parts.length === 1) {
        return { ad: parts[0], soyad: null };
    } else if (parts.length === 2) {
        return { ad: parts[0], soyad: parts[1] };
    } else {
        // 3 veya daha fazla kelime varsa, ilk kelime ad, geri kalan soyad
        return {
            ad: parts[0],
            soyad: parts.slice(1).join(' ')
        };
    }
}

async function seedCariler() {
    console.log('🚀 Cari seeding başlıyor...');

    try {
        // Önce mevcut carileri temizle (opsiyonel)
        console.log('🗑️  Mevcut cariler temizleniyor...');
        await prisma.cariOdeme.deleteMany({});
        await prisma.cariHareket.deleteMany({});
        await prisma.cari.deleteMany({});

        // CSV dosyasını oku
        const csvPath = path.join(__dirname, '../../veriler/Kurallar ve kodlar.xlsx - Cari Müşteri Kodları.csv');
        console.log('📖 CSV dosyası okunuyor:', csvPath);

        if (!fs.existsSync(csvPath)) {
            throw new Error(`CSV dosyası bulunamadı: ${csvPath}`);
        }

        const csvData = parseCSV(csvPath);
        console.log(`📊 ${csvData.length} adet cari verisi bulundu`);

        // Şubeleri al (SALON şubesi yoksa oluştur)
        let salonSube = await prisma.sube.findUnique({
            where: { ad: 'SALON' }
        });

        if (!salonSube) {
            console.log('🏢 SALON şubesi oluşturuluyor...');
            salonSube = await prisma.sube.create({
                data: {
                    ad: 'SALON',
                    kod: 'SALON',
                    aktif: true,
                    siraNo: 1
                }
            });
        }

        // İstatistikler
        const stats = {
            success: 0,
            skipped: 0,
            errors: 0,
            bireysel: 0,
            kurumsal: 0,
            withPhone: 0
        };

        console.log('💾 Cariler kaydediliyor...');

        // Batch processing için
        const batchSize = 100;
        for (let i = 0; i < csvData.length; i += batchSize) {
            const batch = csvData.slice(i, i + batchSize);

            const createPromises = batch.map(async (row, index) => {
                try {
                    const globalIndex = i + index + 1;

                    // Gerekli alanları kontrol et
                    if (!row['CARİ ADI'] || !row['MÜŞTERİ KODU']) {
                        console.log(`⏭️  Satır ${globalIndex}: Eksik veriler, atlanıyor`);
                        stats.skipped++;
                        return null;
                    }

                    // İsim ayırma
                    const { ad, soyad } = splitName(row['CARİ ADI']);

                    // Telefon temizleme
                    const telefon = cleanPhoneNumber(row['TEL']);

                    // Tip belirleme
                    const tipi = determineCariTipi(row['CARİ ADI'], row['CARİ GRUBU']);

                    // Segment belirleme
                    const musteriSegmenti = determineMusteriSegmenti(row['CARİ GRUBU'], row['CARİ ADI']);

                    const cariData = {
                        musteriKodu: row['MÜŞTERİ KODU'],
                        ad: ad,
                        soyad: soyad || row['İRTİBAT ADI'] || null,
                        tipi: tipi,
                        telefon: telefon,
                        musteriSegmenti: musteriSegmenti,
                        subeId: salonSube.id,
                        aktif: true,
                        bakiye: 0,
                        riskGrubu: 'Normal',
                        vadeGunu: 30 // Varsayılan 30 gün vade
                    };

                    // Cariyi oluştur
                    const cari = await prisma.cari.create({
                        data: cariData
                    });

                    // İstatistikleri güncelle
                    stats.success++;
                    if (tipi === 'BIREYSEL') stats.bireysel++;
                    if (tipi === 'KURUMSAL') stats.kurumsal++;
                    if (telefon) stats.withPhone++;

                    if (globalIndex % 50 === 0) {
                        console.log(`📈 Progress: ${globalIndex}/${csvData.length} (${Math.round(globalIndex / csvData.length * 100)}%)`);
                    }

                    return cari;

                } catch (error) {
                    console.error(`❌ Satır ${i + index + 1} hatası:`, error.message);
                    stats.errors++;
                    return null;
                }
            });

            await Promise.all(createPromises);

            // Kısa bir bekleme (database yükünü azaltmak için)
            if (i + batchSize < csvData.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        console.log('\n🎉 Cari seeding tamamlandı!');
        console.log('📊 İstatistikler:');
        console.log(`   ✅ Başarılı: ${stats.success}`);
        console.log(`   ⏭️  Atlanan: ${stats.skipped}`);
        console.log(`   ❌ Hata: ${stats.errors}`);
        console.log(`   👤 Bireysel: ${stats.bireysel}`);
        console.log(`   🏢 Kurumsal: ${stats.kurumsal}`);
        console.log(`   📱 Telefonlu: ${stats.withPhone}`);

        // Toplam cari sayısını doğrula
        const totalCariler = await prisma.cari.count();
        console.log(`\n📋 Toplam kayıtlı cari sayısı: ${totalCariler}`);

    } catch (error) {
        console.error('💥 Seeding hatası:', error);
        throw error;
    }
}

// Eğer bu dosya doğrudan çalıştırılıyorsa
if (require.main === module) {
    seedCariler()
        .catch((e) => {
            console.error(e);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = { seedCariler }; 