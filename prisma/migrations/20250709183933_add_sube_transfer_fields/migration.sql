-- AlterTable
ALTER TABLE "Siparis" ADD COLUMN     "subeNeredenId" INTEGER,
ADD COLUMN     "subeNereyeId" INTEGER;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_subeNeredenId_fkey" FOREIGN KEY ("subeNeredenId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siparis" ADD CONSTRAINT "Siparis_subeNereyeId_fkey" FOREIGN KEY ("subeNereyeId") REFERENCES "Sube"("id") ON DELETE SET NULL ON UPDATE CASCADE;
