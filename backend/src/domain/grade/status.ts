import { TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { AssessmentStatus } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

export function deriveStatusFromDate(
  dueDate: Date,
  score: Prisma.Decimal | null,
  hasSubmitted: boolean,
  now: Date = new Date()
): AssessmentStatus {
  if (hasSubmitted) {
    return score !== null ? "graded" : "submitted";
  }

  if (dueDate.getTime() < now.getTime()) return "overdue";
  if (dueDate.getTime() - now.getTime() <= TWENTYFOUR_HOURS_IN_MS) return "due in 24 hours";

  return "upcoming";
}