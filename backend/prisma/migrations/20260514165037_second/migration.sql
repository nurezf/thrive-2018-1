/*
  Warnings:

  - You are about to drop the column `order_id` on the `Payments` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Payments" DROP COLUMN "order_id";
