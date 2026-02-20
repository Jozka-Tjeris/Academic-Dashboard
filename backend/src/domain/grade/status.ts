import { TWENTYFOUR_HOURS_IN_MS } from "../../../../shared/constants/constants";
import { AssessmentStatus } from "../../../../shared/types/types";

export function deriveStatusFromDate(
  dueDate: Date,
  score: number | null,
  now: Date = new Date()
): AssessmentStatus {
  if(score !== null){
    return "submitted";
  }

  if(dueDate.getTime() < now.getTime()){
    return "overdue";
  }

  if(dueDate.getTime() - now.getTime() <= TWENTYFOUR_HOURS_IN_MS){
    return "due in 24 hours";
  }

  return "upcoming";
}
