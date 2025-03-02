/*
  Warnings:

  - The `usage` column on the `History` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `provider` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `History` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `duration` on the `History` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "History" ADD COLUMN     "functionCalls" JSONB,
ADD COLUMN     "functionResults" JSONB,
ADD COLUMN     "provider" TEXT NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
DROP COLUMN "duration",
ADD COLUMN     "duration" INTEGER NOT NULL,
DROP COLUMN "usage",
ADD COLUMN     "usage" JSONB;
