import { logout } from "@/api/auth";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { queryKeys } from "@/lib/queryKeys";

export const useLogout = () => {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => logout(secureFetch),
  });
}
