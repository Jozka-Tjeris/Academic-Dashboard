import { useQuery, useMutation } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import {
  getCourses,
  getCourseById,
  createCourse,
  deleteCourse,
} from "@/api/courses";
import { queryKeys } from "@/lib/queryKeys";
import { queryClient } from "@/lib/queryClient";

export const useCourses = () => {
  const { secureFetch } = useApi(); // 1. Get the fetcher here
  return useQuery({
    queryKey: queryKeys.courses.all,
    queryFn: () => getCourses(secureFetch), // 2. Pass it in
  });
};

export const useCourse = (courseId: string) => {
  const { secureFetch } = useApi();
  return useQuery({
    queryKey: queryKeys.courses.detail(courseId),
    queryFn: () => getCourseById(secureFetch, courseId),
    enabled: !!courseId,
  });
};

export const useCreateCourse = () => {
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      createCourse(secureFetch, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};

export const useDeleteCourse = () => {
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: (id: string) => deleteCourse(secureFetch, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
    },
  });
};
