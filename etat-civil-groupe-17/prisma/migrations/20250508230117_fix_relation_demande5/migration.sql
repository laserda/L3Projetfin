/*
  Warnings:

  - Made the column `ID_Citoyen` on table `Demande` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Demande" DROP CONSTRAINT "Demande_ID_Citoyen_fkey";

-- AlterTable
ALTER TABLE "Demande" ALTER COLUMN "ID_Citoyen" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_ID_Citoyen_fkey" FOREIGN KEY ("ID_Citoyen") REFERENCES "Citoyen"("ID_Citoyen") ON DELETE RESTRICT ON UPDATE CASCADE;
