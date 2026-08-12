/** Stats for a single difficulty level. */
export interface DifficultyBreakdown {
  difficulty: string;
  total: number;
  solved: number;
  percentage: number;
}

/** Stats for a single topic. */
export interface TopicBreakdown {
  topic: string;
  total: number;
  solved: number;
  percentage: number;
  subtopics: Record<string, number>;
}

/** Overall statistics response. */
export interface OverallStats {
  total_problems: number;
  total_solved: number;
  total_remaining: number;
  completion_percentage: number;
  total_favorites: number;
  total_revision: number;
  by_difficulty: DifficultyBreakdown[];
  by_topic: TopicBreakdown[];
}
