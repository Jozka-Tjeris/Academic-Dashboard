"use client";

import { useMutation } from "@tanstack/react-query";
import { createAssessment, updateAssessment, deleteAssessment } from "@/api/assessments";
import { useApi } from "./useApi";
import { queryKeys } from "@/lib/queryKeys";
import { queryClient } from "@/lib/queryClient";

export const useCreateAssessment = (courseId: string) => {
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: (data: {
      title: string;
      dueDate: Date;
      weight: number;
      maxScore: number;
      description: string;
    }) => createAssessment(secureFetch, courseId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(courseId),
      });
    },
  });
}

export const useUpdateAssessment = (courseId: string) => {
  const { secureFetch } = useApi();

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
    }) => updateAssessment(secureFetch, id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(courseId),
      });
    },
  });
}

export const useDeleteAssessment = (courseId: string) => {
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: ({
      id,
    }: {
      id: string;
    }) => deleteAssessment(secureFetch, id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(courseId),
      });
    },
  });
}
