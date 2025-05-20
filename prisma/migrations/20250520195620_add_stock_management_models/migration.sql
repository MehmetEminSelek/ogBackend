-- CreateTable
CREATE TABLE "OperasyonBirimi" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,

    CONSTRAINT "OperasyonBirimi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hammadde" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,

    CONSTRAINT "Hammadde_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YariMamul" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kod" TEXT NOT NULL,

    CONSTRAINT "YariMamul_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stok" (
    "id" SERIAL NOT NULL,
    "hammaddeId" INTEGER,
    "yariMamulId" INTEGER,
    "operasyonBirimiId" INTEGER NOT NULL,
    "miktarGram" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Stok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recete" (
    "id" SERIAL NOT NULL,
    "urunAd" TEXT NOT NULL,
    "stokKod" TEXT NOT NULL,
    "miktarGram" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Recete_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OperasyonBirimi_kod_key" ON "OperasyonBirimi"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Hammadde_kod_key" ON "Hammadde"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "YariMamul_kod_key" ON "YariMamul"("kod");

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_hammaddeId_fkey" FOREIGN KEY ("hammaddeId") REFERENCES "Hammadde"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_yariMamulId_fkey" FOREIGN KEY ("yariMamulId") REFERENCES "YariMamul"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Stok" ADD CONSTRAINT "Stok_operasyonBirimiId_fkey" FOREIGN KEY ("operasyonBirimiId") REFERENCES "OperasyonBirimi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
