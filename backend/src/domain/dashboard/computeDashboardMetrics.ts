import { Prisma } from "@prisma/client";
import { AssessmentBackend } from "../../types/backendTypes";
import { rankAssessmentsByUrgency } from "../assessments/rankAssessmentsByUrgency";
import { detectDueDateCollisions } from "../assessments/detectDueDateCollisions";
import { deriveStatusFromDate } from "../assessments/deriveStatusFromDate";
import { AssessmentStatuses, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";

export function buildDashboardMetrics(
  assessments: AssessmentBackend[],
  now: Date = new Date()
){

  //Only process non-graded assessments

  const upcoming = assessments.filter(a => {
    const status = deriveStatusFromDate(a.dueDate, a.score, !!a.submissionDate, now);
    return status !== AssessmentStatuses.GRADED;
  });

  //Rank assessments by urgency

  const urgencyRanked = rankAssessmentsByUrgency(upcoming, now);

  // Count the number of assessments due in the next 7 and 14 days

  const sevenDays = new Date(now.getTime() + 7 * TWENTYFOUR_HOURS_IN_MS);
  const fourteenDays = new Date(now.getTime() + 14 * TWENTYFOUR_HOURS_IN_MS);

  let dueNext7Days = 0;
  let dueNext14Days = 0;
  let totalUpcomingWeight = new Prisma.Decimal(0);

  // Find highest priority assessment
  let highestWeightUpcoming: typeof upcoming[number] | null = null;

  for (const a of upcoming) {

    if (a.dueDate <= sevenDays) dueNext7Days++;
    if (a.dueDate <= fourteenDays) dueNext14Days++;

    totalUpcomingWeight = totalUpcomingWeight.add(a.weight);

    if (
      !highestWeightUpcoming ||
      a.weight.gt(highestWeightUpcoming.weight)
    ) {
      highestWeightUpcoming = a;
    }
  }

  // Find busiest week based on assessment due dates
  const sorted = [...upcoming].sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
  );

  let busiestWeek = null;
  const WINDOW = 7 * TWENTYFOUR_HOURS_IN_MS;

  let maxCount = 0;
  let left = 0;

  for (let right = 0; right < sorted.length; right++) {

    while (sorted[right].dueDate.getTime() - sorted[left].dueDate.getTime() > WINDOW) {
      left++;
    }

    const windowSize = right - left + 1;

    if (windowSize > maxCount) {
      maxCount = windowSize;

      busiestWeek = {
        start: sorted[left].dueDate,
        end: new Date(sorted[left].dueDate.getTime() + WINDOW),
        assessmentCount: windowSize
      };
    }
  }

  // Find collisions between assessments
  const collisions = detectDueDateCollisions(upcoming);

  return {
    upcomingAssessments: urgencyRanked,

    stats: {
      dueNext7Days,
      dueNext14Days,
      totalUpcomingWeight,
      highestWeightUpcoming,
      busiestWeek
    },

    collisions
  };
}
