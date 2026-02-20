import { TWENTYFOUR_HOURS_IN_MS } from "@shared/constants/constants";
import { Assessment } from "@shared/types/types";
import { deriveStatusFromDate } from "./status";

export function calculateUrgencyScore(
  assessment: Assessment,
  now: Date = new Date()
): number {
  const status = deriveStatusFromDate(assessment.dueDate, assessment.score, now);

  if(status === "submitted"){
    return 0;
  }

  const diffMs = assessment.dueDate.getTime() - now.getTime();
  const daysUntilDue = diffMs / TWENTYFOUR_HOURS_IN_MS;

  if(status === "overdue"){
    // Increase urgency as it becomes more overdue
    const daysOverdue = Math.abs(daysUntilDue);
    return assessment.weight * (1 + daysOverdue);
  }

  // Upcoming, decrease factor if further away from due date
  const timeFactor = 1 / (daysUntilDue + 1);
  return assessment.weight * timeFactor;
}
