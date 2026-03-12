import { CourseDashboard, UserDashboard } from "@/types/dashboard";
import { Fetcher } from "@/types/fetcher";
import { handleResponse } from "./handleResponse";

export const getCourseDashboard = (
  fetcher: Fetcher,
  courseId: string
) =>
  fetcher(`/courses/${courseId}/dashboard`).then((res) =>
    handleResponse<CourseDashboard>(res)
  );

export const getUserDashboard = (
  fetcher: Fetcher
) =>
  fetcher(`/dashboard`).then((res) =>
    handleResponse<UserDashboard>(res)
  );
