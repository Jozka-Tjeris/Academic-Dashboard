import { Fetcher } from "@/types/fetcher";
import { CourseShared } from "@internal_package/shared";
import { handleResponse } from "./handleResponse";

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
