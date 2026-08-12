/**
 * Local problem service — replaces the API-based problemService.ts.
 *
 * Imports the static problems.json and combines it with localStorage
 * progress data to produce the same response shapes the hooks expect.
 */

import problemsData from "@/data/problems.json";
import * as storage from "./storage";
import type { ProblemDetail, ProblemFilters, ProblemListResponse } from "@/types/problem";
import type { OverallStats, DifficultyBreakdown, TopicBreakdown } from "@/types/stats";

// Type for raw problem from JSON
interface RawProblem {
  id: string;
  topic: string;
  subtopic: string;
  problemNumber: number;
  name: string;
  difficulty: string;
  platforms: {
    gfg: string;
    leetcode: string;
    codestudio: string;
    youtube: string;
    editorial: string;
    original: string;
  };
  tags: string[];
}

const allProblems: RawProblem[] = problemsData as RawProblem[];

// ── Enrichment ───────────────────────────────────────────────────────

function enrich(problem: RawProblem): ProblemDetail {
  const solvedIds = storage.getSolvedIds();
  const favIds = storage.getFavoriteIds();
  const noteEntry = storage.getNote(problem.id);
  const revLevel = storage.getRevisionLevel(problem.id);

  return {
    ...problem,
    is_solved: solvedIds.has(problem.id),
    is_favorite: favIds.has(problem.id),
    note: noteEntry?.note || null,
    note_updated: noteEntry?.updated || null,
    revision_level: revLevel,
  };
}

// ── Fetch Problems (paginated + filtered) ────────────────────────────

export async function fetchProblems(
  filters: ProblemFilters = {}
): Promise<ProblemListResponse> {
  let filtered = [...allProblems];

  // Search query
  if (filters.query) {
    const q = filters.query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.topic.toLowerCase().includes(q) ||
        p.subtopic.toLowerCase().includes(q)
    );
  }

  // Topic filter
  if (filters.topic) {
    filtered = filtered.filter((p) => p.topic === filters.topic);
  }

  // Difficulty filter
  if (filters.difficulty) {
    filtered = filtered.filter((p) => p.difficulty === filters.difficulty);
  }

  // Solved filter
  if (filters.solved !== undefined) {
    const solvedIds = storage.getSolvedIds();
    filtered = filtered.filter((p) =>
      filters.solved ? solvedIds.has(p.id) : !solvedIds.has(p.id)
    );
  }

  // Favorite filter
  if (filters.favorite !== undefined && filters.favorite) {
    const favIds = storage.getFavoriteIds();
    filtered = filtered.filter((p) => favIds.has(p.id));
  }

  // Revision Due filter
  if (filters.revisionDue !== undefined && filters.revisionDue) {
    const rev1Ids = storage.getRevisionIds(1);
    const rev2Ids = storage.getRevisionIds(2);
    const rev3Ids = storage.getRevisionIds(3);
    filtered = filtered.filter((p) => rev1Ids.has(p.id) || rev2Ids.has(p.id) || rev3Ids.has(p.id));
  }

  const total = filtered.length;
  const pageSize = filters.pageSize || 20;
  const page = filters.page || 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filtered.slice(start, end);

  const enriched = pageItems.map(enrich);

  return {
    items: enriched,
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
  };
}

// ── Fetch single problem ─────────────────────────────────────────────

export async function fetchProblem(id: string): Promise<ProblemDetail> {
  const raw = allProblems.find((p) => p.id === id);
  if (!raw) throw new Error(`Problem '${id}' not found`);
  return enrich(raw);
}

// ── Fetch unique topics ──────────────────────────────────────────────

export async function fetchTopics(): Promise<string[]> {
  const topicSet = new Set(allProblems.map((p) => p.topic));
  return Array.from(topicSet);
}

// ── Fetch unique difficulties ────────────────────────────────────────

export async function fetchDifficulties(): Promise<string[]> {
  const diffSet = new Set(allProblems.map((p) => p.difficulty));
  return Array.from(diffSet);
}

// ── Fetch revision queues ────────────────────────────────────────────

export async function fetchRevisionQueues(): Promise<Record<string, ProblemDetail[]>> {
  const rev1Ids = storage.getRevisionIds(1);
  const rev2Ids = storage.getRevisionIds(2);
  const rev3Ids = storage.getRevisionIds(3);

  return {
    revision1: allProblems.filter((p) => rev1Ids.has(p.id)).map(enrich),
    revision2: allProblems.filter((p) => rev2Ids.has(p.id)).map(enrich),
    revision3: allProblems.filter((p) => rev3Ids.has(p.id)).map(enrich),
  };
}

// ── Fetch overall stats ──────────────────────────────────────────────

export async function fetchStats(): Promise<OverallStats> {
  const solvedIds = storage.getSolvedIds();
  const favIds = storage.getFavoriteIds();
  const revIds = storage.getRevisionIds(0);

  const totalProblems = allProblems.length;
  const totalSolved = allProblems.filter((p) => solvedIds.has(p.id)).length;

  // By difficulty
  const diffGroups: Record<string, { total: number; solved: number }> = {};
  for (const p of allProblems) {
    if (!diffGroups[p.difficulty]) diffGroups[p.difficulty] = { total: 0, solved: 0 };
    diffGroups[p.difficulty].total++;
    if (solvedIds.has(p.id)) diffGroups[p.difficulty].solved++;
  }
  const byDifficulty: DifficultyBreakdown[] = Object.entries(diffGroups).map(
    ([difficulty, { total, solved }]) => ({
      difficulty,
      total,
      solved,
      percentage: total === 0 ? 0 : Math.round((solved / total) * 100),
    })
  );

  // By topic
  const topicGroups: Record<string, { total: number; solved: number; subtopics: Record<string, number> }> = {};
  for (const p of allProblems) {
    if (!topicGroups[p.topic]) topicGroups[p.topic] = { total: 0, solved: 0, subtopics: {} };
    topicGroups[p.topic].total++;
    if (solvedIds.has(p.id)) topicGroups[p.topic].solved++;
    topicGroups[p.topic].subtopics[p.subtopic] = (topicGroups[p.topic].subtopics[p.subtopic] || 0) + 1;
  }
  const byTopic: TopicBreakdown[] = Object.entries(topicGroups).map(
    ([topic, { total, solved, subtopics }]) => ({
      topic,
      total,
      solved,
      percentage: total === 0 ? 0 : Math.round((solved / total) * 100),
      subtopics,
    })
  );

  return {
    total_problems: totalProblems,
    total_solved: totalSolved,
    total_remaining: totalProblems - totalSolved,
    completion_percentage: totalProblems === 0 ? 0 : Math.round((totalSolved / totalProblems) * 100),
    total_favorites: allProblems.filter((p) => favIds.has(p.id)).length,
    total_revision: allProblems.filter((p) => revIds.has(p.id)).length,
    by_difficulty: byDifficulty,
    by_topic: byTopic,
  };
}
