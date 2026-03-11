import { Prisma } from "@prisma/client";
import { decimalToNumberOrNull, serializeCourse } from "./courseSerializer";
import { serializeAssessment } from "../assessments/assessmentSerializer";
import { AssessmentWithUrgency } from "../../domain/assessments/rankAssessmentsByUrgency";
import { AssessmentBackend, CourseBackend } from "src/types/backendTypes";
import { Collision } from "@internal_package/shared";


function serializeAssessmentWithUrgency(a: AssessmentWithUrgency) {
  const base = serializeAssessment(a);

  return {
    ...base,
    urgency: decimalToNumberOrNull(a.urgency),
  };
}

export function serializeCourseDashboard(dashboard: {
  course: CourseBackend;
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
}) {
  return {
    course: serializeCourse(dashboard.course),

    workload: {
      upcomingAssessments:
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
