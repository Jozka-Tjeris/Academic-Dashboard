import { DEFAULT_MAX_SCORE } from "@internal_package/shared";
import { Assessment } from "src/types/backendTypes";
import { Assessment as SharedAssessment } from "@internal_package/shared";

export function serializeAssessment(assessment: Assessment): SharedAssessment {
  return {
    ...assessment,
    score: assessment.score?.toNumber() ?? null,
    targetScore: assessment.targetScore?.toNumber() ?? null,
    weight: assessment.weight.toNumber(),
    latePenalty: assessment.latePenalty?.toNumber() ?? null,
    maxScore: assessment.maxScore?.toNumber() ?? DEFAULT_MAX_SCORE,
  };
}

export function serializeAssessments(assessments: Assessment[]): SharedAssessment[] {
  return assessments.map(serializeAssessment);
}
