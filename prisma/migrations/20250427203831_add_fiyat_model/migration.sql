-- CreateTable
CREATE TABLE "Fiyat" (
    "id" SERIAL NOT NULL,
    "urunId" INTEGER NOT NULL,
    "fiyat" DOUBLE PRECISION NOT NULL,
    "gecerliTarih" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fiyat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Fiyat_urunId_gecerliTarih_key" ON "Fiyat"("urunId", "gecerliTarih");

-- AddForeignKey
ALTER TABLE "Fiyat" ADD CONSTRAINT "Fiyat_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
