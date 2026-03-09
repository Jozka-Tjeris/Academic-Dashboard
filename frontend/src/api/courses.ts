import { CourseShared } from "@internal_package/shared";
import { apiFetch } from "../lib/queryClient";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  return apiFetch(url, options);
}

export const getCourses = () => fetcher<CourseShared[]>("/courses");

export const getCourseById = (id: string) =>
  fetcher<CourseShared>(`/courses/${id}`);

export const createCourse = (data: {
  name: string;
  description?: string;
}) =>
  fetcher<CourseShared>("/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteCourse = (id: string) =>
  fetcher<void>(`/courses/${id}`, {
    method: "DELETE",
  });