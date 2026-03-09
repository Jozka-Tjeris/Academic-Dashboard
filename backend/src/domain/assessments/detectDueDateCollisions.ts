import { DUEDATE_COLLISION_WINDOW_DAYS, TWENTYFOUR_HOURS_IN_MS } from "@internal_package/shared";
import { AssessmentBackend } from "../../types/backendTypes";

type Collision = {
  startDate: string
  endDate: string
  assessmentIds: string[]
  count: number
}

export function detectDueDateCollisions(
  assessments: AssessmentBackend[], 
  windowDays = DUEDATE_COLLISION_WINDOW_DAYS): Collision[]{

  const sorted = [...assessments]
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const collisions: Collision[] = [];
  let left = 0;
  let right = 0;

  for(; right < assessments.length; right++){
    let shouldMoveWindow = sorted[right].dueDate.getTime() - 
      sorted[left].dueDate.getTime() > windowDays * TWENTYFOUR_HOURS_IN_MS;

    if(shouldMoveWindow){
      const windowSize = right - left;
      if(windowSize >= 2){
        const cluster = sorted.slice(left, right);

        collisions.push({
          startDate: cluster[0].dueDate.toISOString(),
          endDate: cluster[cluster.length - 1].dueDate.toISOString(),
          assessmentIds: cluster.map(a => a.assessmentId),
          count: cluster.length,
        });
      }
    }
    while(shouldMoveWindow){
      shouldMoveWindow = sorted[right].dueDate.getTime() - 
        sorted[left].dueDate.getTime() > windowDays * TWENTYFOUR_HOURS_IN_MS;
      left++;
    }
  }

  const windowSize = right - left;
  if(windowSize >= 2){
    const cluster = sorted.slice(left, right);

    collisions.push({
      startDate: cluster[0].dueDate.toISOString(),
      endDate: cluster[cluster.length - 1].dueDate.toISOString(),
      assessmentIds: cluster.map(a => a.assessmentId),
      count: cluster.length,
    });
  }

  return collisions;
}
