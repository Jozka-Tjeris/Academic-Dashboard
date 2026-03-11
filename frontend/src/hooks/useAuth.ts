import { getAuth } from "@/api/auth";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";

export function useCheckAuth() {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: ["auth"],
    queryFn: () => getAuth(secureFetch),
  });
}
