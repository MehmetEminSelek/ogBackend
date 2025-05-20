-- CreateTable
CREATE TABLE "StokHareket" (
    "id" SERIAL NOT NULL,
    "stokId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "miktarGram" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StokHareket_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StokHareket" ADD CONSTRAINT "StokHareket_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
