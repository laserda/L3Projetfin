/*
  Warnings:

  - Added the required column `Password` to the `Agent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Agent" ADD COLUMN     "Password" TEXT NOT NULL;
