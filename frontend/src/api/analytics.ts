import { Fetcher } from "@/types/fetcher";
import { handleResponse } from "./handleResponse";
import { CourseAnalytics } from "@/types/analytics";

export const getCourseAnalytics = (
  fetcher: Fetcher,
  courseId: string
) =>
  fetcher(`/courses/${courseId}/analytics`).then((res) =>
    handleResponse<CourseAnalytics>(res)
  );
