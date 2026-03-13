import { useCourses } from "./useCourses";
import { AssessmentShared, AssessmentStatusMetadata } from "@internal_package/shared";

export const useAllAssessments = () => {
  const { data: courses, ...rest } = useCourses();

  const assessments: AssessmentShared[] =
    courses?.flatMap(c => c.assessments ?? []) ?? [];

  const sorted = assessments.sort((a, b) => {
    const priorityA = AssessmentStatusMetadata[a.status].order;
    const priorityB = AssessmentStatusMetadata[b.status].order;
    if(priorityA !== priorityB){
      return priorityB - priorityA;
    }

    const dueDateA = new Date(a.dueDate).getTime();
    const dueDateB = new Date(b.dueDate).getTime();
    if(dueDateA !== dueDateB){
      return dueDateB - dueDateA;
    }

    if(a.weight !== b.weight){
      return b.weight - a.weight;
    }

    return b.assessmentId.localeCompare(a.assessmentId);
  })

  return {
    assessments: sorted,
    ...rest,
  };
};
