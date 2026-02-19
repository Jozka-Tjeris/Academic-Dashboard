/*
  Warnings:

  - Added the required column `dueDate` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `Assessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "latePenalty" DOUBLE PRECISION,
ADD COLUMN     "score" DOUBLE PRECISION,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "targetScore" DOUBLE PRECISION,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
