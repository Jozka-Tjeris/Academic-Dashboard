import { EPSILON, INVALID_GRADE, MAX_ASSESSMENT_WEIGHT } from "@internal_package/shared";
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
    // Ignore any assessment with 0 max score or weight
    if(!assessment.maxScore || assessment.maxScore.lte(0) || assessment.weight.lte(0)){
      continue;
    }
    const rawScore = assessment.score ?? new Prisma.Decimal(0);
    const maxScore = assessment.maxScore;

    // Only apply penalty if submission exists
    const penaltyFraction = assessment.submissionDate && assessment.dueDate 
      ? computeLateFraction(assessment.submissionDate, assessment.dueDate) 
      : new Prisma.Decimal(0);
    const scoreWithPenalty = applyLatePenalty(rawScore, maxScore, penaltyFraction);

    const normalized = Prisma.Decimal.min(Prisma.Decimal.max(scoreWithPenalty.div(maxScore), 0), 1);

    finalGrade = finalGrade.plus(normalized.mul(assessment.weight));
  }

  // Clamp final grade between 0 and MAX_GRADE
  return Prisma.Decimal.min(Prisma.Decimal.max(finalGrade, 0), 1);
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
    // Ignore any assessment with 0 max score or weight
     if(!assessment.maxScore || assessment.maxScore.lte(0) || assessment.weight.lte(0)){
      continue;
    }
    const rawScore = assessment.score ?? assessment.maxScore;
    const maxScore = assessment.maxScore;

    let scoreToUse: Prisma.Decimal;
    if (assessment.score != null && assessment.submissionDate && assessment.dueDate) {
      const penaltyFraction = computeLateFraction(assessment.submissionDate, assessment.dueDate);
      scoreToUse = applyLatePenalty(rawScore, maxScore, penaltyFraction);

      scoreToUse = Prisma.Decimal.min(Prisma.Decimal.max(scoreToUse.div(maxScore), 0), 1);
    } else {
      scoreToUse = rawScore.div(maxScore); // unsubmitted assignments: assume full score
    }

    finalGrade = finalGrade.plus(scoreToUse.mul(assessment.weight));
  }

  // Clamp final grade between 0 and MAX_GRADE
  return Prisma.Decimal.min(Prisma.Decimal.max(finalGrade, 0), 1);
}
