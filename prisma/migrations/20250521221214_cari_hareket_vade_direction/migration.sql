/*
  Warnings:

  - Added the required column `direction` to the `CariHareket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CariHareket" ADD COLUMN     "direction" TEXT NOT NULL,
ADD COLUMN     "vadeTarihi" TIMESTAMP(3);
