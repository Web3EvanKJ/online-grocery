/*
  Warnings:

  - Added the required column `subdistrict` to the `addresses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "addresses" ADD COLUMN     "subdistrict" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "transaction_id" TEXT;
