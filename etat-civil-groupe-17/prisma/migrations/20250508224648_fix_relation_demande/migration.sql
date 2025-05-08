/*
  Warnings:

  - You are about to drop the column `Date_Delivrance` on the `Document_Acte` table. All the data in the column will be lost.
  - You are about to drop the column `Signature_Numerique` on the `Document_Acte` table. All the data in the column will be lost.
  - Added the required column `DateDelivrance` to the `Document_Acte` table without a default value. This is not possible if the table is not empty.
  - Added the required column `SignatureNumerique` to the `Document_Acte` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document_Acte" DROP COLUMN "Date_Delivrance",
DROP COLUMN "Signature_Numerique",
ADD COLUMN     "DateDelivrance" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "SignatureNumerique" TEXT NOT NULL;
