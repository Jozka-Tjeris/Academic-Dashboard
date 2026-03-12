import { DEFAULT_MAX_SCORE, EPSILON, INVALID_GRADE, MAX_ASSESSMENT_WEIGHT, MAX_GRADE } from "@internal_package/shared";
import { GradeComponent } from "../../types/backendTypes";
import { Prisma } from "@prisma/client";
import { applyLatePenalty } from "./latePenalty";
import { computeLateFraction } from "./computeLateFraction";

/**
 * Calculates the final grade for a course using actual submitted scores.
 * Applies late penalties to each assessment.
 */
export function calculateCurrentGrade(assessments: GradeComponent[]): Prisma.Decimal {
  const totalWeight = assessments.reduce((acc, v) => acc.plus(v.weight), new Prisma.Decimal(0));
  if (!totalWeight.minus(MAX_ASSESSMENT_WEIGHT).abs().lte(EPSILON)) return new Prisma.Decimal(INVALID_GRADE);

  let finalGrade = new Prisma.Decimal(0);

  for (const assessment of assessments) {
    const rawScore = assessment.score ?? new Prisma.Decimal(0);
    const maxScore = assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    // Only apply penalty if submission exists
    const penaltyFraction = assessment.submissionDate && assessment.dueDate 
      ? computeLateFraction(assessment.submissionDate, assessment.dueDate) 
      : new Prisma.Decimal(0);
    const scoreWithPenalty = applyLatePenalty(rawScore, maxScore, penaltyFraction);

    finalGrade = finalGrade.plus(scoreWithPenalty.div(maxScore).mul(assessment.weight));
  }

  // Clamp final grade between 0 and MAX_GRADE
  return Prisma.Decimal.min(Prisma.Decimal.max(finalGrade, 0), MAX_GRADE);
}

/**
 * Calculates the maximum possible grade given current submissions.
 * Penalties only apply to actual submitted assessments; unsubmitted assessments assume maxScore.
 */
export function calculateMaxPossibleGrade(assessments: GradeComponent[]): Prisma.Decimal {
  const totalWeight = assessments.reduce((acc, v) => acc.plus(v.weight), new Prisma.Decimal(0));
  if (!totalWeight.minus(MAX_ASSESSMENT_WEIGHT).abs().lte(EPSILON)) return new Prisma.Decimal(INVALID_GRADE);

  let finalGrade = new Prisma.Decimal(0);

  for (const assessment of assessments) {
    const rawScore = assessment.score ?? assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);
    const maxScore = assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    let scoreToUse: Prisma.Decimal;
    if (assessment.score != null && assessment.submissionDate && assessment.dueDate) {
      const penaltyFraction = computeLateFraction(assessment.submissionDate, assessment.dueDate);
      scoreToUse = applyLatePenalty(rawScore, maxScore, penaltyFraction);
    } else {
      scoreToUse = rawScore; // unsubmitted assignments: assume full score
    }

    finalGrade = finalGrade.plus(scoreToUse.div(maxScore).mul(assessment.weight));
  }

  // Clamp final grade between 0 and MAX_GRADE
  return Prisma.Decimal.min(Prisma.Decimal.max(finalGrade, 0), MAX_GRADE);
}
