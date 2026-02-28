import { DEFAULT_MAX_SCORE, EPSILON, INVALID_GRADE, MAX_GRADE } from "@internal_package/shared";
import { Assessment } from "@internal_package/shared";

/**
 * Calculates the final grade for a course using a list of assessments.
 * 
 * @param assessments - the list of actual assessments
 * @returns final grade (0–MAX_GRADE), or INVALID_GRADE if weights invalid
 */
export function calculateCurrentGrade(assessments: Assessment[]){
  const totalWeight = assessments.reduce((acc, v) => acc + v.weight, 0);
  if(Math.abs(totalWeight - 1) > EPSILON) return INVALID_GRADE;

  const finalGrade = assessments.reduce((sum, assessment) => {
    const achieved = assessment.score ?? 0;
    const maxScore = assessment.maxScore ?? DEFAULT_MAX_SCORE;
    return sum + achieved / maxScore * assessment.weight;
  }, 0);

  return Math.min(Math.max(finalGrade, 0), MAX_GRADE);
}

/**
 * Simulates the final grade for a course using maximum scores for non-scored assessments.
 * 
 * @param assessments - the list of actual assessments
 * @returns final maximum possible grade (0–MAX_GRADE), or INVALID_GRADE if weights invalid
 */
export function calculateMaxPossibleGrade(assessments: Assessment[]){
  const totalWeight = assessments.reduce((acc, v) => acc + v.weight, 0);
  if(Math.abs(totalWeight - 1) > EPSILON) return INVALID_GRADE;

  const finalGrade = assessments.reduce((sum, assessment) => {
    const achieved = assessment.score ?? assessment.score ?? (assessment.maxScore ?? DEFAULT_MAX_SCORE);
    const maxScore = assessment.maxScore ?? DEFAULT_MAX_SCORE;
    return sum + achieved / maxScore * assessment.weight;
  }, 0);

  return Math.min(Math.max(finalGrade, 0), MAX_GRADE);
}
