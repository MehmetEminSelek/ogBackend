-- AlterTable
ALTER TABLE "SiparisKalemi" ADD COLUMN     "kutuId" INTEGER,
ADD COLUMN     "tepsiTavaId" INTEGER;

-- CreateIndex
CREATE INDEX "SiparisKalemi_tepsiTavaId_idx" ON "SiparisKalemi"("tepsiTavaId");

-- CreateIndex
CREATE INDEX "SiparisKalemi_kutuId_idx" ON "SiparisKalemi"("kutuId");

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_tepsiTavaId_fkey" FOREIGN KEY ("tepsiTavaId") REFERENCES "TepsiTava"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiparisKalemi" ADD CONSTRAINT "SiparisKalemi_kutuId_fkey" FOREIGN KEY ("kutuId") REFERENCES "Kutu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
