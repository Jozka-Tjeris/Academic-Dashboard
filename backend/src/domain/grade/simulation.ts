import { DEFAULT_MAX_SCORE, INVALID_GRADE, EPSILON, MAX_ASSESSMENT_WEIGHT } from "@internal_package/shared";
import { GradeComponent } from "../../types/backendTypes";
import { Prisma } from "@prisma/client";
import { applyLatePenalty } from "./latePenalty";
import { computeLateFraction } from "./computeLateFraction";

/**
 * Calculates a simulated grade.
 * Simulated scores override actual scores; penalties only apply to non-simulated assessments.
 */
export function simulateFinalGrade(
  assessments: GradeComponent[],
  simulationInputs: { assessmentId: string; simulatedScore: Prisma.Decimal }[]
): Prisma.Decimal {
  const totalWeight = assessments.reduce((acc, v) => acc.plus(v.weight), new Prisma.Decimal(0));
  if (!totalWeight.minus(MAX_ASSESSMENT_WEIGHT).abs().lte(EPSILON)) return new Prisma.Decimal(INVALID_GRADE);

  const simMap: Map<string, Prisma.Decimal> = new Map(
    simulationInputs.map(sim => [sim.assessmentId, sim.simulatedScore])
  );

  let finalGrade = new Prisma.Decimal(0);

  for (const assessment of assessments) {
    // Ignore any assessment with 0 max score or weight
    if(assessment.maxScore?.eq(0) || assessment.weight.eq(0)){
      continue;
    }
    const maxScore = assessment.maxScore ?? new Prisma.Decimal(DEFAULT_MAX_SCORE);

    let scoreToUse: Prisma.Decimal;

    if (simMap.has(assessment.assessmentId)) {
      // Simulated score overrides everything
      scoreToUse = simMap.get(assessment.assessmentId)!;
    } else if (assessment.score != null) {
      // Apply penalty to actual submissions only
      const penaltyFraction = assessment.submissionDate && assessment.dueDate 
        ? computeLateFraction(assessment.submissionDate, assessment.dueDate) 
        : new Prisma.Decimal(0);
      scoreToUse = applyLatePenalty(assessment.score, maxScore, penaltyFraction);
    } else {
      scoreToUse = new Prisma.Decimal(0); // no score yet
    }

    finalGrade = finalGrade.plus(scoreToUse.div(maxScore).mul(assessment.weight));
  }

  return Prisma.Decimal.min(Prisma.Decimal.max(finalGrade, 0), 1);
}
