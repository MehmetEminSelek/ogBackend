-- CreateEnum
CREATE TYPE "AdresTipi" AS ENUM ('EV', 'IS', 'DIGER');

-- CreateTable
CREATE TABLE "CariAdres" (
    "id" SERIAL NOT NULL,
    "cariId" INTEGER NOT NULL,
    "tip" "AdresTipi" NOT NULL DEFAULT 'DIGER',
    "adres" TEXT NOT NULL,
    "il" TEXT,
    "ilce" TEXT,
    "mahalle" TEXT,
    "postaKodu" TEXT,
    "tarif" TEXT,
    "varsayilan" BOOLEAN NOT NULL DEFAULT false,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CariAdres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CariAdres_cariId_idx" ON "CariAdres"("cariId");

-- CreateIndex
CREATE INDEX "CariAdres_tip_idx" ON "CariAdres"("tip");

-- CreateIndex
CREATE INDEX "CariAdres_varsayilan_idx" ON "CariAdres"("varsayilan");

-- AddForeignKey
ALTER TABLE "CariAdres" ADD CONSTRAINT "CariAdres_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE CASCADE ON UPDATE CASCADE;
