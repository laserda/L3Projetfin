-- DropForeignKey
ALTER TABLE "Demande" DROP CONSTRAINT "Demande_ID_Citoyen_fkey";

-- AlterTable
ALTER TABLE "Demande" ALTER COLUMN "ID_Citoyen" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_ID_Citoyen_fkey" FOREIGN KEY ("ID_Citoyen") REFERENCES "Citoyen"("ID_Citoyen") ON DELETE SET NULL ON UPDATE CASCADE;
