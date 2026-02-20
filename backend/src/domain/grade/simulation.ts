import { DEFAULT_MAX_SCORE, INVALID_GRADE, EPSILON, MAX_GRADE } from "../../../../shared/constants/constants";
import { Assessment } from "../../../../shared/types/types";

/**
 * Simulates the final grade for a course using optional simulated scores for some assessments.
 * 
 * @param assessments - the list of actual assessments
 * @param simulationInputs - array of { assessmentId, simulatedScore } to override existing scores
 * @returns final simulated grade (0–MAX_GRADE), or INVALID_GRADE if weights invalid
 */
export function simulateFinalGrade(
  assessments: Assessment[],
  simulationInputs: { assessmentId: string; simulatedScore: number }[]
): number {
  // Check total weight
  const totalWeight = assessments.reduce((sum, v) => sum + v.weight, 0);
  if (Math.abs(totalWeight - 1) > EPSILON) return INVALID_GRADE;

  // Map simulated scores for quick lookup
  const simMap: Record<string, number> = {};
  simulationInputs.forEach((sim) => {
    simMap[sim.assessmentId] = sim.simulatedScore;
  });

  // Compute final grade
  const finalGrade = assessments.reduce((sum, assessment) => {
    // Use simulated score if provided, otherwise actual score, otherwise max
    const scoreToUse =
      simMap[assessment.assessmentId] ?? assessment.score ?? DEFAULT_MAX_SCORE;
    const maxScore = assessment.maxScore ?? DEFAULT_MAX_SCORE;

    return sum + (scoreToUse / maxScore) * assessment.weight;
  }, 0);

  return Math.min(Math.max(finalGrade, 0), MAX_GRADE);
}
