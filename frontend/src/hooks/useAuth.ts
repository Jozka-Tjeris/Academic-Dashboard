import { getAuth, logout } from "@/api/auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { queryKeys } from "@/lib/queryKeys";
import { queryClient } from "@/lib/queryClient";

export const useCheckAuth = () => {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => getAuth(secureFetch),
  });
}

export const useLogout = () => {
  const { secureFetch } = useApi();

  return useMutation({
    mutationFn: () => logout(secureFetch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    }
  });
};
