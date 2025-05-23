-- CreateTable
CREATE TABLE "TeslimatTuru" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "TeslimatTuru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sube" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "Sube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GonderenAliciTipi" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "GonderenAliciTipi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ambalaj" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "Ambalaj_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TepsiTava" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,
    "fiyat" DOUBLE PRECISION,

    CONSTRAINT "TepsiTava_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kutu" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "Kutu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Urun" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "Urun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fiyat" (
    "id" SERIAL NOT NULL,
    "urunId" INTEGER NOT NULL,
    "fiyat" DOUBLE PRECISION NOT NULL,
    "birim" TEXT NOT NULL,
    "gecerliTarih" DATE NOT NULL,
    "bitisTarihi" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fiyat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siparis" (
    "id" SERIAL NOT NULL,
    "tarih" DATE NOT NULL,
    "teslimatTuruId" INTEGER NOT NULL,
    "subeId" INTEGER,
    "gonderenTipiId" INTEGER,
    "gonderenAdi" TEXT NOT NULL,
    "gonderenTel" TEXT NOT NULL,
    "aliciAdi" TEXT,
    "aliciTel" TEXT,
    "adres" TEXT,
    "aciklama" TEXT,
    "gorunecekAd" TEXT,
    "birimFiyat" DOUBLE PRECISION DEFAULT 0,
    "onaylandiMi" BOOLEAN NOT NULL DEFAULT false,
    "kargoUcreti" DOUBLE PRECISION DEFAULT 0,
    "digerHizmetTutari" DOUBLE PRECISION DEFAULT 0,
    "toplamTepsiMaliyeti" DOUBLE PRECISION DEFAULT 0,
    "hazirlanmaDurumu" TEXT NOT NULL DEFAULT 'Bekliyor',
    "kargoDurumu" TEXT,
    "kargoSirketi" TEXT,
    "kargoTakipNo" TEXT,
    "kargoNotu" TEXT,
    "kargoTarihi" TIMESTAMP(3),
    "teslimTarihi" TIMESTAMP(3),
    "hedefSubeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cariId" INTEGER,

    CONSTRAINT "Siparis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiparisKalemi" (
    "id" SERIAL NOT NULL,
    "siparisId" INTEGER NOT NULL,
    "ambalajId" INTEGER NOT NULL,
    "urunId" INTEGER NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,
    "birim" TEXT NOT NULL,
    "birimFiyat" DOUBLE PRECISION,
    "tepsiTavaId" INTEGER,
    "kutuId" INTEGER,

    CONSTRAINT "SiparisKalemi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Odeme" (
    "id" SERIAL NOT NULL,
    "siparisId" INTEGER NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,
    "odemeTarihi" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "odemeYontemi" TEXT,
    "aciklama" TEXT,

    CONSTRAINT "Odeme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperasyonBirimi" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,

    CONSTRAINT "OperasyonBirimi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hammadde" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,

    CONSTRAINT "Hammadde_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YariMamul" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,

    CONSTRAINT "YariMamul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stok" (
    "id" SERIAL NOT NULL,
    "hammaddeId" INTEGER,
    "yariMamulId" INTEGER,
    "operasyonBirimiId" INTEGER NOT NULL,
    "miktarGram" DOUBLE PRECISION NOT NULL,
    "minimumMiktarGram" DOUBLE PRECISION DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recipe" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "urunId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeIngredient" (
    "id" SERIAL NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "stokKod" TEXT NOT NULL,
    "miktarGram" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "RecipeIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokTransfer" (
    "id" SERIAL NOT NULL,
    "kaynakStokId" INTEGER NOT NULL,
    "hedefStokId" INTEGER NOT NULL,
    "miktarGram" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "StokTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StokHareket" (
    "id" SERIAL NOT NULL,
    "stokId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "miktarGram" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER,

    CONSTRAINT "StokHareket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cari" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "aciklama" TEXT,
    "bakiye" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "musteriKodu" TEXT NOT NULL,
    "subeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Adres" (
    "id" SERIAL NOT NULL,
    "cariId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "adres" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Adres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CariHareket" (
    "id" SERIAL NOT NULL,
    "cariId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "vadeTarihi" TIMESTAMP(3),
    "direction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CariHareket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OzelTepsi" (
    "id" SERIAL NOT NULL,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "fiyat" DOUBLE PRECISION NOT NULL,
    "toplamKg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OzelTepsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OzelTepsiIcerik" (
    "id" SERIAL NOT NULL,
    "ozelTepsiId" INTEGER NOT NULL,
    "urunId" INTEGER NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OzelTepsiIcerik_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeslimatTuru_ad_key" ON "TeslimatTuru"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Sube_ad_key" ON "Sube"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "GonderenAliciTipi_ad_key" ON "GonderenAliciTipi"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Ambalaj_ad_key" ON "Ambalaj"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "TepsiTava_ad_key" ON "TepsiTava"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Kutu_ad_key" ON "Kutu"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_ad_key" ON "Urun"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_kodu_key" ON "Urun"("kodu");

-- CreateIndex
CREATE UNIQUE INDEX "Fiyat_urunId_birim_gecerliTarih_key" ON "Fiyat"("urunId", "birim", "gecerliTarih");

-- CreateIndex
CREATE INDEX "SiparisKalemi_siparisId_idx" ON "SiparisKalemi"("siparisId");

-- CreateIndex
CREATE INDEX "SiparisKalemi_tepsiTavaId_idx" ON "SiparisKalemi"("tepsiTavaId");

-- CreateIndex
CREATE INDEX "SiparisKalemi_kutuId_idx" ON "SiparisKalemi"("kutuId");

-- CreateIndex
CREATE INDEX "Odeme_siparisId_idx" ON "Odeme"("siparisId");

-- CreateIndex
CREATE UNIQUE INDEX "OperasyonBirimi_kod_key" ON "OperasyonBirimi"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Hammadde_kod_key" ON "Hammadde"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "YariMamul_kod_key" ON "YariMamul"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Stok_hammaddeId_operasyonBirimiId_key" ON "Stok"("hammaddeId", "operasyonBirimiId");

-- CreateIndex
CREATE UNIQUE INDEX "Stok_yariMamulId_operasyonBirimiId_key" ON "Stok"("yariMamulId", "operasyonBirimiId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cari_email_key" ON "Cari"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Cari_musteriKodu_key" ON "Cari"("musteriKodu");

-- CreateIndex
CREATE UNIQUE INDEX "OzelTepsi_kod_key" ON "OzelTepsi"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "OzelTepsiIcerik_ozelTepsiId_urunId_key" ON "OzelTepsiIcerik"("ozelTepsiId", "urunId");

-- AddForeignKey
ALTER TABLE "Fiyat" ADD CONSTRAINT "Fiyat_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_teslimatTuruId_fkey" FOREIGN KEY ("teslimatTuruId") REFERENCES "TeslimatTuru"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_subeId_fkey" FOREIGN KEY ("subeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_gonderenTipiId_fkey" FOREIGN KEY ("gonderenTipiId") REFERENCES "GonderenAliciTipi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_ambalajId_fkey" FOREIGN KEY ("ambalajId") REFERENCES "Ambalaj"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_tepsiTavaId_fkey" FOREIGN KEY ("tepsiTavaId") REFERENCES "TepsiTava"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_kutuId_fkey" FOREIGN KEY ("kutuId") REFERENCES "Kutu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Odeme" ADD CONSTRAINT "Odeme_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_hammaddeId_fkey" FOREIGN KEY ("hammaddeId") REFERENCES "Hammadde"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_yariMamulId_fkey" FOREIGN KEY ("yariMamulId") REFERENCES "YariMamul"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_operasyonBirimiId_fkey" FOREIGN KEY ("operasyonBirimiId") REFERENCES "OperasyonBirimi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeIngredient" ADD CONSTRAINT "RecipeIngredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_kaynakStokId_fkey" FOREIGN KEY ("kaynakStokId") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_hedefStokId_fkey" FOREIGN KEY ("hedefStokId") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cari" ADD CONSTRAINT "Cari_subeId_fkey" FOREIGN KEY ("subeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adres" ADD CONSTRAINT "Adres_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CariHareket" ADD CONSTRAINT "CariHareket_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OzelTepsiIcerik" ADD CONSTRAINT "OzelTepsiIcerik_ozelTepsiId_fkey" FOREIGN KEY ("ozelTepsiId") REFERENCES "OzelTepsi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OzelTepsiIcerik" ADD CONSTRAINT "OzelTepsiIcerik_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
