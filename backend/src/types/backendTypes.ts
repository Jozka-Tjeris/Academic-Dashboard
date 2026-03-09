import { AssessmentShared, CourseShared } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

export interface GradeSummary {
  currentGrade: Prisma.Decimal;
  maxPossibleGrade: Prisma.Decimal;
}

export type CourseBackend = Omit<CourseShared, 'assessments' | 'gradeSummary'> & {
  assessments?: AssessmentBackend[];
  gradeSummary: GradeSummary;
}

export type AssessmentBackend = Omit<AssessmentShared, 'score' | 'targetScore' | 'maxScore' | 'weight' | 'latePenalty' | 'status' > & {
  score: Prisma.Decimal | null
  targetScore: Prisma.Decimal | null
  maxScore: Prisma.Decimal | null
  weight: Prisma.Decimal,
  latePenalty: Prisma.Decimal | null,
}

export type GradeComponent = Pick<AssessmentBackend, "assessmentId" | "weight" | "score" | "maxScore">;