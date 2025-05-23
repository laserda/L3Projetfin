-- DropForeignKey
ALTER TABLE "Historique_Modifications" DROP CONSTRAINT "fk_acte";

-- DropForeignKey
ALTER TABLE "Historique_Modifications" DROP CONSTRAINT "fk_demande";

-- AlterTable
ALTER TABLE "Historique_Modifications" ALTER COLUMN "ID_Demande" DROP NOT NULL,
ALTER COLUMN "ID_Document_Acte" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Historique_Modifications" ADD CONSTRAINT "Historique_Modifications_ID_Demande_fkey" FOREIGN KEY ("ID_Demande") REFERENCES "Demande"("ID_Demande") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique_Modifications" ADD CONSTRAINT "Historique_Modifications_ID_Document_Acte_fkey" FOREIGN KEY ("ID_Document_Acte") REFERENCES "Document_Acte"("ID_Document_Acte") ON DELETE SET NULL ON UPDATE CASCADE;
