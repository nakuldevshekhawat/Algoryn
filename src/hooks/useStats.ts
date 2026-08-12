import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/services/localProblemService";

/** Hook to fetch overall statistics. */
export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 30_000,
  });
}
