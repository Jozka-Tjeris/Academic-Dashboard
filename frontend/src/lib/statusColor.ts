import { AssessmentStatus, AssessmentStatuses } from "@internal_package/shared";

export function getStatusColor(status: AssessmentStatus) {
  switch (status) {
    case AssessmentStatuses.GRADED:
      return "text-green-600";

    case AssessmentStatuses.SUBMITTED:
      return "text-blue-600";

    case AssessmentStatuses.DUE_IN_24_HOURS:
      return "text-orange-600";

    case AssessmentStatuses.OVERDUE:
      return "text-red-600";

    default:
      return "text-muted-foreground";
  }
}
