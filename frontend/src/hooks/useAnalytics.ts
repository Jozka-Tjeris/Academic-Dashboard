import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import { queryKeys } from "@/lib/queryKeys";
import { getCourseAnalytics } from "@/api/analytics";

export const useCourseAnalytics = (courseId: string) => {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: queryKeys.analytics.course(courseId),
    queryFn: () => getCourseAnalytics(secureFetch, courseId),
    enabled: !!courseId,
  });
}
