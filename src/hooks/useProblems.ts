import { useQuery } from "@tanstack/react-query";
import { fetchProblems, fetchTopics, fetchDifficulties, fetchRevisionQueues } from "@/services/localProblemService";
import type { ProblemFilters } from "@/types/problem";

/** Hook to fetch paginated problems with filters. */
export function useProblems(filters: ProblemFilters = {}) {
  return useQuery({
    queryKey: ["problems", filters],
    queryFn: () => fetchProblems(filters),
    staleTime: 30_000,
  });
}

const CURRICULUM_ORDER = [
  "Learn the Basics",
  "Learn Important Sorting Techniques",
  "Arrays",
  "Binary Search",
  "Strings",
  "Linked Lists",
  "Recursion",
  "Bit Manipulation",
  "Stack & Queues",
  "Sliding Window & Two Pointers",
  "Heaps",
  "Greedy Algorithms",
  "Binary Trees",
  "Binary Search Trees",
  "Graphs",
  "Dynamic Programming",
  "Tries",
  "Strings (Advanced)"
];

/** Hook to fetch unique topic names, sorted by curriculum order. */
export function useTopics() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const topics = await fetchTopics();
      // Sort based on CURRICULUM_ORDER, unknown topics go to the end alphabetically
      return topics.sort((a, b) => {
        const indexA = CURRICULUM_ORDER.findIndex(t => t.toLowerCase() === a.toLowerCase());
        const indexB = CURRICULUM_ORDER.findIndex(t => t.toLowerCase() === b.toLowerCase());
        
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      });
    },
    staleTime: 5 * 60_000,
  });
}

/** Hook to fetch unique difficulty levels. */
export function useDifficulties() {
  return useQuery({
    queryKey: ["difficulties"],
    queryFn: fetchDifficulties,
    staleTime: 5 * 60_000,
  });
}

/** Hook to fetch revision queues. */
export function useRevisionQueues() {
  return useQuery({
    queryKey: ["revision_queues"],
    queryFn: fetchRevisionQueues,
    staleTime: 30_000,
  });
}
