import { AssessmentShared, Collision } from "@internal_package/shared";
import { Fetcher } from "@/types/fetcher";
import { handleResponse } from "./handleResponse";

export const createAssessment = (
  fetcher: Fetcher,
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
  fetcher(`/courses/${courseId}/assessments`, {
    method: "POST",
    body: JSON.stringify(data),
  }).then(res => handleResponse<AssessmentShared>(res)
);

export const updateAssessment = (fetcher: Fetcher, assessmentId: string, data: {
  score?: number,
  submitted?: boolean,
  targetScore?: number
}) => 
  fetcher(`/assessments/${assessmentId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  }).then(res => handleResponse<AssessmentShared>(res)
);

export const deleteAssessment = (fetcher: Fetcher, assessmentId: string) =>
  fetcher(`/assessments/${assessmentId}`, {
    method: "DELETE",
  }).then(res => handleResponse<void>(res)
);

export const getCollisions = (fetcher: Fetcher) =>
fetcher("/assessments/collisions").then(res =>
  handleResponse<{ clusters: Collision[] }>(res)
);
