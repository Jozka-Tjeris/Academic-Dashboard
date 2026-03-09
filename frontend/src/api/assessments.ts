import { AssessmentShared } from "@internal_package/shared";
import { apiFetch } from "../lib/queryClient";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  return apiFetch(url, options);
}

export const createAssessment = (
  courseId: string,
  data: {
    title: string;
    dueDate: Date;
    weight: number;
    maxScore: number;
    description?: string;
    latePenalty?: number;
  }
) =>
  fetcher<AssessmentShared>(`/courses/${courseId}/assessments`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateAssessment = (assessmentId: string, data: {
  score?: number,
  submitted?: boolean,
  targetScore?: number
}) => 
  fetcher<AssessmentShared>(`/assessments/${assessmentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteAssessment = (assessmentId: string) =>
  fetcher<void>(`/assessments/${assessmentId}`, {
    method: "DELETE",
  });
