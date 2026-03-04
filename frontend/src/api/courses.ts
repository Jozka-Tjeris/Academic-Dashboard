import { Course } from "@internal_package/shared";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${url}`, {
    credentials: "include",
    ...options,
  });

  if (!res.ok) {
    throw new Error("Something went wrong");
  }

  return res.json();
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const deleteCourse = (id: string) =>
  fetcher<void>(`/courses/${id}`, {
    method: "DELETE",
  });