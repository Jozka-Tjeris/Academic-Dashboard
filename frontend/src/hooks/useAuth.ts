import { getAuth } from "@/api/auth";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { queryKeys } from "@/lib/queryKeys";

export function useCheckAuth() {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => getAuth(secureFetch),
  });
}
