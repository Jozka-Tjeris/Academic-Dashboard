import { AssessmentShared, CourseShared } from "@internal_package/shared";
import { AssessmentStatus, Prisma } from "@prisma/client";

export interface GradeSummary {
  currentGrade: Prisma.Decimal;
  maxPossibleGrade: Prisma.Decimal;
}

export type CourseBackend = Omit<CourseShared, 'assessments' | 'gradeSummary'> & {
  assessments?: AssessmentBackend[];
  gradeSummary: GradeSummary;
}

export type AssessmentBackend = Omit<AssessmentShared, 'score' | 'targetScore' | 'maxScore' | 'weight' | 'status' | 'latePenalty' | 'simulatedScore' > & {
  status: AssessmentStatus,
  score: Prisma.Decimal | null
  targetScore: Prisma.Decimal | null
  maxScore: Prisma.Decimal | null
  weight: Prisma.Decimal,
  latePenalty: Prisma.Decimal | null,
  simulatedScore: Prisma.Decimal | null,
}

export type GradeComponent = Pick<AssessmentBackend, "assessmentId" | "weight" | "score" | "maxScore">;