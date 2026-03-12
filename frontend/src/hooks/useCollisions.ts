import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getCollisions } from "@/api/assessments";
import { queryKeys } from "@/lib/queryKeys";

export const useCollisions = () => {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: queryKeys.collisions,
    queryFn: () => getCollisions(secureFetch),
  });
}
