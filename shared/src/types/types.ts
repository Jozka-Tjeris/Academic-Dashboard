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

export type AssessmentShared = {
  assessmentId: string,
  courseId: string,
  title: string,
  description: string | null,
  dueDate: Date,
  status: "UPCOMING" | "SUBMITTED" | "DUE_IN_24_HOURS" | "OVERDUE" | "GRADED",
  score: number | null,
  targetScore: number | null,
  maxScore: number | null,
  weight: number,
  latePenalty: number | null,
  isSimulated: boolean | null,
  submitted: boolean,
  createdAt: Date,
  updatedAt: Date,
}

export type GradeComponent = Pick<AssessmentShared, "assessmentId" | "weight" | "score" | "maxScore">;
