/*
  Warnings:

  - You are about to drop the `BenchmarkModelSummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BenchmarkModelSummary" DROP CONSTRAINT "BenchmarkModelSummary_benchmarkRunId_fkey";

-- DropTable
DROP TABLE "BenchmarkModelSummary";
