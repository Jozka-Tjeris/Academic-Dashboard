export interface GradeSummary {
  currentGrade: number | null;
  maxPossibleGrade: number | null;
  gradeMessage: string | null;
}

export type CourseShared = {
  courseId: string,
  name: string,
  description: string | null,
  createdAt: Date,
  updatedAt: Date,
  assessments?: AssessmentShared[];
  gradeSummary: GradeSummary;
}

export enum AssessmentStatus {
  "UPCOMING",
  "SUBMITTED",
  "DUE_IN_24_HOURS",
  "OVERDUE",
  "GRADED",
}

export type AssessmentShared = {
  assessmentId: string,
  courseId: string,
  title: string,
  description: string | null,
  dueDate: Date,
  status: AssessmentStatus,
  score: number | null,
  targetScore: number | null,
  maxScore: number | null,
  weight: number,
  latePenalty: number | null,
  submitted: boolean,
  createdAt: Date,
  updatedAt: Date,
}

export type GradeComponent = Pick<AssessmentShared, "assessmentId" | "weight" | "score" | "maxScore">;

export type Collision = {
  startDate: string,
  endDate: string,
  assessmentIds: string[],
  count: number,
}
