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

-- CreateIndex
CREATE INDEX "Odeme_siparisId_idx" ON "Odeme"("siparisId");

-- AddForeignKey
ALTER TABLE "Odeme" ADD CONSTRAINT "Odeme_siparisId_fkey" FOREIGN KEY ("siparisId") REFERENCES "Siparis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
