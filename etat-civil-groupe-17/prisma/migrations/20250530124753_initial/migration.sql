/*
  Warnings:

  - A unique constraint covering the columns `[ID_Demande]` on the table `Deces` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ID_Demande]` on the table `Mariage` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ID_Demande]` on the table `Naissance` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `DemandePourTier` on the `Demande` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "QuiDemande" AS ENUM ('LeMari', 'LaFemme');

-- DropIndex
DROP INDEX "Deces_ID_Demande_idx";

-- DropIndex
DROP INDEX "Mariage_ID_Demande_idx";

-- DropIndex
DROP INDEX "Naissance_ID_Demande_idx";

-- AlterTable
ALTER TABLE "Demande" DROP COLUMN "DemandePourTier",
ADD COLUMN     "DemandePourTier" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Deces_ID_Demande_key" ON "Deces"("ID_Demande");

-- CreateIndex
CREATE UNIQUE INDEX "Mariage_ID_Demande_key" ON "Mariage"("ID_Demande");

-- CreateIndex
CREATE UNIQUE INDEX "Naissance_ID_Demande_key" ON "Naissance"("ID_Demande");
