import { CourseShared } from "@internal_package/shared";

// Define a type for our secure fetcher to keep TS happy
type Fetcher = (url: string, options?: RequestInit) => Promise<Response>;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error("Network response was not ok");
  if (response.status === 204) return {} as T;
  return response.json();
}

export const getCourses = (fetcher: Fetcher) => 
  fetcher("/courses").then(res => handleResponse<CourseShared[]>(res));

export const getCourseById = (fetcher: Fetcher, id: string) =>
  fetcher(`/courses/${id}`).then(res => handleResponse<CourseShared>(res));

export const createCourse = (fetcher: Fetcher, data: { name: string; description?: string }) =>
  fetcher("/courses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  }).then(res => handleResponse<CourseShared>(res));

export const deleteCourse = (fetcher: Fetcher, id: string) =>
  fetcher(`/courses/${id}`, {
    method: "DELETE",
  }).then(res => handleResponse<void>(res));
