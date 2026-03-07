import { Course } from "@internal_package/shared";
import { apiFetch } from "../lib/queryClient";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  return apiFetch(url, options);
}

export const getCourses = () => fetcher<Course[]>("/courses");

export const getCourseById = (id: string) =>
  fetcher<Course>(`/courses/${id}`);

export const createCourse = (data: {
  name: string;
  description?: string;
}) =>
  fetcher<Course>("/courses", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteCourse = (id: string) =>
  fetcher<void>(`/courses/${id}`, {
    method: "DELETE",
  });