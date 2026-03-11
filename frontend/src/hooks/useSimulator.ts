"use client";

import { useMutation } from "@tanstack/react-query";
import { simulateCourse, SimulationInput } from "@/api/simulator";
import { useApi } from "./useApi";

export function useCourseSimulation(courseId: string) {
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: (data: SimulationInput[]) => simulateCourse(secureFetch, courseId, data),
  });
}
