export interface GradeSummary {
  currentGrade: number | null;
  maxPossibleGrade: number | null;
  gradeMessage: string | null;
}

export type CourseShared = {
  courseId: string,
  name: string,
  description: string | null,
  color: string,
  createdAt: Date,
  updatedAt: Date,
  assessments?: AssessmentShared[];
  gradeSummary: GradeSummary;
}

export const AssessmentStatuses = {
  UPCOMING: "UPCOMING",
  SUBMITTED: "SUBMITTED",
  DUE_IN_48_HOURS: "DUE_IN_48_HOURS",
  OVERDUE: "OVERDUE",
  GRADED: "GRADED",
} as const;

export const AssessmentStatusMetadata = {
  UPCOMING: { label: "Upcoming", order: 3 },
  DUE_IN_48_HOURS: { label: "Due in 48 hours", order: 4 },
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
  maxScore: number,
  weight: number,
  submissionDate: Date | null,
  createdAt: Date,
  updatedAt: Date,
}

export type GradeComponent = Pick<AssessmentShared, "assessmentId" | "weight" | "score" | "maxScore" | "dueDate" | "submissionDate">;

export type Collision = {
  startDate: string,
  endDate: string,
  assessmentIdAndLabels: { assessmentId: string, title: string, courseName: string }[],
  count: number,
}

export type GoalInput = {
  targetGrade: number; // 0.0 - 1.0
  assessments: AssessmentShared[];
}

export type GoalOutput = {
  possible: boolean;
  averageRequiredPercent?: number;
  nextAssessmentRequiredScore?: number;
  requiredScores?: { assessmentId: string; requiredScore: number }[];
  message?: string;
}

