/**
 * localStorage-based storage layer.
 *
 * Replaces the Python backend for progress, favorites, revision, and notes.
 * All data is persisted in the browser's localStorage.
 */

import problemsData from '../data/problems.json';

const STORAGE_KEYS = {
  SOLVED: "dsa_solved",
  FAVORITES: "dsa_favorites",
  REVISION1: "dsa_revision1",
  REVISION2: "dsa_revision2",
  REVISION3: "dsa_revision3",
  NOTES: "dsa_notes",
  RECENT: "dsa_recent_activity",
} as const;

// ── Helpers ──────────────────────────────────────────────────────────

function getList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setList(key: string, list: string[]): void {
  localStorage.setItem(key, JSON.stringify(list));
}

function getMap(key: string): Record<string, any> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setMap(key: string, map: Record<string, any>): void {
  localStorage.setItem(key, JSON.stringify(map));
}

// ── Solved ───────────────────────────────────────────────────────────

export function getSolvedIds(): Set<string> {
  return new Set(getList(STORAGE_KEYS.SOLVED));
}

export function getSolvedList(): string[] {
  return getList(STORAGE_KEYS.SOLVED);
}

/** Toggle solved status. Returns true if now solved. */
export function toggleSolved(problemId: string): boolean {
  const list = getList(STORAGE_KEYS.SOLVED);
  const idx = list.indexOf(problemId);
  if (idx >= 0) {
    list.splice(idx, 1);
    setList(STORAGE_KEYS.SOLVED, list);
    return false;
  } else {
    list.push(problemId);
    setList(STORAGE_KEYS.SOLVED, list);
    return true;
  }
}

// ── Favorites ────────────────────────────────────────────────────────

export function getFavoriteIds(): Set<string> {
  return new Set(getList(STORAGE_KEYS.FAVORITES));
}

/** Toggle favorite status. Returns true if now favorited. */
export function toggleFavorite(problemId: string): boolean {
  const list = getList(STORAGE_KEYS.FAVORITES);
  const idx = list.indexOf(problemId);
  if (idx >= 0) {
    list.splice(idx, 1);
    setList(STORAGE_KEYS.FAVORITES, list);
    return false;
  } else {
    list.push(problemId);
    setList(STORAGE_KEYS.FAVORITES, list);
    return true;
  }
}

// ── Revision ─────────────────────────────────────────────────────────

const REVISION_KEYS = [
  STORAGE_KEYS.REVISION1,
  STORAGE_KEYS.REVISION2,
  STORAGE_KEYS.REVISION3,
];

export function getRevisionIds(level: number): Set<string> {
  if (level === 0) {
    // All tiers
    const ids = new Set<string>();
    REVISION_KEYS.forEach((key) => getList(key).forEach((id) => ids.add(id)));
    return ids;
  }
  return new Set(getList(REVISION_KEYS[level - 1]));
}

export function getRevisionLevel(problemId: string): number {
  for (let i = 0; i < 3; i++) {
    if (getList(REVISION_KEYS[i]).includes(problemId)) return i + 1;
  }
  return 0;
}

/** Move problem to revision tier (1-3), or remove if 0. */
export function setRevision(problemId: string, level: number): void {
  // Remove from all tiers first
  for (const key of REVISION_KEYS) {
    const list = getList(key);
    const idx = list.indexOf(problemId);
    if (idx >= 0) {
      list.splice(idx, 1);
      setList(key, list);
    }
  }

  // Add to target tier
  if (level >= 1 && level <= 3) {
    const list = getList(REVISION_KEYS[level - 1]);
    list.push(problemId);
    setList(REVISION_KEYS[level - 1], list);
  }
}

// ── Notes ────────────────────────────────────────────────────────────

export interface NoteEntry {
  note: string;
  updated: string;
}

export function getNotes(): Record<string, NoteEntry> {
  return getMap(STORAGE_KEYS.NOTES);
}

export function getNote(problemId: string): NoteEntry | null {
  const notes = getNotes();
  return notes[problemId] || null;
}

export function saveNote(problemId: string, noteText: string): NoteEntry {
  const notes = getNotes();
  const entry: NoteEntry = { note: noteText, updated: new Date().toISOString() };
  notes[problemId] = entry;
  setMap(STORAGE_KEYS.NOTES, notes);
  return entry;
}

// ── Reset ────────────────────────────────────────────────────────────

export function resetProgress(): void {
  setList(STORAGE_KEYS.SOLVED, []);
  setList(STORAGE_KEYS.FAVORITES, []);
  setList(STORAGE_KEYS.REVISION1, []);
  setList(STORAGE_KEYS.REVISION2, []);
  setList(STORAGE_KEYS.REVISION3, []);
  setMap(STORAGE_KEYS.NOTES, {});
  setList(STORAGE_KEYS.RECENT, []);
}

// ── Recent Activity ──────────────────────────────────────────────────

export function getRecentProblems(): any[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECENT);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((item: any) => {
      if (typeof item === 'string') return { id: item, timestamp: Date.now() };
      return item;
    });
  } catch {
    return [];
  }
}

export function logRecentProblem(problemId: string): void {
  const list = getRecentProblems();
  const idx = list.findIndex(item => item.id === problemId);
  if (idx >= 0) {
    list.splice(idx, 1);
  }
  list.unshift({ id: problemId, timestamp: Date.now() });
  if (list.length > 50) {
    list.pop();
  }
  localStorage.setItem(STORAGE_KEYS.RECENT, JSON.stringify(list));
}

export function clearRecentProblems(): void {
  setList(STORAGE_KEYS.RECENT, []);
}

export function getNextDSAProblem(): any {
  const solvedIds = getSolvedIds();
  const allProblems = problemsData as any[];
  
  if (solvedIds.size === 0) {
    return allProblems[0];
  }

  // Find the highest index of a solved problem in the dataset order
  let maxSolvedIndex = -1;
  for (let i = 0; i < allProblems.length; i++) {
    if (solvedIds.has(allProblems[i].id)) {
      maxSolvedIndex = i;
    }
  }

  // If there is a problem after the max solved index, return it
  if (maxSolvedIndex >= 0 && maxSolvedIndex < allProblems.length - 1) {
    return allProblems[maxSolvedIndex + 1];
  }

  // If all are solved
  return null;
}
