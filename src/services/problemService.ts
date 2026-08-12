import api from "./api";
import type { ProblemDetail, ProblemFilters, ProblemListResponse } from "@/types/problem";

/** Fetch paginated, filtered problems list. */
export async function fetchProblems(
  filters: ProblemFilters = {}
): Promise<ProblemListResponse> {
  const params: Record<string, string | number | boolean> = {};

  if (filters.query) params.query = filters.query;
  if (filters.topic) params.topic = filters.topic;
  if (filters.difficulty) params.difficulty = filters.difficulty;
  if (filters.platform) params.platform = filters.platform;
  if (filters.solved !== undefined) params.solved = filters.solved;
  if (filters.favorite !== undefined) params.favorite = filters.favorite;
  if (filters.page) params.page = filters.page;
  if (filters.pageSize) params.page_size = filters.pageSize;

  const { data } = await api.get<ProblemListResponse>("/problems", { params });
  return data;
}

/** Fetch a single problem by ID. */
export async function fetchProblem(id: string): Promise<ProblemDetail> {
  const { data } = await api.get<ProblemDetail>(`/problems/${id}`);
  return data;
}

/** Fetch unique topic names. */
export async function fetchTopics(): Promise<string[]> {
  const { data } = await api.get<string[]>("/problems/topics");
  return data;
}

/** Fetch unique difficulty levels. */
export async function fetchDifficulties(): Promise<string[]> {
  const { data } = await api.get<string[]>("/problems/difficulties");
  return data;
}

/** Fetch revision queues. */
export async function fetchRevisionQueues(): Promise<Record<string, ProblemDetail[]>> {
  const { data } = await api.get<Record<string, ProblemDetail[]>>("/revision");
  return data;
}
