-- Update KargoDurumu enum
ALTER TYPE "KargoDurumu" ADD VALUE 'KARGOYA_VERILECEK';
ALTER TYPE "KargoDurumu" ADD VALUE 'KARGODA';
ALTER TYPE "KargoDurumu" ADD VALUE 'TESLIM_EDILDI';
ALTER TYPE "KargoDurumu" ADD VALUE 'SUBEYE_GONDERILECEK';
ALTER TYPE "KargoDurumu" ADD VALUE 'SUBEDE_TESLIM';
ALTER TYPE "KargoDurumu" ADD VALUE 'IPTAL';

-- Update existing records to use new enum values
UPDATE "Siparis" SET "kargoDurumu" = 'KARGOYA_VERILECEK'::text::"KargoDurumu" 
WHERE "kargoDurumu" = 'ADRESE_TESLIMAT' AND "teslimatTuruId" IN (
    SELECT id FROM "TeslimatTuru" WHERE kodu IN ('TT001', 'TT003', 'TT004', 'TT006')
);

UPDATE "Siparis" SET "kargoDurumu" = 'SUBEYE_GONDERILECEK'::text::"KargoDurumu" 
WHERE "kargoDurumu" = 'ADRESE_TESLIMAT' AND "teslimatTuruId" IN (
    SELECT id FROM "TeslimatTuru" WHERE kodu = 'TT007'
);

UPDATE "Siparis" SET "kargoDurumu" = 'SUBEDE_TESLIM'::text::"KargoDurumu" 
WHERE "kargoDurumu" = 'ADRESE_TESLIMAT' AND "teslimatTuruId" IN (
    SELECT id FROM "TeslimatTuru" WHERE kodu = 'TT002'
); 