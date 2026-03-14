import { Collision, DUEDATE_COLLISION_WINDOW_DAYS, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { AssessmentWithCourseName } from "../../types/backendTypes";

export function detectDueDateCollisions(
  assessments: AssessmentWithCourseName[],
  windowDays = DUEDATE_COLLISION_WINDOW_DAYS
): Collision[] {

  const sorted = [...assessments]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const collisions: Collision[] = [];
  const windowMs = windowDays * TWENTYFOUR_HOURS_IN_MS;

  let left = 0;

  for (let right = 0; right < sorted.length; right++) {
    const isLast = right === sorted.length - 1;

    let shouldMoveWindow =
      sorted[right].dueDate.getTime() - sorted[left].dueDate.getTime() > windowMs;

    if (shouldMoveWindow || isLast) {
      const end = shouldMoveWindow ? right : right + 1;
      const windowSize = end - left;

      if (windowSize >= 2) {
        const cluster = sorted.slice(left, end);

        collisions.push({
          startDate: cluster[0].dueDate.toISOString(),
          endDate: cluster[cluster.length - 1].dueDate.toISOString(),
          assessmentIdAndLabels: cluster.map(a => {
            return {
              assessmentId: a.assessmentId,
              title: a.title,
              courseName: a.course.name
            }
          }),
          count: cluster.length,
        });
      }
    }

    while (shouldMoveWindow) {
      left++;
      shouldMoveWindow =
        sorted[right].dueDate.getTime() - sorted[left].dueDate.getTime() > windowMs;
    }
  }

  return collisions;
}
