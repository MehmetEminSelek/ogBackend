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

    CONSTRAINT "SiparisKalemi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiparisKalemi_siparisId_idx" ON "SiparisKalemi"("siparisId");

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
