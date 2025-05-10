/*
  Warnings:

  - Changed the type of `DemandePourTier` on the `Demande` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DemandePourTier" AS ENUM ('Moi', 'MonEnfant', 'UnMenbreFamile', 'Autre');

-- AlterTable
ALTER TABLE "Demande" DROP COLUMN "DemandePourTier",
ADD COLUMN     "DemandePourTier" "DemandePourTier" NOT NULL;
