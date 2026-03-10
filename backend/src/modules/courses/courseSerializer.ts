import { CourseBackend } from "../../types/backendTypes";
import { CourseShared } from "@internal_package/shared";
import { serializeAssessments } from "../assessments/assessmentSerializer";
import { Prisma } from "@prisma/client";

/**
 * Safely converts Prisma.Decimal to number | null.
 * Returns null if the value is NaN, Infinity, or undefined.
 */
export function decimalToNumberOrNull(d?: Prisma.Decimal | null): number | null {
  if (!d) return null;

  const n = d.toNumber();
  return Number.isFinite(n) ? n : null;
}

/**
 * Serializes a single course, normalizes grade values,
 * and adds optional messages depending on the grade state.
 */
export function serializeCourse(course: CourseBackend): CourseShared {
  const currentGrade = decimalToNumberOrNull(course.gradeSummary.currentGrade);
  const maxPossibleGrade = decimalToNumberOrNull(course.gradeSummary.maxPossibleGrade);

  // Optional message depending on grade calculation validity
  let gradeMessage: string | null = null;
  if (currentGrade === null) {
    gradeMessage = "Grade calculation invalid or not available";
  } else if (maxPossibleGrade !== null && maxPossibleGrade === 0) {
    gradeMessage = "Max possible grade is zero, check grading setup";
  }

  if (!course.assessments || course.assessments.length <= 0) {
    gradeMessage = "No assessments yet";
  }

  return {
    ...course,
    assessments: serializeAssessments(course.assessments ?? []),
    gradeSummary: {
      currentGrade,
      maxPossibleGrade,
      gradeMessage,
    }
  };
}

/**
 * Serializes multiple courses
 */
export function serializeCourses(courses: CourseBackend[]): CourseShared[] {
  return courses.map(serializeCourse);
}
