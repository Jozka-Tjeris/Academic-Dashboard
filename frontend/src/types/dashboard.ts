import { CourseShared, AssessmentShared, Collision } from "@internal_package/shared";

export type DashboardStats = {
  dueNext7Days: number;
  dueNext14Days: number;
  totalUpcomingWeight: number;
  highestWeightUpcoming: AssessmentShared | null;
  busiestWeek: {
    start: string;
    end: string;
    assessmentCount: number;
  } | null;
};

export type AssessmentWithUrgency = AssessmentShared & {
  urgency: number;
};

export type CourseDashboard = {
  course: CourseShared;
  workload: {
    upcomingAssessments: AssessmentWithUrgency[];
    stats: DashboardStats;
  };
  collisions: Collision[];
};

export type UserDashboard = {
  courses: CourseShared[];
  workload: {
    upcomingAssessments: AssessmentWithUrgency[];
    stats: DashboardStats;
  };
  collisions: Collision[];
};
