/*
  Warnings:

  - You are about to drop the `History` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "History" DROP CONSTRAINT "History_providerId_fkey";

-- DropTable
DROP TABLE "History";

-- CreateTable
CREATE TABLE "Logs" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "systemPrompt" TEXT,
    "response" TEXT NOT NULL,
    "functionCalls" JSONB,
    "functionResults" JSONB,
    "model" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "usage" JSONB,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Logs" ADD CONSTRAINT "Logs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
