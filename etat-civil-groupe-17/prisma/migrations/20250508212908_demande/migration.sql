/*
  Warnings:

  - You are about to drop the column `Date_Demande` on the `Demande` table. All the data in the column will be lost.
  - You are about to drop the column `Type_Acte` on the `Demande` table. All the data in the column will be lost.
  - You are about to drop the column `Date_Archivage` on the `Document_Acte` table. All the data in the column will be lost.
  - You are about to drop the column `Est_Archive` on the `Document_Acte` table. All the data in the column will be lost.
  - You are about to drop the column `Date_Modification` on the `Historique_Modifications` table. All the data in the column will be lost.
  - You are about to drop the column `Type_Entite` on the `Historique_Modifications` table. All the data in the column will be lost.
  - You are about to drop the column `Date_Paiement` on the `Paiement` table. All the data in the column will be lost.
  - You are about to drop the column `Mode_Paiement` on the `Paiement` table. All the data in the column will be lost.
  - Added the required column `DateDemande` to the `Demande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TypeActe` to the `Demande` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DateArchivage` to the `Document_Acte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `EstArchive` to the `Document_Acte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DateModification` to the `Historique_Modifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `TypeEntite` to the `Historique_Modifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `DatePaiement` to the `Paiement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ModePaiement` to the `Paiement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Demande" DROP COLUMN "Date_Demande",
DROP COLUMN "Type_Acte",
ADD COLUMN     "DateDemande" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "TypeActe" "TypeActe" NOT NULL;

-- AlterTable
ALTER TABLE "Document_Acte" DROP COLUMN "Date_Archivage",
DROP COLUMN "Est_Archive",
ADD COLUMN     "DateArchivage" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "EstArchive" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Historique_Modifications" DROP COLUMN "Date_Modification",
DROP COLUMN "Type_Entite",
ADD COLUMN     "DateModification" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "TypeEntite" "TypeEntite" NOT NULL;

-- AlterTable
ALTER TABLE "Paiement" DROP COLUMN "Date_Paiement",
DROP COLUMN "Mode_Paiement",
ADD COLUMN     "DatePaiement" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ModePaiement" "ModePaiement" NOT NULL;
