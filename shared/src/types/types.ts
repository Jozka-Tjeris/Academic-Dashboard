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

export const AssessmentStatuses = {
  UPCOMING: "UPCOMING",
  SUBMITTED: "SUBMITTED",
  DUE_IN_24_HOURS: "DUE_IN_24_HOURS",
  OVERDUE: "OVERDUE",
  GRADED: "GRADED",
} as const;

export const AssessmentStatusMetadata = {
  UPCOMING: { label: "Upcoming", order: 3 },
  DUE_IN_24_HOURS: { label: "Due in 24 hours", order: 4 },
  OVERDUE: { label: "Overdue", order: 5 },
  SUBMITTED: { label: "Submitted", order: 2 },
  GRADED: { label: "Graded", order: 1 },
} as const;

export type AssessmentStatus = keyof typeof AssessmentStatuses;

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
  submissionDate: Date | null,
  createdAt: Date,
  updatedAt: Date,
}

export type GradeComponent = Pick<AssessmentShared, "assessmentId" | "weight" | "score" | "maxScore" | "dueDate" | "submissionDate">;

export type Collision = {
  startDate: string,
  endDate: string,
  assessmentIds: string[],
  count: number,
}
