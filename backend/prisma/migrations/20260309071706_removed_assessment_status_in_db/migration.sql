/*
  Warnings:

  - You are about to drop the column `status` on the `Assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "status";

-- DropEnum
DROP TYPE "AssessmentStatus";
