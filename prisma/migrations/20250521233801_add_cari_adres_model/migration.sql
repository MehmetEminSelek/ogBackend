/*
  Warnings:

  - You are about to drop the column `adres` on the `Cari` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Cari" DROP COLUMN "adres";

-- CreateTable
CREATE TABLE "Adres" (
    "id" SERIAL NOT NULL,
    "cariId" INTEGER NOT NULL,
    "tip" TEXT NOT NULL,
    "adres" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Adres_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Adres" ADD CONSTRAINT "Adres_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "Cari"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
