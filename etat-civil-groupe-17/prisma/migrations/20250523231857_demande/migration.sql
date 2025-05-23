/*
  Warnings:

  - You are about to drop the column `ID_Document_Acte` on the `Historique_Modifications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Historique_Modifications" DROP CONSTRAINT "Historique_Modifications_ID_Document_Acte_fkey";

-- DropIndex
DROP INDEX "Historique_Modifications_ID_Document_Acte_idx";

-- AlterTable
ALTER TABLE "Historique_Modifications" DROP COLUMN "ID_Document_Acte";
