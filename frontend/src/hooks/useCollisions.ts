import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { getCollisions } from "@/api/assessments";

export function useCollisions() {
  const { secureFetch } = useApi();

  return useQuery({
    queryKey: ["collisions"],
    queryFn: () => getCollisions(secureFetch),
  });
}
