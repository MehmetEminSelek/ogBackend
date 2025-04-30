-- CreateTable
CREATE TABLE "TeslimatTuru" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "TeslimatTuru_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sube" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "Sube_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GonderenAliciTipi" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "GonderenAliciTipi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ambalaj" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "Ambalaj_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TepsiTava" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "TepsiTava_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kutu" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "Kutu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Urun" (
    "id" SERIAL NOT NULL,
    "ad" TEXT NOT NULL,
    "kodu" TEXT,

    CONSTRAINT "Urun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeslimatTuru_ad_key" ON "TeslimatTuru"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Sube_ad_key" ON "Sube"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "GonderenAliciTipi_ad_key" ON "GonderenAliciTipi"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Ambalaj_ad_key" ON "Ambalaj"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "TepsiTava_ad_key" ON "TepsiTava"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Kutu_ad_key" ON "Kutu"("ad");

-- CreateIndex
CREATE UNIQUE INDEX "Urun_ad_key" ON "Urun"("ad");
