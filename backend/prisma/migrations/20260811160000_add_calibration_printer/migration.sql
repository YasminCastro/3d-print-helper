-- AlterTable
ALTER TABLE "calibrations" ADD COLUMN     "printer_id" INTEGER;

-- AddForeignKey
ALTER TABLE "calibrations" ADD CONSTRAINT "calibrations_printer_id_fkey" FOREIGN KEY ("printer_id") REFERENCES "printers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
