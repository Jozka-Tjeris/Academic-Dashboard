export interface GradeSummary {
  currentGrade: number;
  maxPossibleGrade: number;
}

export type Course = {
  courseId: string,
  name: string,
  description: string | null,
  createdAt: Date,
  updatedAt: Date,
  assessments?: Assessment[];
  gradeSummary: GradeSummary;
}

export type Assessment = {
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