import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCourses,
  getCourseById,
  createCourse,
  deleteCourse,
} from "@/api/courses";

export const useCourses = () =>
  useQuery({
    queryKey: ["courses"],
    queryFn: getCourses,
  });

export const useCourse = (id: string) =>
  useQuery({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
  });

export const useCreateCourse = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useDeleteCourse = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
