/*
  Warnings:

  - A unique constraint covering the columns `[urunId,birim,gecerliTarih]` on the table `Fiyat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `birim` to the `Fiyat` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Fiyat_urunId_gecerliTarih_key";

-- AlterTable
ALTER TABLE "Fiyat" ADD COLUMN     "birim" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Fiyat_urunId_birim_gecerliTarih_key" ON "Fiyat"("urunId", "birim", "gecerliTarih");
