import { DEFAULT_MAX_SCORE, INVALID_GRADE, GoalOutput } from "@internal_package/shared";
import { GoalInputBackend } from "../../types/backendTypes";
import { Prisma } from "@prisma/client";
import { applyLatePenalty } from "./latePenalty";
import { computeLateFraction } from "./computeLateFraction";
import { calculateCurrentGrade } from "./gradeCalculator";

export function calculateRequiredScores({ targetGrade, assessments }: GoalInputBackend): GoalOutput {
  const currentGrade = calculateCurrentGrade(assessments);

  if(currentGrade.eq(INVALID_GRADE)) {
    return {
      possible: false,
      message: "Calculation failed due to invalid grade weights"
    }
  }

  if (currentGrade.gte(targetGrade)) {
    return {
      possible: true,
      averageRequiredPercent: 0,
      nextAssessmentRequiredScore: 0,
      requiredScores: assessments
        .filter(a => a.score === null)
        .map(a => ({ assessmentId: a.assessmentId, requiredScore: 0 })),
    };
  }

  const remaining = assessments.filter(a => a.score === null);

  if (remaining.length === 0) {
    return {
      possible: false,
      message: "No remaining assessments to reach the target grade",
    };
  }

  const remainingWeight = remaining.reduce(
    (sum, a) => sum.plus(a.weight),
    new Prisma.Decimal(0)
  );

  const requiredContribution = targetGrade.minus(currentGrade);

  /**
   * Compute max achievable contribution with penalties
   */
  let maxContribution = new Prisma.Decimal(0);

  for (const a of remaining) {
    const maxScore = a.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    let achievableScore = maxScore;

    if (a.submissionDate && a.dueDate) {
      const penaltyFraction = computeLateFraction(a.submissionDate, a.dueDate);
      achievableScore = applyLatePenalty(maxScore, maxScore, penaltyFraction);
    }

    maxContribution = maxContribution.plus(
      achievableScore.div(maxScore).mul(a.weight)
    );
  }

  if (maxContribution.lt(requiredContribution)) {
    return {
      possible: false,
      message: "Target grade cannot be achieved due to late penalties or remaining weights",
    };
  }

  /**
   * Average required percent across remaining weight
   */
  const averageRequiredPercent = requiredContribution
    .div(remainingWeight)
    .toNumber();

  /**
   * Required scores per assessment
   */
  const requiredScores = remaining.map(a => {
    const weight = a.weight;
    const maxScore = a.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    const contribution = requiredContribution.mul(weight).div(remainingWeight);

    let requiredRawScore = contribution.mul(maxScore).div(weight);

    if (a.submissionDate && a.dueDate) {
      const penaltyFraction = computeLateFraction(a.submissionDate, a.dueDate);
      requiredRawScore = requiredRawScore.div(
        new Prisma.Decimal(1).minus(penaltyFraction)
      );
    }

    requiredRawScore = Prisma.Decimal.min(requiredRawScore, maxScore);

    return {
      assessmentId: a.assessmentId,
      requiredScore: requiredRawScore.toNumber(),
    };
  });

  /**
   * Minimum score needed on next assessment
   */
  const nextAssessment = remaining[0];

  let nextAssessmentRequiredScore = 0;

  if (nextAssessment) {
    const maxScore =
      nextAssessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    let rawRequired = requiredContribution
      .mul(maxScore)
      .div(nextAssessment.weight);

    if (nextAssessment.submissionDate && nextAssessment.dueDate) {
      const penaltyFraction = computeLateFraction(
        nextAssessment.submissionDate,
        nextAssessment.dueDate
      );

      rawRequired = rawRequired.div(
        new Prisma.Decimal(1).minus(penaltyFraction)
      );
    }

    nextAssessmentRequiredScore = Prisma.Decimal.min(rawRequired, maxScore).toNumber();
  }

  return {
    possible: true,
    averageRequiredPercent,
    nextAssessmentRequiredScore,
    requiredScores,
  };
}
