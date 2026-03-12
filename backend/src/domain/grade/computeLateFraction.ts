import { PENALTY_PERCENT_PER_DAY, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

/**
 * Helper function to compute late fraction for penalty application
 * Returns a Decimal representing the fraction of maxScore to deduct
 */
export function computeLateFraction(submissionDate: Date, dueDate: Date): Prisma.Decimal {
  const daysLate = Math.max(0, (submissionDate.getTime() - dueDate.getTime()) / TWENTYFOUR_HOURS_IN_MS);
  return new Prisma.Decimal(daysLate * PENALTY_PERCENT_PER_DAY);
}
