import { Collision } from "@internal_package/shared";
import { Prisma } from "@prisma/client";
import { AssessmentWithUrgency } from "src/domain/assessments/rankAssessmentsByUrgency";
import { AssessmentBackend, CourseBackend } from "src/types/backendTypes";
import { decimalToNumberOrNull, serializeCourses } from "../courses/courseSerializer";
import { serializeAssessmentWithUrgency } from "../courses/courseAnalyticsSerializer";
import { serializeAssessment } from "../assessments/assessmentSerializer";

export function serializeUserDashboard(dashboard: {
  courses: CourseBackend[];
  workload: {
    upcomingAssessments: AssessmentWithUrgency[];
    stats: {
      dueNext7Days: number;
      dueNext14Days: number;
      totalUpcomingWeight: Prisma.Decimal;
      highestWeightUpcoming: AssessmentBackend | null;
      busiestWeek: {
        start: Date;
        end: Date;
        assessmentCount: number;
      } | null;
    };
  };
  collisions: Collision[];
}){
  return {
    course: serializeCourses(dashboard.courses),

    workload: {
      urgentAssessments:
        dashboard.workload.upcomingAssessments.map(
          serializeAssessmentWithUrgency
        ),

      stats: {
        dueNext7Days: dashboard.workload.stats.dueNext7Days,
        dueNext14Days: dashboard.workload.stats.dueNext14Days,

        totalUpcomingWeight: decimalToNumberOrNull(
          dashboard.workload.stats.totalUpcomingWeight
        ),

        highestWeightUpcoming:
          dashboard.workload.stats.highestWeightUpcoming
            ? serializeAssessment(
                dashboard.workload.stats.highestWeightUpcoming
              )
            : null,

        busiestWeek: dashboard.workload.stats.busiestWeek
          ? {
              start:
                dashboard.workload.stats.busiestWeek.start.toISOString(),
              end:
                dashboard.workload.stats.busiestWeek.end.toISOString(),
              assessmentCount:
                dashboard.workload.stats.busiestWeek.assessmentCount,
            }
          : null,
      },
    },

    collisions: dashboard.collisions,
  };
}
