import { Course } from "src/types/backendTypes";
import { Course as SharedCourse } from "@internal_package/shared";
import { serializeAssessments } from "../assessments/assessmentSerializer";


export function serializeCourse(course: Course): SharedCourse {
  return {
    ...course,
    assessments: serializeAssessments(course.assessments ?? []),
    gradeSummary: {
      currentGrade: course.gradeSummary.currentGrade.toNumber() ?? null,
      maxPossibleGrade: course.gradeSummary.maxPossibleGrade.toNumber() ?? null,
    }
  };
}

export function serializeCourses(courses: Course[]): SharedCourse[] {
  return courses.map(serializeCourse);
}
