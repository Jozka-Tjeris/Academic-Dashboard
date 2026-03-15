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

export type AssessmentBackend = Omit<AssessmentShared, 'score' | 'targetScore' | 'maxScore' | 'weight' | 'status' > & {
  score: Prisma.Decimal | null
  targetScore: Prisma.Decimal | null
  maxScore: Prisma.Decimal
  weight: Prisma.Decimal,
}

export type GradeComponent = Pick<AssessmentBackend, "assessmentId" | "weight" | "score" | "maxScore" | "dueDate" | "submissionDate">;

export type AssessmentWithCourseName = AssessmentBackend & {
  course: {
    name: string;
  }
};

export type GoalInputBackend = {
  targetGrade: Prisma.Decimal;
  assessments: GradeComponent[];
}
