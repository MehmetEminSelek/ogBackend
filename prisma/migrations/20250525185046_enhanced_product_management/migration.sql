/*
  Warnings:

  - A unique constraint covering the columns `[barkod]` on the table `Urun` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Urun` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Fiyat" ADD COLUMN     "aktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "fiyatTipi" TEXT NOT NULL DEFAULT 'normal',
ADD COLUMN     "iskonto" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "maxMiktar" DOUBLE PRECISION,
ADD COLUMN     "minMiktar" DOUBLE PRECISION,
ADD COLUMN     "vergiOrani" DOUBLE PRECISION DEFAULT 18;

-- AlterTable
ALTER TABLE "Urun" ADD COLUMN     "aciklama" TEXT,
ADD COLUMN     "agirlik" DOUBLE PRECISION,
ADD COLUMN     "aktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "anaGorsel" TEXT,
ADD COLUMN     "anahtarKelimeler" TEXT[],
ADD COLUMN     "barkod" TEXT,
ADD COLUMN     "boyutlar" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" INTEGER,
ADD COLUMN     "galeriGorseller" TEXT[],
ADD COLUMN     "indirimliUrun" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "karMarji" DOUBLE PRECISION,
ADD COLUMN     "kategoriId" INTEGER,
ADD COLUMN     "kisaAciklama" TEXT,
ADD COLUMN     "kritikStokSeviye" DOUBLE PRECISION DEFAULT 10,
ADD COLUMN     "maliyetFiyati" DOUBLE PRECISION,
ADD COLUMN     "malzeme" TEXT,
ADD COLUMN     "maxSatisMiktari" DOUBLE PRECISION,
ADD COLUMN     "maxStokMiktari" DOUBLE PRECISION,
ADD COLUMN     "mensei" TEXT,
ADD COLUMN     "minSatisMiktari" DOUBLE PRECISION DEFAULT 1,
ADD COLUMN     "minStokMiktari" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "ozelUrun" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rafOmru" INTEGER,
ADD COLUMN     "renk" TEXT,
ADD COLUMN     "saklamaKosullari" TEXT,
ADD COLUMN     "satisaBirimi" TEXT DEFAULT 'KG',
ADD COLUMN     "satisaUygun" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "seoAciklama" TEXT,
ADD COLUMN     "seoBaslik" TEXT,
ADD COLUMN     "stokKodu" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedBy" INTEGER,
ADD COLUMN     "uretimSuresi" INTEGER,
ADD COLUMN     "yeniUrun" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "UrunKategori" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "renk" TEXT,
    "ikon" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "siraNo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UrunKategori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UrunKategori_ad_key" ON "UrunKategori"("ad");

-- CreateIndex
CREATE INDEX "Fiyat_aktif_idx" ON "Fiyat"("aktif");

-- CreateIndex
CREATE INDEX "Fiyat_fiyatTipi_idx" ON "Fiyat"("fiyatTipi");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_barkod_key" ON "Urun"("barkod");

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

-- AddForeignKey
ALTER TABLE "Urun" ADD CONSTRAINT "Urun_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "UrunKategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;
