-- DropForeignKey
ALTER TABLE "Demande" DROP CONSTRAINT "Demande_ID_Paiement_fkey";

-- AlterTable
ALTER TABLE "Demande" ALTER COLUMN "ID_Paiement" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_ID_Paiement_fkey" FOREIGN KEY ("ID_Paiement") REFERENCES "Paiement"("ID_Paiement") ON DELETE SET NULL ON UPDATE CASCADE;
