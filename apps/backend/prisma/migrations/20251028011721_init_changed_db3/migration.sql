/*
  Warnings:

  - A unique constraint covering the columns `[product_id,store_id]` on the table `inventories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id]` on the table `store_admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[store_id]` on the table `store_admins` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "inventories_product_id_store_id_key" ON "inventories"("product_id", "store_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "store_admins_user_id_key" ON "store_admins"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "store_admins_store_id_key" ON "store_admins"("store_id");
