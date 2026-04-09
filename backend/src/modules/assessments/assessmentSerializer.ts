import { DEFAULT_MAX_SCORE } from "@internal_package/shared";
import { AssessmentBackend } from "../../types/backendTypes";
import { AssessmentShared } from "@internal_package/shared";
import { deriveStatusFromDate } from "../../domain/assessments/deriveStatusFromDate";

export function serializeAssessment(assessment: AssessmentBackend): AssessmentShared {
  return {
    ...assessment,
    score: assessment.score?.toNumber() ?? null,
    weight: assessment.weight.toNumber(),
    maxScore: assessment.maxScore?.toNumber() ?? DEFAULT_MAX_SCORE,
    status: deriveStatusFromDate(assessment.dueDate, assessment.score, !!assessment.submissionDate),
  };
}

export function serializeAssessments(assessments: AssessmentBackend[]): AssessmentShared[] {
  return assessments.map(serializeAssessment);
}
