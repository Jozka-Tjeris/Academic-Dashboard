import { AssessmentWithUrgency } from "./dashboard";

export type CourseAnalytics = {
  currentGrade: number,
  maxPossibleGrade: number,
  assessmentCounts: {
    total: number;
    submitted: number;
    graded: number;
    in24hrs: number;
    pending: number;
    overdue: number;
  },
  urgency: {
    totalUrgency: number,
    averageUrgency: number,
    topAssessments: AssessmentWithUrgency[],
  },
};
