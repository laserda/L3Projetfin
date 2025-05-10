/*
  Warnings:

  - You are about to drop the column `DateDeces` on the `Demande` table. All the data in the column will be lost.
  - You are about to drop the column `DateMariage` on the `Demande` table. All the data in the column will be lost.
  - You are about to drop the column `DateNaissance` on the `Demande` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Demande" DROP COLUMN "DateDeces",
DROP COLUMN "DateMariage",
DROP COLUMN "DateNaissance",
ADD COLUMN     "DateActe" TIMESTAMP(3),
ADD COLUMN     "Nom" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "Prenom" TEXT NOT NULL DEFAULT '';
