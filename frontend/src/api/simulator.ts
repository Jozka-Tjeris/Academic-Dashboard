import { apiFetch } from "@/lib/queryClient";

export type SimulationInput = {
  assessmentId: string;
  simulatedScore: number;
  targetScore?: number;
};

export type SimulationResult = {
  projectedGrade: number;
  maxPossibleGrade: number;
};

export function simulateCourse(
  courseId: string,
  data: SimulationInput[]
) {
  return apiFetch(`/courses/${courseId}/simulate`, {
    method: "POST",
    body: JSON.stringify({ assessments: data }),
  });
}
