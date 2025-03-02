-- CreateTable
CREATE TABLE "BenchmarkRun" (
    "id" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'running',
    "duration" INTEGER DEFAULT 0,
    "datasetSize" INTEGER NOT NULL,
    "promptTemplate" TEXT NOT NULL,
    "providerModels" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BenchmarkRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkResult" (
    "id" TEXT NOT NULL,
    "benchmarkRunId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "completion" TEXT NOT NULL,
    "expected" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "duration" INTEGER NOT NULL,
    "promptTokens" INTEGER NOT NULL,
    "completionTokens" INTEGER NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL,
    "input" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenchmarkResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkModelSummary" (
    "id" TEXT NOT NULL,
    "benchmarkRunId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "avgSimilarity" DOUBLE PRECISION NOT NULL,
    "avgDuration" DOUBLE PRECISION NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "successfulRequests" INTEGER NOT NULL,
    "failedRequests" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BenchmarkModelSummary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BenchmarkResult" ADD CONSTRAINT "BenchmarkResult_benchmarkRunId_fkey" FOREIGN KEY ("benchmarkRunId") REFERENCES "BenchmarkRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchmarkModelSummary" ADD CONSTRAINT "BenchmarkModelSummary_benchmarkRunId_fkey" FOREIGN KEY ("benchmarkRunId") REFERENCES "BenchmarkRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
