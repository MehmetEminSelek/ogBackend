-- CreateTable
CREATE TABLE "OzelTepsi" (
    "id" SERIAL NOT NULL,
    "kod" TEXT NOT NULL,
    "ad" TEXT NOT NULL,
    "aciklama" TEXT,
    "fiyat" DOUBLE PRECISION NOT NULL,
    "toplamKg" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OzelTepsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OzelTepsiIcerik" (
    "id" SERIAL NOT NULL,
    "ozelTepsiId" INTEGER NOT NULL,
    "urunId" INTEGER NOT NULL,
    "miktar" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "OzelTepsiIcerik_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OzelTepsi_kod_key" ON "OzelTepsi"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "OzelTepsiIcerik_ozelTepsiId_urunId_key" ON "OzelTepsiIcerik"("ozelTepsiId", "urunId");

-- AddForeignKey
ALTER TABLE "OzelTepsiIcerik" ADD CONSTRAINT "OzelTepsiIcerik_ozelTepsiId_fkey" FOREIGN KEY ("ozelTepsiId") REFERENCES "OzelTepsi"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OzelTepsiIcerik" ADD CONSTRAINT "OzelTepsiIcerik_urunId_fkey" FOREIGN KEY ("urunId") REFERENCES "Urun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
