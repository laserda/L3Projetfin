/*
  Warnings:

  - The values [Soumise,En_traitement] on the enum `StatutDemande` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatutDemande_new" AS ENUM ('SoumiseEnAttenteDePaiment', 'SoumisePayee', 'EnTraitement', 'Validée', 'Refusée', 'Livrée');
ALTER TABLE "Demande" ALTER COLUMN "Statut" TYPE "StatutDemande_new" USING ("Statut"::text::"StatutDemande_new");
ALTER TYPE "StatutDemande" RENAME TO "StatutDemande_old";
ALTER TYPE "StatutDemande_new" RENAME TO "StatutDemande";
DROP TYPE "StatutDemande_old";
COMMIT;

-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "DateDeces" TIMESTAMP(3),
ADD COLUMN     "DateMariage" TIMESTAMP(3),
ADD COLUMN     "DateNaissance" TIMESTAMP(3),
ADD COLUMN     "DemandePourTier" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "NumeroActe" TEXT NOT NULL DEFAULT '';
