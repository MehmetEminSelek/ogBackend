const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    console.log(" S�PAR�� TEST VER�LER� Y�KLEN�YOR...\n");

    // Mevcut verileri �ek
    const [teslimatTurleri, subeler, cariler, urunler, tepsiTavalar, kutular] = await Promise.all([
        prisma.teslimatTuru.findMany({ where: { aktif: true } }),
        prisma.sube.findMany({ where: { aktif: true } }),
        prisma.cari.findMany({ where: { aktif: true }, take: 50 }),
        prisma.urun.findMany({ where: { aktif: true } }),
        prisma.tepsiTava.findMany({ where: { aktif: true } }),
        prisma.kutu.findMany({ where: { aktif: true } })
    ]);

    console.log(` Mevcut veriler:`);
    console.log(`    ${teslimatTurleri.length} teslimat t�r�`);
    console.log(`    ${subeler.length} �ube`);
    console.log(`    ${cariler.length} m��teri`);
    console.log(`    ${urunler.length} �r�n`);
    console.log(`    ${tepsiTavalar.length} tepsi/tava`);
    console.log(`    ${kutular.length} kutu\n`);

    // Test tarihleri (son 30 g�n i�inde)
    const testTarihleri = [];
    for (let i = 0; i < 30; i++) {
        const tarih = new Date();
        tarih.setDate(tarih.getDate() - i);
        testTarihleri.push(tarih);
    }

    // Yard�mc� fonksiyonlar
    function rastgeleMusteriSec() {
        if (cariler.length === 0) return null;
        return cariler[Math.floor(Math.random() * cariler.length)];
    }

    function rastgeleTelefonOlustur() {
        return "05" + Math.floor(Math.random() * 900000000 + 100000000);
    }

    function rastgeleIsimOlustur() {
        const isimler = ["Ahmet", "Mehmet", "Ali", "Veli", "Ay�e", "Fatma", "Zeynep", "Elif"];
        const soyisimler = ["Y�lmaz", "Kaya", "Demir", "�elik", "�ahin", "�zt�rk", "Ayd�n", "�zdemir"];
        return isimler[Math.floor(Math.random() * isimler.length)] + " " +
            soyisimler[Math.floor(Math.random() * soyisimler.length)];
    }

    function adresOlustur() {
        const mahalleler = ["Fatih Mah.", "Cumhuriyet Mah.", "Yeni Mah.", "�aml�k Mah."];
        const sokaklar = ["Atat�rk Cad.", "�n�n� Sok.", "Bar�� Sok.", "H�rriyet Cad."];
        return mahalleler[Math.floor(Math.random() * mahalleler.length)] + " " +
            sokaklar[Math.floor(Math.random() * sokaklar.length)] + " No:" + (Math.floor(Math.random() * 100) + 1);
    }

    console.log(" Test sipari�leri olu�turuluyor...\n");

    let basariliSiparis = 0;
    let hataliSiparis = 0;

    // 20 �e�itli sipari� olu�tur
    for (let i = 1; i <= 20; i++) {
        try {
            // Rastgele teslimat t�r� se�
            const teslimatTuru = teslimatTurleri[Math.floor(Math.random() * teslimatTurleri.length)];

            // Rastgele m��teri se�
            const musteri = rastgeleMusteriSec();

            // Sipari� tarihi (son 30 g�n i�inde)
            const siparisTarihi = testTarihleri[Math.floor(Math.random() * testTarihleri.length)];

            // M��teri bilgileri
            let gonderenAdi, gonderenTel, aliciAdi, aliciTel, adres;

            if (musteri) {
                gonderenAdi = `${musteri.ad} ${musteri.soyad || ""}`.trim();
                gonderenTel = musteri.telefon || rastgeleTelefonOlustur();
                aliciAdi = gonderenAdi;
                aliciTel = gonderenTel;
                adres = musteri.adres || adresOlustur();
            } else {
                gonderenAdi = rastgeleIsimOlustur();
                gonderenTel = rastgeleTelefonOlustur();
                aliciAdi = gonderenAdi;
                aliciTel = gonderenTel;
                adres = adresOlustur();
            }

            // �ube se�
            const sube = subeler.length > 0 ? subeler[Math.floor(Math.random() * subeler.length)] : null;

            console.log(` Sipari� ${i} olu�turuluyor...`);

            const yeniSiparis = await prisma.siparis.create({
                data: {
                    tarih: siparisTarihi,
                    teslimatTuruId: teslimatTuru.id,
                    subeId: sube?.id || null,
                    cariId: musteri?.id || null,
                    gonderenAdi,
                    gonderenTel,
                    aliciAdi,
                    aliciTel,
                    teslimatAdresi: adres,
                    siparisNotu: `Test sipari�i ${i} - Otomatik olu�turuldu`,
                    durum: Math.random() > 0.7 ? "HAZIRLLANACAK" : "ONAY_BEKLEYEN",
                    kargoDurumu: Math.random() > 0.5 ? "ADRESE_TESLIMAT" : "SUBEDEN_SUBEYE",
                    oncelik: Math.random() > 0.9 ? "YUKSEK" : "NORMAL",
                    acilmi: Math.random() > 0.95,
                    kargoUcreti: teslimatTuru.ad === "Kargo" ? (Math.random() * 50 + 10) : 0,
                    digerHizmetTutari: Math.random() > 0.8 ? (Math.random() * 30 + 5) : 0
                }
            });

            // 2-5 aras�nda rastgele sipari� kalemi ekle
            const kalemSayisi = Math.floor(Math.random() * 4) + 2; // 2-5 aras�

            for (let j = 0; j < kalemSayisi; j++) {
                // Rastgele �r�n se�
                const urun = urunler[Math.floor(Math.random() * urunler.length)];

                // Rastgele ambalaj tipi se� (kutu veya tepsi/tava)
                let kutuId = null;
                let tepsiTavaId = null;

                if (Math.random() > 0.5 && kutular.length > 0) {
                    // Kutu se�
                    const kutu = kutular[Math.floor(Math.random() * kutular.length)];
                    kutuId = kutu.id;
                } else if (tepsiTavalar.length > 0) {
                    // Tepsi/Tava se�
                    const tepsiTava = tepsiTavalar[Math.floor(Math.random() * tepsiTavalar.length)];
                    tepsiTavaId = tepsiTava.id;
                }

                // Rastgele miktar (250g - 5000g aras�)
                const miktar = Math.floor(Math.random() * 4750) + 250;

                await prisma.siparisKalemi.create({
                    data: {
                        siparisId: yeniSiparis.id,
                        urunId: urun.id,
                        miktar: miktar,
                        birim: "GRAM",
                        kutuId: kutuId,
                        tepsiTavaId: tepsiTavaId,
                        birimFiyat: Math.random() * 100 + 50, // Test ama�l� rastgele fiyat
                        kdvOrani: 18,
                        iskonto: 0,
                        araToplam: (miktar / 1000) * (Math.random() * 100 + 50),
                        kdvTutari: ((miktar / 1000) * (Math.random() * 100 + 50)) * 0.18,
                        toplamTutar: ((miktar / 1000) * (Math.random() * 100 + 50)) * 1.18,
                        urunAdi: urun.ad,
                        urunKodu: urun.kod
                    }
                });
            }

            console.log(` Sipari� ${i} ba�ar�yla olu�turuldu (ID: ${yeniSiparis.id}, ${kalemSayisi} kalem)`);
            basariliSiparis++;

        } catch (error) {
            console.error(` Sipari� ${i} olu�turulamad�:`, error.message);
            hataliSiparis++;
        }
    }

    console.log(`\n S�PAR�� TEST VER�LER� TAMAMLANDI!`);
    console.log(`    Ba�ar�l�: ${basariliSiparis} sipari�`);
    console.log(`    Hatal�: ${hataliSiparis} sipari�`);
    console.log(`    Toplam: ${basariliSiparis + hataliSiparis} deneme\n`);
}

main()
    .catch((e) => {
        console.error(" HATA:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log(" Veritaban� ba�lant�s� kapat�ld�.");
    });
