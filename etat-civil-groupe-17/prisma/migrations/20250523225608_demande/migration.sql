/*
  Warnings:

  - You are about to drop the column `ID_Entite` on the `Historique_Modifications` table. All the data in the column will be lost.
  - Added the required column `ID_Demande` to the `Historique_Modifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ID_Document_Acte` to the `Historique_Modifications` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Historique_Modifications" DROP CONSTRAINT "fk_acte";

-- DropForeignKey
ALTER TABLE "Historique_Modifications" DROP CONSTRAINT "fk_demande";

-- DropIndex
DROP INDEX "Historique_Modifications_ID_Entite_idx";

-- AlterTable
ALTER TABLE "Historique_Modifications" DROP COLUMN "ID_Entite",
ADD COLUMN     "ID_Demande" TEXT NOT NULL,
ADD COLUMN     "ID_Document_Acte" TEXT NOT NULL,
ALTER COLUMN "DateModification" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Historique_Modifications_ID_Demande_idx" ON "Historique_Modifications"("ID_Demande");

-- CreateIndex
CREATE INDEX "Historique_Modifications_ID_Document_Acte_idx" ON "Historique_Modifications"("ID_Document_Acte");

-- AddForeignKey
ALTER TABLE "Historique_Modifications" ADD CONSTRAINT "fk_demande" FOREIGN KEY ("ID_Demande") REFERENCES "Demande"("ID_Demande") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Historique_Modifications" ADD CONSTRAINT "fk_acte" FOREIGN KEY ("ID_Document_Acte") REFERENCES "Document_Acte"("ID_Document_Acte") ON DELETE RESTRICT ON UPDATE CASCADE;
