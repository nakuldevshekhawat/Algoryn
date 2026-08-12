import * as storage from "./storage";

export interface NoteEntry {
  problem_id: string;
  note: string;
  updated: string;
  problem_name: string;
}

export interface NotesListResponse {
  items: NoteEntry[];
  total: number;
}

/** Fetch all notes. */
export async function fetchNotes(): Promise<NotesListResponse> {
  const notes = storage.getNotes();
  const items: NoteEntry[] = Object.entries(notes).map(([id, entry]) => ({
    problem_id: id,
    note: entry.note,
    updated: entry.updated,
    problem_name: id,
  }));
  return { items, total: items.length };
}

/** Create or update a note. */
export async function upsertNote(
  problemId: string,
  note: string
): Promise<NoteEntry> {
  const entry = storage.saveNote(problemId, note);
  return {
    problem_id: problemId,
    note: entry.note,
    updated: entry.updated,
    problem_name: problemId,
  };
}

/** Delete a note. */
export async function deleteNote(problemId: string): Promise<void> {
  const notes = storage.getNotes();
  delete notes[problemId];
  localStorage.setItem('dsa_notes', JSON.stringify(notes));
}
