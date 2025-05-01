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
    "gecerliTarih" DATE NOT NULL,
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
    "onaylandiMi" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
    "tepsiTavaId" INTEGER,
    "kutuId" INTEGER,

    CONSTRAINT "SiparisKalemi_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Fiyat_urunId_gecerliTarih_key" ON "Fiyat"("urunId", "gecerliTarih");

-- CreateIndex
CREATE INDEX "SiparisKalemi_siparisId_idx" ON "SiparisKalemi"("siparisId");

-- CreateIndex
CREATE INDEX "SiparisKalemi_tepsiTavaId_idx" ON "SiparisKalemi"("tepsiTavaId");

-- CreateIndex
CREATE INDEX "SiparisKalemi_kutuId_idx" ON "SiparisKalemi"("kutuId");

-- AddForeignKey
ALTER TABLE "Fiyat" ADD CONSTRAINT "Fiyat_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
