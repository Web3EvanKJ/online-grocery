/*
  Warnings:

  - Added the required column `city` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `stores` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `stores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stores" ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL;
