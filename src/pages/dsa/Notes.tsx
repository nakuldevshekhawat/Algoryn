import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { fetchNotes } from "@/services/notesService";

export default function Notes() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ["notes"],
    queryFn: fetchNotes,
  });

  if (isLoading) {
    return (
      <div className="w-full pb-16 animate-fade-in">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-theme-text mb-2">My Notes</h1>
          <p className="text-theme-muted text-lg font-medium">Your personal scratchpad and insights for problems.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-theme-card rounded-[24px] border border-theme-border-strong shadow-softer p-6 animate-pulse">
              <div className="h-5 w-48 bg-theme-surface-muted rounded mb-4" />
              <div className="h-4 w-full bg-theme-surface-muted rounded mb-2" />
              <div className="h-4 w-3/4 bg-theme-surface-muted rounded mb-6" />
              <div className="h-3 w-24 bg-theme-surface-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 text-center text-[15px] font-semibold text-orange-600">
        Failed to load notes: {(error as Error).message}
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="w-full pb-16 animate-fade-in">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-theme-text mb-2">My Notes</h1>
          <p className="text-theme-muted text-lg font-medium">Your personal scratchpad and insights for problems.</p>
        </header>
        <div className="flex flex-col items-center justify-center py-20 bg-theme-card border border-theme-border-strong rounded-[24px] shadow-softer text-center">
          <div className="w-16 h-16 bg-theme-surface-muted rounded-[16px] flex items-center justify-center mb-6">
            <DocumentTextIcon className="w-8 h-8 text-theme-text-dim" />
          </div>
          <h2 className="text-[18px] font-bold text-theme-text">No notes yet</h2>
          <p className="text-[15px] font-medium text-theme-muted mt-2 max-w-sm">
            Add notes to problems to keep track of your thoughts and approaches.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-theme-text mb-2">My Notes</h1>
        <p className="text-theme-muted text-lg font-medium">Your personal scratchpad and insights for problems.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {data.items.map((note) => (
          <div
            key={note.problem_id}
            onClick={() => navigate(`/?problemId=${note.problem_id}`)}
            className="flex flex-col bg-theme-card border border-theme-border-strong rounded-[24px] p-6 shadow-sm hover:shadow-soft hover:bg-theme-surface-hover cursor-pointer transition-all group"
          >
            <div className="mb-4">
              <h3 className="text-[16px] font-bold text-theme-text mb-1 truncate group-hover:text-brand-primary transition-colors">
                {note.problem_name}
              </h3>
            </div>
            
            <div className="flex-1 min-h-0 bg-theme-surface-muted border border-theme-border-strong shadow-inner rounded-[16px] p-5 mb-5">
              <p className="text-[14px] font-medium text-theme-text line-clamp-4 leading-relaxed whitespace-pre-wrap font-mono">
                {note.note}
              </p>
            </div>
            
            <div className="flex items-center justify-between text-[12px] font-bold text-theme-muted">
              <span>Last updated</span>
              <span className="font-mono bg-theme-surface-muted px-3 py-1.5 rounded-full">{note.updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
