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
      return priorityA - priorityB;
    }

    const dueDateA = a.dueDate.getTime();
    const dueDateB = b.dueDate.getTime();
    if(dueDateA !== dueDateB){
      return dueDateA - dueDateB;
    }

    if(a.weight !== b.weight){
      return a.weight - b.weight;
    }

    return a.assessmentId.localeCompare(b.assessmentId);
  })

  return {
    assessments: sorted,
    ...rest,
  };
};
