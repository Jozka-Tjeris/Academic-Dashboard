import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import {
  getCourses,
  getCourseById,
  createCourse,
  deleteCourse,
} from "@/api/courses";

export const useCourses = () => {
  const { secureFetch } = useApi(); // 1. Get the fetcher here
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => getCourses(secureFetch), // 2. Pass it in
  });
};

export const useCourse = (id: string) => {
  const { secureFetch } = useApi();
  return useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(secureFetch, id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const qc = useQueryClient();
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      createCourse(secureFetch, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: (id: string) => deleteCourse(secureFetch, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
