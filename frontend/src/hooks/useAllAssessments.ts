import { useCourses } from "./useCourses";
import { AssessmentShared } from "@internal_package/shared";

export const useAllAssessments = () => {
  const { data: courses, ...rest } = useCourses();

  const assessments: AssessmentShared[] =
    courses?.flatMap(c => c.assessments ?? []) ?? [];

  const sorted = assessments.sort((a, b) => {
    if(a.submissionDate && !b.submissionDate){
      return -1;
    }
    if(!a.submissionDate && b.submissionDate){
      return 1;
    }
    return a.weight - b.weight;
  })

  return {
    assessments: sorted,
    ...rest,
  };
};
