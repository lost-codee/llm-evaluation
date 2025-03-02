/*
  Warnings:

  - You are about to drop the column `provider` on the `History` table. All the data in the column will be lost.
  - You are about to drop the `BenchmarkResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BenchmarkRun` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `providerId` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BenchmarkResult" DROP CONSTRAINT "BenchmarkResult_benchmarkRunId_fkey";

-- AlterTable
ALTER TABLE "History" DROP COLUMN "provider",
ADD COLUMN     "providerId" TEXT NOT NULL;

-- DropTable
DROP TABLE "BenchmarkResult";

-- DropTable
DROP TABLE "BenchmarkRun";

-- AddForeignKey
ALTER TABLE "History" ADD CONSTRAINT "History_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
