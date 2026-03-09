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
    .sort((a, b) => b.urgency.comparedTo(a.urgency));
}
