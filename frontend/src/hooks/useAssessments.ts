"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAssessment, updateAssessment, deleteAssessment } from "@/api/assessments";

export function useCreateAssessment(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      dueDate: Date;
      weight: number;
      maxScore: number;
      description?: string;
    }) => createAssessment(courseId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course", courseId],
      });
    },
  });
}

export function useUpdateAssessment(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        score?: number;
        submitted?: boolean;
        targetScore?: number;
      };
    }) => updateAssessment(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course", courseId],
      });
    },
  });
}

export function useDeleteAssessment(courseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssessment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course", courseId],
      });
    },
  });
}
