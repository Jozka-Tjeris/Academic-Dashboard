import { AssessmentShared, AssessmentStatus, Collision } from "@internal_package/shared";
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
  }
) =>
  fetcher(`/courses/${courseId}/assessments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => handleResponse<AssessmentShared>(res)
);

type GetAssessment = {
  assessment: AssessmentShared;
  course: {
      courseId: string;
      name: string;
  };
  derived: {
      status: AssessmentStatus;
      urgencyScore: number;
  };
}

export const getAssessment = (fetcher: Fetcher, id: string) =>
  fetcher(`/assessments/${id}`).then(res =>
    handleResponse<GetAssessment>(res)
  );

export const updateAssessment = (fetcher: Fetcher, assessmentId: string, data: {
  title?: string,
  dueDate?: Date,
  weight?: number,
  maxScore?: number,
  description?: string,
  score?: number | null,
  submissionDate?: Date,
  targetScore?: number
}) => 
  fetcher(`/assessments/${assessmentId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
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
