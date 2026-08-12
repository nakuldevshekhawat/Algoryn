/** Platform links for a problem. */
export interface Platforms {
  gfg: string;
  leetcode: string;
  codestudio: string;
  youtube: string;
  editorial: string;
  original: string;
}

/** A single DSA problem. */
export interface Problem {
  id: string;
  topic: string;
  subtopic: string;
  problemNumber: number;
  name: string;
  difficulty: string;
  platforms: Platforms;
  tags: string[];
}

/** Problem enriched with user state. */
export interface ProblemDetail extends Problem {
  is_solved: boolean;
  is_favorite: boolean;
  note: string | null;
  note_updated: string | null;
  revision_level: number;
}

/** Filters for the problems list. */
export interface ProblemFilters {
  query?: string;
  topic?: string;
  difficulty?: string;
  platform?: string;
  solved?: boolean;
  favorite?: boolean;
  revisionDue?: boolean;
  page?: number;
  pageSize?: number;
}

/** Paginated problem list response. */
export interface ProblemListResponse {
  items: ProblemDetail[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
