import { AssessmentStatus, Prisma } from "@prisma/client";

export type Course = {
  courseId: string,
  name: string,
  description: string | null,
  createdAt: Date,
  updatedAt: Date,
  assessments?: Assessment[];
}

export type Assessment = {
  assessmentId: string,
  courseId: string,
  title: string,
  description: string | null,
  dueDate: Date,
  status: AssessmentStatus,
  score: Prisma.Decimal | null,
  targetScore: Prisma.Decimal | null,
  maxScore: Prisma.Decimal | null,
  weight: Prisma.Decimal,
  latePenalty: Prisma.Decimal | null,
  isSimulated: boolean | null,
  submitted: boolean,
  createdAt: Date,
  updatedAt: Date,
}