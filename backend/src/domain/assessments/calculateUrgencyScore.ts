import { TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { AssessmentBackend } from "../../types/backendTypes";
import { deriveStatusFromDate } from "./deriveStatusFromDate";
import { AssessmentStatus, Prisma } from "@prisma/client";

export function calculateUrgencyScore(
  assessment: AssessmentBackend,
  now: Date = new Date()
): Prisma.Decimal {
  const status = deriveStatusFromDate(assessment.dueDate, assessment.score, assessment.submitted, now);

  const weight = assessment.weight;

  if (status === AssessmentStatus.SUBMITTED || status === AssessmentStatus.GRADED) return new Prisma.Decimal(0);

  const diffMs = assessment.dueDate.getTime() - now.getTime();
  const daysUntilDue = diffMs / TWENTYFOUR_HOURS_IN_MS;

  if (status === AssessmentStatus.OVERDUE) {
    const daysOverdue = Math.abs(daysUntilDue);
    return weight.mul(1 + daysOverdue);
  }

  // Upcoming, scale urgency
  const timeFactor = 1 / (daysUntilDue + 1);
  return weight.mul(timeFactor);
}
