import { AssessmentStatus } from "@internal_package/shared";

export function getStatusColor(status: AssessmentStatus) {
  switch (status) {
    case AssessmentStatus.GRADED:
      return "text-green-600";

    case AssessmentStatus.SUBMITTED:
      return "text-blue-600";

    case AssessmentStatus.DUE_IN_24_HOURS:
      return "text-orange-600";

    case AssessmentStatus.OVERDUE:
      return "text-red-600";

    default:
      return "text-muted-foreground";
  }
}
