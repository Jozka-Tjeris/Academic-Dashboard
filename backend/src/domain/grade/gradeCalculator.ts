import { DEFAULT_MAX_SCORE, EPSILON, INVALID_GRADE, MAX_GRADE } from "@internal_package/shared";
import { GradeComponent } from "../../types/backendTypes";
import { Prisma } from "@prisma/client";

/**
 * Calculates the final grade for a course using a list of assessments.
 * 
 * @param assessments - the list of actual assessments
 * @returns final grade (0–MAX_GRADE), or INVALID_GRADE if weights invalid
 */
export function calculateCurrentGrade(assessments: GradeComponent[]): Prisma.Decimal {
  const totalWeight = assessments.reduce((acc, v) => acc.plus(v.weight), new Prisma.Decimal(0));
  if (!totalWeight.minus(1).abs().lte(EPSILON)) return new Prisma.Decimal(INVALID_GRADE);

  let finalGrade = new Prisma.Decimal(0);

  for (const assessment of assessments) {
    const achieved = assessment.score ?? new Prisma.Decimal(0);
    const maxScore = assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    finalGrade = finalGrade.plus(
      achieved.div(maxScore).mul(assessment.weight)
    );
  }

  // Clamp final grade between 0 and MAX_GRADE
  return Prisma.Decimal.min(Prisma.Decimal.max(finalGrade, 0), MAX_GRADE);
}

/**
 * Simulates the final grade for a course using maximum scores for non-scored assessments.
 * 
 * @param assessments - the list of actual assessments
 * @returns final maximum possible grade (0–MAX_GRADE), or INVALID_GRADE if weights invalid
 */
export function calculateMaxPossibleGrade(assessments: GradeComponent[]): Prisma.Decimal {
  const totalWeight = assessments.reduce((acc, v) => acc.plus(v.weight), new Prisma.Decimal(0));
  if (!totalWeight.minus(1).abs().lte(EPSILON)) return new Prisma.Decimal(INVALID_GRADE);

  let finalGrade = new Prisma.Decimal(0);

  for (const assessment of assessments) {
    const achieved = assessment.score ?? assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);
    const maxScore = assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    finalGrade = finalGrade.plus(
      achieved.div(maxScore).mul(assessment.weight)
    );
  }

  // Clamp final grade between 0 and MAX_GRADE
  return Prisma.Decimal.min(Prisma.Decimal.max(finalGrade, 0), MAX_GRADE);
}
