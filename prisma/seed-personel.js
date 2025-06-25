const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('👥 PERSONEL BİLGİLERİ YÜKLENİYOR...\n');

    // Şube eşleştirme haritası
    const subeMap = {
        'Salon': 'SB007',
        'Hava-1': 'SB001',
        'Hava-3': 'SB002',
        'İbrahimli': 'SB004',
        'Karagöz': 'SB005',
        'Otogar': 'SB006',
        'Hitit': 'SB003',
        'Üretim': 'OP004',
        'Fırın': 'OP004', // Üretim ile aynı
        'Şoför': 'OP001', // Ana Depo
        'Sevkiyat': 'OP003',
        'Cep Depo': 'OP002'
    };

    // Şube ID'lerini alalım
    const subeler = await prisma.sube.findMany();
    const getSubeId = (subeAdi) => {
        const subeKodu = subeMap[subeAdi];
        if (!subeKodu) return null;
        const sube = subeler.find(s => s.kod === subeKodu);
        return sube ? sube.id : null;
    };

    // Personel verileri
    const personelData = [
        { ad: 'ABDULLAH KÜÇÜK', sgk: 'YOK', giris: '2024-01-13', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 450 },
        { ad: 'ALEYNA YOLAL', sgk: 'VAR', giris: '2023-11-09', sube: 'Hava-1', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'ALİ İBRAHİM YILMAZ', sgk: 'VAR', giris: '2023-04-10', sube: 'Salon', durum: 'PASİF', rol: '', ucret: 490 },
        { ad: 'ALİM SELİM BAĞDATLI', sgk: 'VAR', giris: '2022-12-03', sube: 'Salon', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 800 },
        { ad: 'ARDA BOZKURT', sgk: 'VAR', giris: '2024-09-13', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 650 },
        { ad: 'ARİF KOLKIRAN', sgk: 'VAR', giris: '2022-11-27', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1000 },
        { ad: 'ARİF OKUTAN', sgk: 'VAR', giris: '2023-09-01', sube: 'Salon', durum: 'PASİF', rol: '', ucret: 800 },
        { ad: 'AYŞE KABALAR', sgk: 'VAR', giris: '2024-11-08', sube: 'İbrahimli', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 725 },
        { ad: 'BARIŞ GÜLLÜ', sgk: 'VAR', giris: '2022-12-03', sube: 'Genel Müdür', durum: 'AKTİF', rol: 'GENEL MÜDÜR', ucret: 0 },
        { ad: 'BARIŞ SEPET', sgk: 'VAR', giris: '2024-04-25', sube: 'İbrahimli', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1250 },
        { ad: 'BERKE CELAL AZGIN', sgk: 'VAR', giris: '2024-12-25', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 800 },
        { ad: 'BUSE YOLAL', sgk: 'VAR', giris: '2025-01-07', sube: 'İbrahimli', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 725 },
        { ad: 'CABBAR VURAL', sgk: 'VAR', giris: '2022-12-03', sube: 'İbrahimli', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 725 },
        { ad: 'CEBRAİL TUÇ', sgk: 'VAR', giris: '2022-11-26', sube: 'Hava-1', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 940 },
        { ad: 'CEMAL ARI', sgk: 'VAR', giris: '2022-11-27', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 1125 },
        { ad: 'CENGİZ EBREM', sgk: 'VAR', giris: '2022-11-24', sube: 'Üretim', durum: 'AKTİF', rol: 'ÜRETİM PERSONEL', ucret: 1685 },
        { ad: 'CEVAT GÜLLÜ', sgk: 'VAR', giris: '2022-12-03', sube: 'Yönetici', durum: 'AKTİF', rol: 'YÖNETİCİ', ucret: 0 },
        { ad: 'COŞKUN BAĞCI', sgk: 'YOK', giris: '2023-05-01', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'CUMA DOĞAN', sgk: 'VAR', giris: '2022-11-25', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1350 },
        { ad: 'CUMA ESİM', sgk: 'VAR', giris: '2022-11-27', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'CUMA KORKUT', sgk: 'VAR', giris: '2025-01-03', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1005 },
        { ad: 'EMİRHAN AZGIN', sgk: 'VAR', giris: '2022-12-03', sube: 'Karagöz', durum: 'PASİF', rol: '', ucret: 440 },
        { ad: 'EMRE İLDİZ', sgk: 'VAR', giris: '2022-11-25', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1355 },
        { ad: 'ENES MALİK KAYA', sgk: 'VAR', giris: '2022-11-27', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'ERCAN DALGIN', sgk: 'VAR', giris: '2022-11-25', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1350 },
        { ad: 'ERDAL BARAKLIOĞLU', sgk: 'VAR', giris: '2022-11-26', sube: 'Karagöz', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1625 },
        { ad: 'EYUP KADIOĞLU', sgk: 'VAR', giris: '2022-11-26', sube: 'Şoför', durum: 'PASİF', rol: '', ucret: 980 },
        { ad: 'FARUK BAĞDATLI', sgk: 'VAR', giris: '2022-11-25', sube: 'Salon', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1665 },
        { ad: 'FERZAN OLGUN', sgk: 'VAR', giris: '2022-11-25', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 1370 },
        { ad: 'FURKAN EFE SADIÇ', sgk: 'VAR', giris: '2023-12-13', sube: 'Salon', durum: 'PASİF', rol: '', ucret: 800 },
        { ad: 'GÖKAY GÜNER', sgk: 'VAR', giris: '2022-12-03', sube: 'Genel Müdür', durum: 'AKTİF', rol: 'GENEL MÜDÜR', ucret: 2940 },
        { ad: 'GÖKHAN KARADUMAN', sgk: 'VAR', giris: '2025-03-06', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 530 },
        { ad: 'HALİL KAYA', sgk: 'VAR', giris: '2022-11-24', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1490 },
        { ad: 'HALİL ORHAN', sgk: 'VAR', giris: '2023-03-14', sube: 'Fırın', durum: 'AKTİF', rol: 'SEVKİYAT MÜDÜRÜ', ucret: 2390 },
        { ad: 'HANİFİ BAĞDATLI', sgk: 'VAR', giris: '2022-12-03', sube: '', durum: 'PASİF', rol: '', ucret: 0 },
        { ad: 'HÜSEYİN ALKAN', sgk: 'VAR', giris: '2022-11-26', sube: 'Hava-1', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1245 },
        { ad: 'HÜSEYİN KILIÇ', sgk: 'VAR', giris: '2024-05-07', sube: 'Salon', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 940 },
        { ad: 'HÜSEYİN KUŞÇU', sgk: 'VAR', giris: '2022-11-26', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1090 },
        { ad: 'İBRAHİM HALİL ARIK', sgk: 'VAR', giris: '2024-08-14', sube: 'Karagöz', durum: 'PASİF', rol: '', ucret: 470 },
        { ad: 'İBRAHİM HALİL EKİNCİ', sgk: 'VAR', giris: '2022-11-25', sube: 'Fırın', durum: 'AKTİF', rol: 'SEVKİYAT PERSONELİ', ucret: 1445 },
        { ad: 'İBRAHİM HALİL KAYA', sgk: 'VAR', giris: '2022-12-03', sube: 'Salon', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 1070 },
        { ad: 'İBRAHİM HALİL TOKTAŞ', sgk: 'VAR', giris: '2022-11-27', sube: 'Şoför', durum: 'PASİF', rol: '', ucret: 940 },
        { ad: 'İBRAHİM İYİKASAP', sgk: 'VAR', giris: '2023-12-09', sube: 'İbrahimli', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 700 },
        { ad: 'İLHAN ARIK', sgk: 'VAR', giris: '2022-11-25', sube: 'Karagöz', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1030 },
        { ad: 'İLKAY KIZILGÖZ', sgk: 'VAR', giris: '2022-11-24', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1155 },
        { ad: 'İSMAİL KORKMAZ', sgk: 'VAR', giris: '2022-12-03', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1040 },
        { ad: 'İSRAFİL İSMAİL KILINÇ', sgk: 'VAR', giris: '2024-04-25', sube: 'Hava-3', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 940 },
        { ad: 'KADİR KURT', sgk: 'VAR', giris: '2022-11-26', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1220 },
        { ad: 'KEMAL ADANACIOĞLU', sgk: 'VAR', giris: '2024-07-23', sube: 'Hava-1', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1050 },
        { ad: 'KEMAL ANAR', sgk: 'VAR', giris: '2022-11-26', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 1070 },
        { ad: 'MEHMET ALİ ŞAHİN', sgk: 'VAR', giris: '2022-11-24', sube: 'Üretim', durum: 'AKTİF', rol: 'ÜRETİM MÜDÜRÜ', ucret: 2760 },
        { ad: 'MEHMET ALİ TİS', sgk: 'VAR', giris: '2022-11-26', sube: 'Salon', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1455 }
        // İlk 50 personel - devamı aşağıda
    ];

    // İkinci grup personel
    const personelData2 = [
        { ad: 'MEHMET BAĞCI', sgk: 'VAR', giris: '2023-03-14', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 1795 },
        { ad: 'MEHMET BOZKURT', sgk: 'VAR', giris: '2022-11-24', sube: 'Üretim', durum: 'AKTİF', rol: 'CEP DEPO MÜDÜRÜ', ucret: 875 },
        { ad: 'MEHMET DAĞLI', sgk: 'VAR', giris: '2024-09-23', sube: 'Hava-1', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'MEHMET DEVECİ', sgk: 'VAR', giris: '2022-03-11', sube: 'Hava-3', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 940 },
        { ad: 'MEHMET EFE YILMAZ', sgk: 'YOK', giris: '2021-09-02', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 530 },
        { ad: 'MEHMET FATİH BAYRAMOĞLU', sgk: 'VAR', giris: '2022-12-03', sube: 'Şoför', durum: 'PASİF', rol: '', ucret: 860 },
        { ad: 'MEHMET SERT', sgk: 'VAR', giris: '2022-11-27', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 910 },
        { ad: 'METE KOCA', sgk: 'YOK', giris: '2024-06-10', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 445 },
        { ad: 'METİN GÜDEMEZ', sgk: 'VAR', giris: '2022-12-03', sube: 'Şoför', durum: 'PASİF', rol: '', ucret: 860 },
        { ad: 'MİTHAT MERCAN', sgk: 'VAR', giris: '2022-11-24', sube: 'Karagöz', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 1055 },
        { ad: 'MUHAMMED KARATAŞ', sgk: 'VAR', giris: '2022-11-27', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1055 },
        { ad: 'MUHAMMET CELİL CEYLAN', sgk: 'VAR', giris: '2023-11-13', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 570 },
        { ad: 'MUHAMMET DOĞAN ÖZTOP', sgk: 'VAR', giris: '2023-09-21', sube: 'Karagöz', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 1030 },
        { ad: 'MUHAMMET ÖKKEŞ', sgk: 'YOK', giris: '2022-11-25', sube: 'Karagöz', durum: 'PASİF', rol: '', ucret: 460 },
        { ad: 'MURAT CAN DAHAN', sgk: 'VAR', giris: '2022-12-03', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 595 },
        { ad: 'MURAT ÇAPAR', sgk: 'VAR', giris: '2023-01-03', sube: 'Otogar', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 830 },
        { ad: 'MURAT KUTLAR', sgk: 'VAR', giris: '2024-10-01', sube: 'Şoför', durum: 'PASİF', rol: '', ucret: 830 },
        { ad: 'MURAT ÖZLEBLEBİCİ', sgk: 'VAR', giris: '2022-11-26', sube: 'Hava-1', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1415 },
        { ad: 'MUSTAFA ALACAN', sgk: 'VAR', giris: '2022-11-25', sube: 'İbrahimli', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1455 },
        { ad: 'MUSTAFA GÜNEŞ', sgk: 'VAR', giris: '2023-05-01', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 1110 },
        { ad: 'MUSTAFA NACİ GÜRSOY', sgk: 'VAR', giris: '2025-01-04', sube: 'Şoför', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'MUSTAFA ORHAN', sgk: 'VAR', giris: '2023-03-14', sube: 'Üretim', durum: 'AKTİF', rol: 'ÜRETİM MÜDÜRÜ', ucret: 2390 },
        { ad: 'MUSTAFA VURALKAN', sgk: 'VAR', giris: '2022-11-24', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1525 },
        { ad: 'OĞUZHAN DOĞRUER', sgk: 'VAR', giris: '2024-08-06', sube: 'Hitit', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 885 },
        { ad: 'ÖKKEŞ KARTAL', sgk: 'VAR', giris: '2022-12-03', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1095 },
        { ad: 'ÖMER KAYA', sgk: 'VAR', giris: '2022-11-24', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1040 },
        { ad: 'PINAR GÜLLÜ', sgk: 'VAR', giris: '2023-07-19', sube: '', durum: 'PASİF', rol: '', ucret: 0 },
        { ad: 'RECEP BOZKURT', sgk: 'VAR', giris: '2022-12-03', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 1040 },
        { ad: 'SENA KAPLAN', sgk: 'VAR', giris: '2025-02-28', sube: 'Hava-3', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 930 },
        { ad: 'SEZAİ FAKIOĞLU', sgk: 'VAR', giris: '2022-12-03', sube: 'Fırın', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'SUAT KÜSİN', sgk: 'VAR', giris: '2024-10-01', sube: 'Otogar', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1845 },
        { ad: 'ŞAHİN DEMİRDAĞ', sgk: 'VAR', giris: '2022-12-03', sube: '', durum: 'PASİF', rol: '', ucret: 0 },
        { ad: 'TAHA YASİN AZGIN', sgk: 'VAR', giris: '2022-11-29', sube: 'Hava-3', durum: 'PASİF', rol: '', ucret: 655 },
        { ad: 'TUĞBA KARTAL', sgk: 'VAR', giris: '2024-09-05', sube: 'Hava-3', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'TÜRKAN POLAT', sgk: 'VAR', giris: '2022-12-03', sube: 'Çayhane', durum: 'PASİF', rol: '', ucret: 775 },
        { ad: 'VAKKAS ERCEYLAN', sgk: 'VAR', giris: '2022-11-29', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 740 },
        { ad: 'VEYSEL KARANİ BAYRAM', sgk: 'VAR', giris: '2024-10-01', sube: 'Şoför', durum: 'PASİF', rol: '', ucret: 830 },
        { ad: 'YASEMİN KAYA', sgk: 'VAR', giris: '2025-03-01', sube: 'Otogar', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 675 },
        { ad: 'YASİN ÖZKARDEMLİ', sgk: 'VAR', giris: '2022-11-24', sube: 'Otogar', durum: 'AKTİF', rol: 'ŞUBE MÜDÜRÜ', ucret: 1050 },
        { ad: 'YUNUS İLDİZ', sgk: 'VAR', giris: '2022-11-25', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1455 },
        { ad: 'YUNUS UNCU', sgk: 'VAR', giris: '2022-11-26', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 1200 },
        { ad: 'YUSUF KAYA', sgk: 'YOK', giris: '2024-11-11', sube: 'Üretim', durum: 'PASİF', rol: '', ucret: 445 },
        { ad: 'ZEYNEP SÜMERÖZ', sgk: 'VAR', giris: '2022-11-27', sube: 'Yemekhane', durum: 'PASİF', rol: '', ucret: 775 },
        { ad: 'ARZU ARAS', sgk: 'VAR', giris: '2025-02-14', sube: 'Salon', durum: 'AKTİF', rol: 'ŞUBE PERSONELİ', ucret: 835 },
        { ad: 'HALİL İBRAHİM KUTLAR', sgk: 'VAR', giris: '2025-04-08', sube: 'Hava-1', durum: 'PASİF', rol: '', ucret: 740 }
    ];

    // Tüm personeli birleştir
    const tumPersonel = [...personelData, ...personelData2];

    console.log(`👥 ${tumPersonel.length} personel ekleniyor...`);

    // Varsayılan şifre hash'i
    const defaultPassword = await bcrypt.hash('12345', 10);

    let aktifCount = 0;
    let pasifCount = 0;
    let addedCount = 0;

    for (const personel of tumPersonel) {
        try {
            // Email ve username oluştur (Türkçe karakterleri İngilizce'ye çevir)
            const adNormalized = personel.ad
                .toLowerCase()
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c');

            const adParts = adNormalized.split(' ');
            const username = adParts.join('.');
            const email = `${username}@omergullu.com`;

            // Giriş yılını hesapla
            const girisYili = new Date(personel.giris).getFullYear();

            // Şube ID'sini bul
            const subeId = getSubeId(personel.sube);

            // Kullanıcı oluştur
            const user = await prisma.user.create({
                data: {
                    ad: personel.ad,
                    email: email,
                    username: username,
                    passwordHash: defaultPassword,
                    telefon: null,
                    role: 'ADMIN', // Tüm personel admin olarak
                    aktif: personel.durum === 'AKTİF',
                    subeId: subeId,
                    girisYili: girisYili,
                    gunlukUcret: personel.ucret,
                    sgkDurumu: personel.sgk
                }
            });

            if (personel.durum === 'AKTİF') aktifCount++;
            else pasifCount++;
            addedCount++;

            if (addedCount % 10 === 0) {
                console.log(`✅ ${addedCount} personel eklendi...`);
            }

        } catch (error) {
            console.log(`⚠️  ${personel.ad} eklenirken hata: ${error.message}`);
        }
    }

    console.log(`\n🎉 PERSONEL EKLEMİ TAMAMLANDI:`);
    console.log(`   • Toplam Eklenen: ${addedCount} personel`);
    console.log(`   • Aktif Personel: ${aktifCount} kişi`);
    console.log(`   • Pasif Personel: ${pasifCount} kişi`);
    console.log(`   • Varsayılan Şifre: 12345`);
    console.log(`   • Tüm personel ADMIN yetkisinde`);

    console.log(`\n✅ PERSONEL VERİLERİ BAŞARIYLA YÜKLENDİ!`);
}

main()
    .catch((e) => {
        console.error('❌ Seed hatası:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 