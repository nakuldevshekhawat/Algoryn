import * as storage from "./storage";

interface ProgressResponse {
  success: boolean;
  message: string;
  is_active: boolean;
}

/** Toggle a problem's solved status. */
export async function toggleSolved(
  problemId: string
): Promise<ProgressResponse> {
  const isNowSolved = storage.toggleSolved(problemId);
  return {
    success: true,
    message: isNowSolved ? "Problem solved" : "Problem unsolved",
    is_active: isNowSolved,
  };
}

/** Toggle a problem's favorite status. */
export async function toggleFavorite(
  problemId: string
): Promise<ProgressResponse> {
  const isNowFav = storage.toggleFavorite(problemId);
  return {
    success: true,
    message: isNowFav ? "Added to favorites" : "Removed from favorites",
    is_active: isNowFav,
  };
}

/** Toggle a problem's revision status at a specific tier. */
export async function markRevision(
  problemId: string,
  level: number
): Promise<ProgressResponse> {
  storage.setRevision(problemId, level);
  return {
    success: true,
    message: level > 0 ? `Added to revision ${level}` : "Removed from revision",
    is_active: level > 0,
  };
}
