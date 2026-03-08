"use client";

import { useMutation } from "@tanstack/react-query";
import { simulateCourse, SimulationInput } from "@/api/simulator";

export function useCourseSimulation(courseId: string) {
  return useMutation({
    mutationFn: (data: SimulationInput[]) => simulateCourse(courseId, data),
  });
}
