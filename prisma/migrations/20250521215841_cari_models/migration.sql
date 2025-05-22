-- AlterTable
ALTER TABLE "Siparis" ADD COLUMN     "cariId" INTEGER,
ADD COLUMN     "hedefSubeId" INTEGER,
ADD COLUMN     "kargoDurumu" TEXT,
ADD COLUMN     "kargoNotu" TEXT,
ADD COLUMN     "kargoSirketi" TEXT,
ADD COLUMN     "kargoTakipNo" TEXT,
ADD COLUMN     "kargoTarihi" TIMESTAMP(3),
ADD COLUMN     "teslimTarihi" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Cari" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "telefon" TEXT,
    "email" TEXT,
    "adres" TEXT,
    "aciklama" TEXT,
    "bakiye" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cari_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CariHareket" (
    "id" SERIAL NOT NULL,
    "cariId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "tutar" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CariHareket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CariHareket" ADD CONSTRAINT "CariHareket_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
