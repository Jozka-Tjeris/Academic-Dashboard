import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import { getCourseDashboard } from "@/api/dashboard";

export function useCourseDashboard(courseId: string) {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: ["dashboard", courseId],
    queryFn: () => getCourseDashboard(secureFetch, courseId),
    enabled: !!courseId,
  });
}
