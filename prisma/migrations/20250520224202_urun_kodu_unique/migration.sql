/*
  Warnings:

  - A unique constraint covering the columns `[kodu]` on the table `Urun` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Urun_kodu_key" ON "Urun"("kodu");
