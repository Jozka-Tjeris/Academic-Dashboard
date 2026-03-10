import { Prisma } from "@prisma/client";
import { serializeAssessment } from "../assessments/assessmentSerializer";
import { AssessmentWithUrgency } from "../../domain/assessments/rankAssessmentsByUrgency";
import { decimalToNumberOrNull } from "./courseSerializer";

export function serializeAssessmentWithUrgency(
  assessment: AssessmentWithUrgency
) {
  const serialized = serializeAssessment(assessment);

  return {
    ...serialized,
    urgency: decimalToNumberOrNull(assessment.urgency),
  };
}

export function serializeCourseAnalytics(analytics: {
  currentGrade: Prisma.Decimal;
  maxPossibleGrade: Prisma.Decimal;
  assessmentCounts: {
    total: number;
    submitted: number;
    graded: number;
    in24hrs: number;
    pending: number;
    overdue: number;
  };
  urgency: {
    totalUrgency: Prisma.Decimal;
    averageUrgency: Prisma.Decimal;
    topAssessments: AssessmentWithUrgency[];
  };
}) {
  return {
    currentGrade: decimalToNumberOrNull(analytics.currentGrade),
    maxPossibleGrade: decimalToNumberOrNull(analytics.maxPossibleGrade),

    assessmentCounts: analytics.assessmentCounts,

    urgency: {
      totalUrgency: decimalToNumberOrNull(analytics.urgency.totalUrgency),
      averageUrgency: decimalToNumberOrNull(analytics.urgency.averageUrgency),

      topAssessments: analytics.urgency.topAssessments.map(
        serializeAssessmentWithUrgency
      ),
    },
  };
}
