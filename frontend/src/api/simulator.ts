import { Fetcher } from "@/types/fetcher";
import { handleResponse } from "./handleResponse";

export type SimulationInput = {
  assessmentId: string;
  simulatedScore: number;
  targetScore?: number;
};

export type SimulationResult = {
  currentGrade: number;
  simulatedGrade: number;
  maxPossibleGrade: number;
};

export const simulateCourse = (
  fetcher: Fetcher,
  courseId: string,
  data: SimulationInput[]
) => (
  fetcher(`/courses/${courseId}/simulate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ assessments: data }),
  }).then((res) => handleResponse<SimulationResult>(res))
);
