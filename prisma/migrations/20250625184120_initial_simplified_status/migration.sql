-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'USER', 'PRODUCTION', 'SALES', 'ACCOUNTING');

-- CreateEnum
CREATE TYPE "CariTipi" AS ENUM ('BIREYSEL', 'KURUMSAL', 'TEDARIKCI', 'DIGER');

-- CreateEnum
CREATE TYPE "HareketTipi" AS ENUM ('SIPARIS', 'ODEME', 'IADE', 'DUZELTME', 'VADE_FAIZI', 'INDIRIM');

-- CreateEnum
CREATE TYPE "OdemeYontemi" AS ENUM ('NAKIT', 'KREDI_KARTI', 'BANKA_HAVALESI', 'EFT', 'CEK', 'SENET', 'DIGER');

-- CreateEnum
CREATE TYPE "SatisBirimi" AS ENUM ('KG', 'GRAM', 'ADET', 'PAKET', 'KUTU', 'TEPSI');

-- CreateEnum
CREATE TYPE "FiyatTipi" AS ENUM ('NORMAL', 'KAMPANYA', 'TOPTAN', 'PERAKENDE', 'OZEL_FIYAT', 'PROMOSYON');

-- CreateEnum
CREATE TYPE "SiparisDurumu" AS ENUM ('ONAY_BEKLEYEN', 'HAZIRLLANACAK', 'HAZIRLANDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "KargoDurumu" AS ENUM ('ADRESE_TESLIMAT', 'SUBEDEN_SUBEYE');

-- CreateEnum
CREATE TYPE "OncelikSeviyesi" AS ENUM ('DUSUK', 'NORMAL', 'YUKSEK', 'ACIL');

-- CreateEnum
CREATE TYPE "MaterialTipi" AS ENUM ('HAMMADDE', 'YARI_MAMUL', 'YARDIMCI_MADDE', 'AMBALAJ_MALZEMESI');

-- CreateEnum
CREATE TYPE "MaterialBirimi" AS ENUM ('KG', 'GRAM', 'LITRE', 'ML', 'ADET', 'PAKET');

-- CreateEnum
CREATE TYPE "StokHareketTipi" AS ENUM ('GIRIS', 'CIKIS', 'TRANSFER', 'FIRE', 'SAYIM_FAZLA', 'SAYIM_EKSIK', 'URETIM_GIRDI', 'URETIM_CIKTI', 'IADE', 'DUZELTME');

-- CreateEnum
CREATE TYPE "TransferDurumu" AS ENUM ('BEKLIYOR', 'ONAYLANDI', 'GONDERILDI', 'TESLIM_EDILDI', 'IPTAL');

-- CreateEnum
CREATE TYPE "SettingDataType" AS ENUM ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'DATE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT,
    "telefon" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "sonGiris" TIMESTAMP(3),
    "girisYili" INTEGER,
    "sgkDurumu" TEXT,
    "gunlukUcret" DOUBLE PRECISION,
    "bolum" TEXT,
    "unvan" TEXT,
    "iseBaslamaTarihi" TIMESTAMP(3),
    "subeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sube" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "adres" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "mudur" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "siraNo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeslimatTuru" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "aciklama" TEXT,
    "varsayilanKargo" TEXT,
    "ekstraMaliyet" DOUBLE PRECISION DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "siraNo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeslimatTuru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cari" (
    "id" SERIAL NOT NULL,
    "musteriKodu" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "soyad" TEXT,
    "unvan" TEXT,
    "tipi" "CariTipi" NOT NULL DEFAULT 'BIREYSEL',
    "vergiNo" TEXT,
    "tcNo" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "website" TEXT,
    "adres" TEXT,
    "il" TEXT,
    "ilce" TEXT,
    "postaKodu" TEXT,
    "bakiye" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vadeGunu" INTEGER DEFAULT 0,
    "kredLimiti" DOUBLE PRECISION DEFAULT 0,
    "riskGrubu" TEXT DEFAULT 'Normal',
    "musteriSegmenti" TEXT,
    "subeId" INTEGER,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "ozelMusteriMi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "Cari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CariHareket" (
    "id" SERIAL NOT NULL,
    "cariId" INTEGER NOT NULL,
    "tip" "HareketTipi" NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "belgeNo" TEXT,
    "vadeTarihi" TIMESTAMP(3),
    "siparisId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,

    CONSTRAINT "CariHareket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CariOdeme" (
    "id" SERIAL NOT NULL,
    "cariId" INTEGER NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,
    "odemeYontemi" "OdemeYontemi" NOT NULL,
    "referansNo" TEXT,
    "aciklama" TEXT,
    "odemeTarihi" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "siparisId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,

    CONSTRAINT "CariOdeme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UrunKategori" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "aciklama" TEXT,
    "parentId" INTEGER,
    "renk" TEXT DEFAULT '#2196F3',
    "ikon" TEXT DEFAULT 'mdi-package-variant',
    "siraNo" INTEGER,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrunKategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Urun" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "barkod" TEXT,
    "kategoriId" INTEGER,
    "aciklama" TEXT,
    "kisaAciklama" TEXT,
    "anaGorsel" TEXT,
    "galeriGorseller" JSONB,
    "agirlik" DOUBLE PRECISION,
    "boyutlar" JSONB,
    "renk" TEXT,
    "mensei" TEXT,
    "uretimSuresi" INTEGER,
    "rafOmru" INTEGER,
    "saklamaKosullari" TEXT,
    "maliyetFiyati" DOUBLE PRECISION,
    "karMarji" DOUBLE PRECISION DEFAULT 25.0,
    "stokKodu" TEXT,
    "minStokMiktari" DOUBLE PRECISION DEFAULT 0,
    "maxStokMiktari" DOUBLE PRECISION,
    "kritikStokSeviye" DOUBLE PRECISION DEFAULT 10,
    "mevcutStok" DOUBLE PRECISION DEFAULT 0,
    "satisaBirimi" "SatisBirimi" NOT NULL DEFAULT 'KG',
    "minSatisMiktari" DOUBLE PRECISION DEFAULT 0.1,
    "maxSatisMiktari" DOUBLE PRECISION,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "satisaUygun" BOOLEAN NOT NULL DEFAULT true,
    "uretimdeAktif" BOOLEAN NOT NULL DEFAULT true,
    "ozelUrun" BOOLEAN NOT NULL DEFAULT false,
    "yeniUrun" BOOLEAN NOT NULL DEFAULT false,
    "indirimliUrun" BOOLEAN NOT NULL DEFAULT false,
    "seoBaslik" TEXT,
    "seoAciklama" TEXT,
    "anahtarKelimeler" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "updatedBy" INTEGER,

    CONSTRAINT "Urun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fiyat" (
    "id" SERIAL NOT NULL,
    "urunId" INTEGER NOT NULL,
    "fiyat" DOUBLE PRECISION NOT NULL,
    "birim" "SatisBirimi" NOT NULL,
    "fiyatTipi" "FiyatTipi" NOT NULL DEFAULT 'NORMAL',
    "minMiktar" DOUBLE PRECISION DEFAULT 0,
    "maxMiktar" DOUBLE PRECISION,
    "iskonto" DOUBLE PRECISION DEFAULT 0,
    "vergiOrani" DOUBLE PRECISION DEFAULT 18,
    "gecerliTarih" DATE NOT NULL,
    "bitisTarihi" DATE,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,

    CONSTRAINT "Fiyat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siparis" (
    "id" SERIAL NOT NULL,
    "siparisNo" TEXT NOT NULL,
    "tarih" DATE NOT NULL,
    "teslimTarihi" DATE,
    "cariId" INTEGER,
    "gonderenAdi" TEXT NOT NULL,
    "gonderenTel" TEXT NOT NULL,
    "gonderenEmail" TEXT,
    "aliciAdi" TEXT,
    "aliciTel" TEXT,
    "aliciEmail" TEXT,
    "teslimatAdresi" TEXT,
    "il" TEXT,
    "ilce" TEXT,
    "postaKodu" TEXT,
    "teslimatTuruId" INTEGER NOT NULL,
    "subeId" INTEGER,
    "araToplam" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kdvToplam" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "kargoUcreti" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "digerHizmetTutari" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "toplamTutar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "durum" "SiparisDurumu" NOT NULL DEFAULT 'ONAY_BEKLEYEN',
    "kargoDurumu" "KargoDurumu" NOT NULL DEFAULT 'ADRESE_TESLIMAT',
    "kargoSirketi" TEXT,
    "kargoTakipNo" TEXT,
    "kargoNotu" TEXT,
    "kargoTarihi" TIMESTAMP(3),
    "hedefSubeId" INTEGER,
    "siparisNotu" TEXT,
    "ozelTalepler" TEXT,
    "dahiliNotlar" TEXT,
    "oncelik" "OncelikSeviyesi" NOT NULL DEFAULT 'NORMAL',
    "acilmi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,
    "onaylayanId" INTEGER,
    "onaylanmaTarihi" TIMESTAMP(3),

    CONSTRAINT "Siparis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiparisKalemi" (
    "id" SERIAL NOT NULL,
    "siparisId" INTEGER NOT NULL,
    "urunId" INTEGER NOT NULL,
    "urunAdi" TEXT NOT NULL,
    "urunKodu" TEXT,
    "miktar" DOUBLE PRECISION NOT NULL,
    "birim" "SatisBirimi" NOT NULL,
    "birimFiyat" DOUBLE PRECISION NOT NULL,
    "kdvOrani" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "iskonto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "araToplam" DOUBLE PRECISION NOT NULL,
    "kdvTutari" DOUBLE PRECISION NOT NULL,
    "toplamTutar" DOUBLE PRECISION NOT NULL,
    "ambalajId" INTEGER,
    "tepsiTavaId" INTEGER,
    "kutuId" INTEGER,
    "uretimNotu" TEXT,

    CONSTRAINT "SiparisKalemi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ambalaj" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "aciklama" TEXT,
    "fiyat" DOUBLE PRECISION DEFAULT 0,
    "agirlik" DOUBLE PRECISION,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ambalaj_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TepsiTava" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "aciklama" TEXT,
    "fiyat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "agirlik" DOUBLE PRECISION,
    "boyut" TEXT,
    "malzeme" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TepsiTava_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kutu" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "aciklama" TEXT,
    "fiyat" DOUBLE PRECISION DEFAULT 0,
    "agirlik" DOUBLE PRECISION,
    "boyutlar" JSONB,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kutu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "tipi" "MaterialTipi" NOT NULL,
    "birim" "MaterialBirimi" NOT NULL DEFAULT 'KG',
    "birimFiyat" DOUBLE PRECISION DEFAULT 0,
    "mevcutStok" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minStokSeviye" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxStokSeviye" DOUBLE PRECISION,
    "kritikSeviye" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "aciklama" TEXT,
    "tedarikci" TEXT,
    "rafOmru" INTEGER,
    "saklamaKosullari" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,
    "urunId" INTEGER,
    "aciklama" TEXT,
    "porsiyon" DOUBLE PRECISION DEFAULT 1,
    "hazirlamaSuresi" INTEGER,
    "pisirmeSuresi" INTEGER,
    "hazirlanisi" JSONB,
    "notlar" TEXT,
    "toplamMaliyet" DOUBLE PRECISION DEFAULT 0,
    "porsinoyonMaliyet" DOUBLE PRECISION DEFAULT 0,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "test" BOOLEAN NOT NULL DEFAULT false,
    "versiyon" TEXT NOT NULL DEFAULT '1.0',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" INTEGER,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "materialId" INTEGER NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,
    "birim" "MaterialBirimi" NOT NULL,
    "hazirlamaNotu" TEXT,
    "zorunlu" BOOLEAN NOT NULL DEFAULT true,
    "alternatifOlabilir" BOOLEAN NOT NULL DEFAULT false,
    "siraNo" INTEGER,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokHareket" (
    "id" SERIAL NOT NULL,
    "urunId" INTEGER,
    "materialId" INTEGER,
    "tip" "StokHareketTipi" NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,
    "birim" TEXT NOT NULL,
    "siparisKalemiId" INTEGER,
    "transferId" INTEGER,
    "aciklama" TEXT,
    "referansNo" TEXT,
    "oncekiStok" DOUBLE PRECISION,
    "sonrakiStok" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,

    CONSTRAINT "StokHareket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokTransfer" (
    "id" SERIAL NOT NULL,
    "transferNo" TEXT NOT NULL,
    "kaynakSubeId" INTEGER,
    "hedefSubeId" INTEGER,
    "urunId" INTEGER,
    "materialId" INTEGER,
    "miktar" DOUBLE PRECISION NOT NULL,
    "birim" TEXT NOT NULL,
    "aciklama" TEXT,
    "durum" "TransferDurumu" NOT NULL DEFAULT 'BEKLIYOR',
    "gonderimTarihi" TIMESTAMP(3),
    "teslimTarihi" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" INTEGER,
    "onaylayanId" INTEGER,
    "teslimAlanId" INTEGER,

    CONSTRAINT "StokTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "dataType" "SettingDataType" NOT NULL DEFAULT 'STRING',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" INTEGER,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_aktif_idx" ON "User"("aktif");

-- CreateIndex
CREATE INDEX "User_subeId_idx" ON "User"("subeId");

-- CreateIndex
CREATE UNIQUE INDEX "Sube_ad_key" ON "Sube"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Sube_kod_key" ON "Sube"("kod");

-- CreateIndex
CREATE INDEX "Sube_aktif_idx" ON "Sube"("aktif");

-- CreateIndex
CREATE UNIQUE INDEX "TeslimatTuru_ad_key" ON "TeslimatTuru"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "TeslimatTuru_kod_key" ON "TeslimatTuru"("kod");

-- CreateIndex
CREATE INDEX "TeslimatTuru_aktif_idx" ON "TeslimatTuru"("aktif");

-- CreateIndex
CREATE UNIQUE INDEX "Cari_musteriKodu_key" ON "Cari"("musteriKodu");

-- CreateIndex
CREATE UNIQUE INDEX "Cari_vergiNo_key" ON "Cari"("vergiNo");

-- CreateIndex
CREATE UNIQUE INDEX "Cari_tcNo_key" ON "Cari"("tcNo");

-- CreateIndex
CREATE INDEX "Cari_tipi_idx" ON "Cari"("tipi");

-- CreateIndex
CREATE INDEX "Cari_aktif_idx" ON "Cari"("aktif");

-- CreateIndex
CREATE INDEX "Cari_subeId_idx" ON "Cari"("subeId");

-- CreateIndex
CREATE INDEX "Cari_musteriKodu_idx" ON "Cari"("musteriKodu");

-- CreateIndex
CREATE INDEX "Cari_telefon_idx" ON "Cari"("telefon");

-- CreateIndex
CREATE INDEX "Cari_email_idx" ON "Cari"("email");

-- CreateIndex
CREATE INDEX "CariHareket_cariId_idx" ON "CariHareket"("cariId");

-- CreateIndex
CREATE INDEX "CariHareket_tip_idx" ON "CariHareket"("tip");

-- CreateIndex
CREATE INDEX "CariHareket_createdAt_idx" ON "CariHareket"("createdAt");

-- CreateIndex
CREATE INDEX "CariOdeme_cariId_idx" ON "CariOdeme"("cariId");

-- CreateIndex
CREATE INDEX "CariOdeme_odemeYontemi_idx" ON "CariOdeme"("odemeYontemi");

-- CreateIndex
CREATE INDEX "CariOdeme_odemeTarihi_idx" ON "CariOdeme"("odemeTarihi");

-- CreateIndex
CREATE UNIQUE INDEX "UrunKategori_ad_key" ON "UrunKategori"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "UrunKategori_kod_key" ON "UrunKategori"("kod");

-- CreateIndex
CREATE INDEX "UrunKategori_aktif_idx" ON "UrunKategori"("aktif");

-- CreateIndex
CREATE INDEX "UrunKategori_parentId_idx" ON "UrunKategori"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_ad_key" ON "Urun"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_kod_key" ON "Urun"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_barkod_key" ON "Urun"("barkod");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_stokKodu_key" ON "Urun"("stokKodu");

-- CreateIndex
CREATE INDEX "Urun_kategoriId_idx" ON "Urun"("kategoriId");

-- CreateIndex
CREATE INDEX "Urun_aktif_idx" ON "Urun"("aktif");

-- CreateIndex
CREATE INDEX "Urun_satisaUygun_idx" ON "Urun"("satisaUygun");

-- CreateIndex
CREATE INDEX "Urun_stokKodu_idx" ON "Urun"("stokKodu");

-- CreateIndex
CREATE INDEX "Urun_barkod_idx" ON "Urun"("barkod");

-- CreateIndex
CREATE INDEX "Fiyat_aktif_idx" ON "Fiyat"("aktif");

-- CreateIndex
CREATE INDEX "Fiyat_fiyatTipi_idx" ON "Fiyat"("fiyatTipi");

-- CreateIndex
CREATE INDEX "Fiyat_gecerliTarih_idx" ON "Fiyat"("gecerliTarih");

-- CreateIndex
CREATE UNIQUE INDEX "Fiyat_urunId_birim_fiyatTipi_gecerliTarih_key" ON "Fiyat"("urunId", "birim", "fiyatTipi", "gecerliTarih");

-- CreateIndex
CREATE UNIQUE INDEX "Siparis_siparisNo_key" ON "Siparis"("siparisNo");

-- CreateIndex
CREATE INDEX "Siparis_durum_idx" ON "Siparis"("durum");

-- CreateIndex
CREATE INDEX "Siparis_kargoDurumu_idx" ON "Siparis"("kargoDurumu");

-- CreateIndex
CREATE INDEX "Siparis_cariId_idx" ON "Siparis"("cariId");

-- CreateIndex
CREATE INDEX "Siparis_tarih_idx" ON "Siparis"("tarih");

-- CreateIndex
CREATE INDEX "Siparis_createdAt_idx" ON "Siparis"("createdAt");

-- CreateIndex
CREATE INDEX "SiparisKalemi_siparisId_idx" ON "SiparisKalemi"("siparisId");

-- CreateIndex
CREATE INDEX "SiparisKalemi_urunId_idx" ON "SiparisKalemi"("urunId");

-- CreateIndex
CREATE UNIQUE INDEX "Ambalaj_ad_key" ON "Ambalaj"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Ambalaj_kod_key" ON "Ambalaj"("kod");

-- CreateIndex
CREATE INDEX "Ambalaj_aktif_idx" ON "Ambalaj"("aktif");

-- CreateIndex
CREATE UNIQUE INDEX "TepsiTava_ad_key" ON "TepsiTava"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "TepsiTava_kod_key" ON "TepsiTava"("kod");

-- CreateIndex
CREATE INDEX "TepsiTava_aktif_idx" ON "TepsiTava"("aktif");

-- CreateIndex
CREATE UNIQUE INDEX "Kutu_ad_key" ON "Kutu"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Kutu_kod_key" ON "Kutu"("kod");

-- CreateIndex
CREATE INDEX "Kutu_aktif_idx" ON "Kutu"("aktif");

-- CreateIndex
CREATE UNIQUE INDEX "Material_ad_key" ON "Material"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Material_kod_key" ON "Material"("kod");

-- CreateIndex
CREATE INDEX "Material_tipi_idx" ON "Material"("tipi");

-- CreateIndex
CREATE INDEX "Material_aktif_idx" ON "Material"("aktif");

-- CreateIndex
CREATE INDEX "Material_kod_idx" ON "Material"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_ad_key" ON "Recipe"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_kod_key" ON "Recipe"("kod");

-- CreateIndex
CREATE INDEX "Recipe_aktif_idx" ON "Recipe"("aktif");

-- CreateIndex
CREATE INDEX "Recipe_urunId_idx" ON "Recipe"("urunId");

-- CreateIndex
CREATE UNIQUE INDEX "Recipe_urunId_versiyon_key" ON "Recipe"("urunId", "versiyon");

-- CreateIndex
CREATE INDEX "RecipeIngredient_recipeId_idx" ON "RecipeIngredient"("recipeId");

-- CreateIndex
CREATE INDEX "RecipeIngredient_materialId_idx" ON "RecipeIngredient"("materialId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeIngredient_recipeId_materialId_key" ON "RecipeIngredient"("recipeId", "materialId");

-- CreateIndex
CREATE INDEX "StokHareket_tip_idx" ON "StokHareket"("tip");

-- CreateIndex
CREATE INDEX "StokHareket_urunId_idx" ON "StokHareket"("urunId");

-- CreateIndex
CREATE INDEX "StokHareket_materialId_idx" ON "StokHareket"("materialId");

-- CreateIndex
CREATE INDEX "StokHareket_createdAt_idx" ON "StokHareket"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "StokTransfer_transferNo_key" ON "StokTransfer"("transferNo");

-- CreateIndex
CREATE INDEX "StokTransfer_durum_idx" ON "StokTransfer"("durum");

-- CreateIndex
CREATE INDEX "StokTransfer_kaynakSubeId_idx" ON "StokTransfer"("kaynakSubeId");

-- CreateIndex
CREATE INDEX "StokTransfer_hedefSubeId_idx" ON "StokTransfer"("hedefSubeId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subeId_fkey" FOREIGN KEY ("subeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cari" ADD CONSTRAINT "Cari_subeId_fkey" FOREIGN KEY ("subeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CariHareket" ADD CONSTRAINT "CariHareket_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CariHareket" ADD CONSTRAINT "CariHareket_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CariOdeme" ADD CONSTRAINT "CariOdeme_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CariOdeme" ADD CONSTRAINT "CariOdeme_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UrunKategori" ADD CONSTRAINT "UrunKategori_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "UrunKategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Urun" ADD CONSTRAINT "Urun_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "UrunKategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fiyat" ADD CONSTRAINT "Fiyat_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fiyat" ADD CONSTRAINT "Fiyat_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_teslimatTuruId_fkey" FOREIGN KEY ("teslimatTuruId") REFERENCES "TeslimatTuru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_subeId_fkey" FOREIGN KEY ("subeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_hedefSubeId_fkey" FOREIGN KEY ("hedefSubeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_onaylayanId_fkey" FOREIGN KEY ("onaylayanId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_ambalajId_fkey" FOREIGN KEY ("ambalajId") REFERENCES "Ambalaj"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_tepsiTavaId_fkey" FOREIGN KEY ("tepsiTavaId") REFERENCES "TepsiTava"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_kutuId_fkey" FOREIGN KEY ("kutuId") REFERENCES "Kutu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_siparisKalemiId_fkey" FOREIGN KEY ("siparisKalemiId") REFERENCES "SiparisKalemi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StokTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_kaynakSubeId_fkey" FOREIGN KEY ("kaynakSubeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_hedefSubeId_fkey" FOREIGN KEY ("hedefSubeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
