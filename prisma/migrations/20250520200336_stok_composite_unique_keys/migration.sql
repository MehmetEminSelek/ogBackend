/*
  Warnings:

  - A unique constraint covering the columns `[hammaddeId,operasyonBirimiId]` on the table `Stok` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[yariMamulId,operasyonBirimiId]` on the table `Stok` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Stok_hammaddeId_operasyonBirimiId_key" ON "Stok"("hammaddeId", "operasyonBirimiId");

-- CreateIndex
CREATE UNIQUE INDEX "Stok_yariMamulId_operasyonBirimiId_key" ON "Stok"("yariMamulId", "operasyonBirimiId");
