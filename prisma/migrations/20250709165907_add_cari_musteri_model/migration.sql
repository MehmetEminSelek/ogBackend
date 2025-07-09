-- CreateTable
CREATE TABLE "CariMusteri" (
    "id" SERIAL NOT NULL,
    "cariAdi" TEXT NOT NULL,
    "musteriKodu" TEXT NOT NULL,
    "subeAdi" TEXT,
    "telefon" TEXT,
    "irtibatAdi" TEXT,
    "cariGrubu" TEXT,
    "fiyatGrubu" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "cariId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CariMusteri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CariMusteriRelation" (
    "id" SERIAL NOT NULL,
    "cariId" INTEGER NOT NULL,

    CONSTRAINT "CariMusteriRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CariMusteri_musteriKodu_key" ON "CariMusteri"("musteriKodu");

-- CreateIndex
CREATE INDEX "CariMusteri_musteriKodu_idx" ON "CariMusteri"("musteriKodu");

-- CreateIndex
CREATE INDEX "CariMusteri_subeAdi_idx" ON "CariMusteri"("subeAdi");

-- CreateIndex
CREATE INDEX "CariMusteri_aktif_idx" ON "CariMusteri"("aktif");

-- CreateIndex
CREATE UNIQUE INDEX "CariMusteriRelation_cariId_key" ON "CariMusteriRelation"("cariId");

-- AddForeignKey
ALTER TABLE "CariMusteri" ADD CONSTRAINT "CariMusteri_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CariMusteriRelation" ADD CONSTRAINT "CariMusteriRelation_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE CASCADE ON UPDATE CASCADE;
