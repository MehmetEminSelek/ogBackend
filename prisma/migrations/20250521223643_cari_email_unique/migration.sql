/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Cari` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Cari_email_key" ON "Cari"("email");
