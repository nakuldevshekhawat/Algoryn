import api from "./api";
import type { OverallStats } from "@/types/stats";

/** Fetch overall statistics. */
export async function fetchStats(): Promise<OverallStats> {
  const { data } = await api.get<OverallStats>("/stats");
  return data;
}
