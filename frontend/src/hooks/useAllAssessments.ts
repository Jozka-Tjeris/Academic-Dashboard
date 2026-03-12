import { useCourses } from "./useCourses";
import { AssessmentShared } from "@internal_package/shared";

export const useAllAssessments = () => {
  const { data: courses, ...rest } = useCourses();

  const assessments: AssessmentShared[] =
    courses?.flatMap(c => c.assessments ?? []) ?? [];

  return {
    assessments,
    ...rest,
  };
};
