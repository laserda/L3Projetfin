/*
  Warnings:

  - Added the required column `password` to the `Citoyen` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Citoyen" ADD COLUMN     "password" TEXT NOT NULL;
