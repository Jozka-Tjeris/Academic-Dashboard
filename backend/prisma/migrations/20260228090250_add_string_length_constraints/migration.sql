/*
  Warnings:

  - You are about to alter the column `description` on the `Assessment` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.
  - You are about to alter the column `title` on the `Assessment` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.
  - You are about to alter the column `description` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.
  - You are about to alter the column `name` on the `Course` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.

*/
-- AlterTable
ALTER TABLE "Assessment" ALTER COLUMN "description" SET DATA TYPE VARCHAR(250),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "description" SET DATA TYPE VARCHAR(250),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(40);
