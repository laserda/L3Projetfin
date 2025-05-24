-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "DateNaisMere" TIMESTAMP(3),
ADD COLUMN     "DateNaisPere" TIMESTAMP(3),
ADD COLUMN     "NomMere" TEXT DEFAULT '',
ADD COLUMN     "NomPere" TEXT DEFAULT '',
ADD COLUMN     "PrenomMere" TEXT DEFAULT '',
ADD COLUMN     "PrenomPere" TEXT DEFAULT '';
