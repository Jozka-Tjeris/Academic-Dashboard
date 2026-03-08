import { TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { AssessmentStatus, Prisma } from "@prisma/client";

export function deriveStatusFromDate(
  dueDate: Date,
  score: Prisma.Decimal | null,
  hasSubmitted: boolean,
  now: Date = new Date()
): AssessmentStatus {
  if (hasSubmitted) {
    return score !== null ? AssessmentStatus.GRADED : AssessmentStatus.SUBMITTED;
  }

  if (dueDate.getTime() < now.getTime()) return AssessmentStatus.OVERDUE;
  if (dueDate.getTime() - now.getTime() <= TWENTYFOUR_HOURS_IN_MS) return AssessmentStatus.DUE_IN_24_HOURS;

  return AssessmentStatus.UPCOMING;
}