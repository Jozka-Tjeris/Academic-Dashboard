"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createAssessment, updateAssessment, deleteAssessment, getAssessment } from "@/api/assessments";
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
      description?: string;
    }) => createAssessment(secureFetch, courseId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(courseId),
      });
    },
  });
}

export const useAssessment = (id: string) => {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: queryKeys.assessments.detail(id),
    queryFn: () => getAssessment(secureFetch, id),
  });
};

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
        submissionDate?: Date;
        targetScore?: number;
        dueDate?: Date;
      };
    }) => updateAssessment(secureFetch, id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(courseId),
      });
    },
  });
}

export const useDeleteAssessment = () => {
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: ({
      id,
      courseId,
    }: {
      id: string;
      courseId: string;
    }) => deleteAssessment(secureFetch, id),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.courses.detail(variables.courseId),
      });
    },
  });
}
