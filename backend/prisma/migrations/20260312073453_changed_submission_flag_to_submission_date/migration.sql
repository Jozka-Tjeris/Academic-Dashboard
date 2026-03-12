/*
  Warnings:

  - You are about to drop the column `submitted` on the `Assessment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Assessment" DROP COLUMN "submitted",
ADD COLUMN     "submissionDate" TIMESTAMP(3);
