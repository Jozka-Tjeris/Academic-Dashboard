/*
  Warnings:

  - Made the column `maxScore` on table `Assessment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Assessment" ALTER COLUMN "maxScore" SET NOT NULL,
ALTER COLUMN "maxScore" SET DEFAULT 100;

ALTER TABLE "Assessment"
ADD CONSTRAINT status_enum_check
CHECK (status IN ('upcoming', 'submitted', 'due in 24 hours', 'overdue', 'graded'));

ALTER TABLE "Assessment"
ADD CONSTRAINT score_range_check
CHECK (score IS NULL OR (score >= 0 AND score <= "maxScore"));

ALTER TABLE "Assessment"
ADD CONSTRAINT targetScore_range_check
CHECK (targetScore IS NULL OR (targetScore >= 0 AND targetScore <= "maxScore"));

ALTER TABLE "Assessment"
ADD CONSTRAINT maxScore_range_check
CHECK (maxScore >= 0 AND maxScore <= 100);

ALTER TABLE "Assessment"
ADD CONSTRAINT weight_range_check
CHECK (weight >= 0 AND weight <= 100);

ALTER TABLE "Assessment"
ADD CONSTRAINT latePenalty_range_check
CHECK (latePenalty IS NULL OR (latePenalty >= 0 AND latePenalty <= 100));
