import { DEFAULT_MAX_SCORE, INVALID_GRADE, EPSILON, MAX_GRADE } from "@internal_package/shared";
import { Assessment } from "@internal_package/shared";
import { Prisma } from "@prisma/client";

/**
 * Simulates the final grade for a course using optional simulated scores for some assessments.
 * 
 * @param assessments - the list of actual assessments
 * @param simulationInputs - array of { assessmentId, simulatedScore } to override existing scores
 * @returns final simulated grade (0–MAX_GRADE), or INVALID_GRADE if weights invalid
 */
export function simulateFinalGrade(
  assessments: Assessment[],
  simulationInputs: { assessmentId: string; simulatedScore: Prisma.Decimal }[]
): Prisma.Decimal {
  const totalWeight = assessments.reduce((acc, v) => acc.plus(v.weight), new Prisma.Decimal(0));
  if (!totalWeight.minus(1).abs().lte(EPSILON)) return new Prisma.Decimal(INVALID_GRADE);

  const simMap: Record<string, Prisma.Decimal> = {};
  simulationInputs.forEach((sim) => { 
    simMap[sim.assessmentId] = sim.simulatedScore; 
  });

  let finalGrade = new Prisma.Decimal(0);

  for (const assessment of assessments) {
    const scoreToUse = simMap[assessment.assessmentId] ?? assessment.score ?? assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);
    const maxScore = assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    finalGrade = finalGrade.plus(scoreToUse.div(maxScore).mul(assessment.weight));
  }

  return Prisma.Decimal.min(Prisma.Decimal.max(finalGrade, 0), MAX_GRADE);
}
