-- AlterTable
ALTER TABLE "User" ADD COLUMN     "erpPasifAktif" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "girisYili" INTEGER,
ADD COLUMN     "gunlukUcret" DOUBLE PRECISION,
ADD COLUMN     "sgkDurumu" TEXT,
ADD COLUMN     "sube" TEXT;
