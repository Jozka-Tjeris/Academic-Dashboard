import { AssessmentStatus, AssessmentStatuses, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

export function deriveStatusFromDate(
  dueDate: Date,
  score: Prisma.Decimal | null,
  hasSubmitted: boolean,
  now: Date = new Date()
): AssessmentStatus {
  if (hasSubmitted) {
    return score !== null ? AssessmentStatuses.GRADED : AssessmentStatuses.SUBMITTED;
  }

  if (dueDate.getTime() < now.getTime()) return AssessmentStatuses.OVERDUE;
  if (dueDate.getTime() - now.getTime() <= TWENTYFOUR_HOURS_IN_MS) return AssessmentStatuses.DUE_IN_24_HOURS;

  return AssessmentStatuses.UPCOMING;
}