import { Prisma } from "@prisma/client";
import { AssessmentBackend } from "../../types/backendTypes";
import { calculateUrgencyScore } from "./calculateUrgencyScore";

export type AssessmentWithUrgency = AssessmentBackend & {
  urgency: Prisma.Decimal;
};

export function rankAssessmentsByUrgency(
  assessments: AssessmentBackend[],
  now: Date = new Date()
): AssessmentWithUrgency[] {
  return assessments
    .map(a => ({
      ...a,
      urgency: calculateUrgencyScore(a, now)
    }))
    .sort((a, b) => {
      const urgencyCompare = b.urgency.comparedTo(a.urgency);
      if (urgencyCompare !== 0) return urgencyCompare;

      const dueDateCompare = a.dueDate.getTime() - b.dueDate.getTime();
      if (dueDateCompare !== 0) return dueDateCompare;

      return a.assessmentId.localeCompare(b.assessmentId);
    });
}
