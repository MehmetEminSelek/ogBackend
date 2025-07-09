/*
  Warnings:

  - The values [AMBALAJ_MALZEMESI] on the enum `MaterialTipi` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ambalajId` on the `SiparisKalemi` table. All the data in the column will be lost.
  - You are about to drop the `Ambalaj` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MaterialTipi_new" AS ENUM ('HAMMADDE', 'YARI_MAMUL', 'YARDIMCI_MADDE');
ALTER TABLE "Material" ALTER COLUMN "tipi" TYPE "MaterialTipi_new" USING ("tipi"::text::"MaterialTipi_new");
ALTER TYPE "MaterialTipi" RENAME TO "MaterialTipi_old";
ALTER TYPE "MaterialTipi_new" RENAME TO "MaterialTipi";
DROP TYPE "MaterialTipi_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "SiparisKalemi" DROP CONSTRAINT "SiparisKalemi_ambalajId_fkey";

-- AlterTable
ALTER TABLE "SiparisKalemi" DROP COLUMN "ambalajId";

-- DropTable
DROP TABLE "Ambalaj";

-- DropEnum
DROP TYPE "AmbalajTipi";
