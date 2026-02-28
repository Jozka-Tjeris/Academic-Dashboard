/*
  Warnings:

  - You are about to alter the column `latePenalty` on the `Assessment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `score` on the `Assessment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `targetScore` on the `Assessment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `weight` on the `Assessment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `maxScore` on the `Assessment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - Changed the type of `status` on the `Assessment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('upcoming', 'submitted', 'due in 24 hours', 'overdue', 'graded');

-- AlterTable
ALTER TABLE "Assessment" ALTER COLUMN "latePenalty" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "score" SET DATA TYPE DECIMAL(5,2),
DROP COLUMN "status",
ADD COLUMN     "status" "AssessmentStatus" NOT NULL,
ALTER COLUMN "targetScore" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "weight" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "maxScore" SET DATA TYPE DECIMAL(5,2);
