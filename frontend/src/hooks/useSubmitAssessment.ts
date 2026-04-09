"use client";

import { useUpdateAssessment } from "./useAssessments";

export const useSubmitAssessment = (courseId: string, assessmentId: string) => {
  const mutation = useUpdateAssessment(courseId, assessmentId);

  const submit = (assessmentId: string, score: number | null = null) => {
    const now = new Date();
    return mutation.mutateAsync({
      id: assessmentId,
      data: { score, submissionDate: now },
    });
  };

  return {
    submit,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};
