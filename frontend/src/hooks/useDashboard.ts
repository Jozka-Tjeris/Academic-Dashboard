import { useQuery } from "@tanstack/react-query";
import { useApi } from "@/hooks/useApi";
import { getCourseDashboard, getUserDashboard } from "@/api/dashboard";
import { queryKeys } from "@/lib/queryKeys";

export const useCourseDashboard = (courseId: string) => {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: queryKeys.courses.dashboard(courseId),
    queryFn: () => getCourseDashboard(secureFetch, courseId),
    enabled: !!courseId,
  });
}

export const useUserDashboard = () => {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: queryKeys.dashboard.global,
    queryFn: () => getUserDashboard(secureFetch),
  });
}

