-- CreateTable
CREATE TABLE "StokTransfer" (
    "id" SERIAL NOT NULL,
    "kaynakStokId" INTEGER NOT NULL,
    "hedefStokId" INTEGER NOT NULL,
    "miktarGram" DOUBLE PRECISION NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StokTransfer_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_kaynakStokId_fkey" FOREIGN KEY ("kaynakStokId") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StokTransfer" ADD CONSTRAINT "StokTransfer_hedefStokId_fkey" FOREIGN KEY ("hedefStokId") REFERENCES "Stok"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
