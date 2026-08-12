/** Generic API response wrapper. */
export interface ApiResponse<T> {
  data: T;
  status: number;
}

/** Pagination parameters for list endpoints. */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/** Difficulty levels used across the application. */
export type Difficulty = "Easy" | "Medium" | "Hard";

/** Available coding platforms. */
export type Platform =
  | "leetcode"
  | "gfg"
  | "codestudio"
  | "youtube"
  | "editorial"
  | "original";

/** Difficulty badge color mapping. */
export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: "text-difficulty-easy bg-difficulty-easy/10 border-difficulty-easy/20",
  Medium:
    "text-difficulty-medium bg-difficulty-medium/10 border-difficulty-medium/20",
  Hard: "text-difficulty-hard bg-difficulty-hard/10 border-difficulty-hard/20",
};

/** Platform display names. */
export const PLATFORM_LABELS: Record<Platform, string> = {
  leetcode: "LeetCode",
  gfg: "GeeksforGeeks",
  codestudio: "CodeStudio",
  youtube: "YouTube",
  editorial: "Editorial",
  original: "Original",
};
