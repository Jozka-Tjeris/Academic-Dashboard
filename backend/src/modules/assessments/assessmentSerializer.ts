import { AssessmentStatus, DEFAULT_MAX_SCORE } from "@internal_package/shared";
import { AssessmentBackend } from "src/types/backendTypes";
import { AssessmentShared } from "@internal_package/shared";
import { deriveStatusFromDate } from "src/domain/assessments/deriveStatusFromDate";

export function serializeAssessment(assessment: AssessmentBackend): AssessmentShared {
  return {
    ...assessment,
    score: assessment.score?.toNumber() ?? null,
    targetScore: assessment.targetScore?.toNumber() ?? null,
    weight: assessment.weight.toNumber(),
    latePenalty: assessment.latePenalty?.toNumber() ?? null,
    maxScore: assessment.maxScore?.toNumber() ?? DEFAULT_MAX_SCORE,
    status: deriveStatusFromDate(assessment.dueDate, assessment.score, assessment.submitted),
  };
}

export function serializeAssessments(assessments: AssessmentBackend[]): AssessmentShared[] {
  return assessments.map(serializeAssessment);
}
