import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckSolidIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import { fetchProblem } from "@/services/localProblemService";
import { toggleSolved, toggleFavorite } from "@/services/progressService";
import { upsertNote } from "@/services/notesService";
import { Tooltip } from "@/components/ui/Tooltip";
import type { Platform } from "@/types/common";
import type { ProblemDetail as ProblemDetailType } from "@/types/problem";
import { PLATFORM_LABELS } from "@/types/common";

/** Platform link button. */
function PlatformLink({ platform, url }: { platform: Platform; url: string }) {
  if (!url) return null;

  const iconMap: Record<string, React.ReactNode> = {
    youtube: <PlayIcon className="w-4 h-4" />,
    default: <ArrowTopRightOnSquareIcon className="w-4 h-4" />,
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-bold
        bg-white text-theme-text border border-black/5 shadow-sm
        hover:bg-gray-50 transition-colors duration-150"
    >
      {iconMap[platform] || iconMap.default}
      {PLATFORM_LABELS[platform]}
    </a>
  );
}

export default function ProblemDetail({ id }: { id?: string }) {
  const queryClient = useQueryClient();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteContent, setNoteContent] = useState("");

  if (!id) return null;

  const { data: problem, isLoading, error } = useQuery({
    queryKey: ["problem", id],
    queryFn: () => fetchProblem(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (problem?.id) {
      import("@/services/storage").then(storage => {
        storage.logRecentProblem(problem.id);
        queryClient.invalidateQueries({ queryKey: ['recentProblems'] });
      });
    }
  }, [problem?.id, queryClient]);

  const solveMutation = useMutation({
    mutationFn: () => toggleSolved(id!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["problem", id] });
      const previousProblem = queryClient.getQueryData<ProblemDetailType>(["problem", id]);
      if (previousProblem) {
        queryClient.setQueryData<ProblemDetailType>(["problem", id], {
          ...previousProblem,
          is_solved: !previousProblem.is_solved,
        });
      }
      return { previousProblem };
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousProblem) {
        queryClient.setQueryData(["problem", id], context.previousProblem);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["problem", id] });
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const favMutation = useMutation({
    mutationFn: () => toggleFavorite(id!),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["problem", id] });
      const previousProblem = queryClient.getQueryData<ProblemDetailType>(["problem", id]);
      if (previousProblem) {
        queryClient.setQueryData<ProblemDetailType>(["problem", id], {
          ...previousProblem,
          is_favorite: !previousProblem.is_favorite,
        });
      }
      return { previousProblem };
    },
    onError: (_err, _newVal, context) => {
      if (context?.previousProblem) {
        queryClient.setQueryData(["problem", id], context.previousProblem);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["problem", id] });
      queryClient.invalidateQueries({ queryKey: ["problems"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
    },
  });

  const noteMutation = useMutation({
    mutationFn: (newNote: string) => upsertNote(id!, newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["problem", id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setIsEditingNote(false);
    },
    onError: (err: any) => {
      alert(err.message || "Failed to save note");
    }
  });

  if (isLoading) {
    return <div className="p-8 text-[15px] font-medium text-theme-muted">Loading problem details...</div>;
  }

  if (error || !problem) {
    return (
      <div className="flex flex-col items-start min-h-[50vh]">
        <p className="text-orange-600 mb-4 font-semibold">Problem not found</p>
      </div>
    );
  }

  const platforms = Object.entries(problem.platforms).filter(([, url]) => url) as [Platform, string][];
  const difficultyBadge = problem.difficulty === "Easy" ? "bg-emerald-50 text-emerald-700" : problem.difficulty === "Medium" ? "bg-yellow-50 text-yellow-700" : "bg-orange-50 text-orange-700";

  return (
    <div className="animate-fade-in w-full pb-16">
      
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[13px] font-bold px-4 py-1.5 rounded-full ${difficultyBadge}`}>
            {problem.difficulty}
          </span>
          <span className="text-[14px] font-bold text-theme-muted">
            {problem.subtopic}
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-theme-text mb-4 leading-tight">
          {problem.name}
        </h1>
        
        {problem.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap mb-8">
            {problem.tags.map((tag) => (
              <span key={tag} className="px-3 py-1.5 text-[12px] font-bold text-theme-muted bg-gray-100 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Main Actions */}
        <div className="flex items-center gap-3">
          <Tooltip content={problem.is_solved ? "Mark as unsolved" : "Mark as solved"} position="top">
            <button
              onClick={() => solveMutation.mutate()}
              disabled={solveMutation.isPending}
              className={`p-3 rounded-[16px] shadow-sm transition-all border flex items-center justify-center ${
                problem.is_solved 
                  ? "bg-brand-primary-light/30 border-brand-primary/30 text-brand-primary" 
                  : "bg-white border-black/5 text-theme-muted hover:text-theme-text hover:bg-gray-50"
              }`}
            >
              {problem.is_solved ? <CheckSolidIcon className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
            </button>
          </Tooltip>
          
          <Tooltip content={problem.is_favorite ? "Remove favorite" : "Add favorite"} position="top">
            <button
              onClick={() => favMutation.mutate()}
              disabled={favMutation.isPending}
              className={`p-3 rounded-[16px] shadow-sm transition-all border flex items-center justify-center ${
                problem.is_favorite
                  ? "bg-orange-50 border-orange-200 text-orange-500"
                  : "bg-white border-black/5 text-theme-muted hover:text-theme-text hover:bg-gray-50"
              }`}
            >
              {problem.is_favorite ? <StarSolidIcon className="w-6 h-6" /> : <StarIcon className="w-6 h-6" />}
            </button>
          </Tooltip>
        </div>
      </header>
      
      <hr className="border-black/5 mb-10" />

      {/* Resource Links Section */}
      {platforms.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[14px] font-bold text-theme-muted uppercase tracking-widest mb-4">Resources</h2>
          <div className="flex flex-wrap gap-3 items-center">
            {platforms.map(([platform, url]) => (
              <PlatformLink key={platform} platform={platform} url={url} />
            ))}
          </div>
        </section>
      )}

      {/* Notes Section */}
      <section className="bg-white border border-black/5 rounded-[20px] p-6 sm:p-8 shadow-softer">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 text-theme-text">
            <div className="w-10 h-10 rounded-[12px] bg-gray-100 flex items-center justify-center">
              <DocumentTextIcon className="w-5 h-5 text-theme-muted" />
            </div>
            <h2 className="text-xl font-bold">Implementation Notes</h2>
          </div>
          {!isEditingNote && (
            <button
              onClick={() => {
                setNoteContent(problem.note || "");
                setIsEditingNote(true);
              }}
              className="text-[14px] font-bold bg-gray-50 border border-black/5 px-5 py-2.5 rounded-[12px] shadow-sm text-theme-text hover:bg-gray-100 transition-colors"
            >
              {problem.note ? "Edit Note" : "+ Add Note"}
            </button>
          )}
        </div>
        
        {isEditingNote ? (
          <div className="space-y-4">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Document your intuition, approach, or time complexity here..."
              className="w-full h-64 px-5 py-4 text-[15px] font-medium bg-gray-50 border border-black/5 shadow-inner rounded-[16px]
                text-theme-text placeholder:text-gray-400 resize-y focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsEditingNote(false)}
                disabled={noteMutation.isPending}
                className="px-6 py-2.5 text-[14px] font-bold text-theme-muted bg-white border border-black/5 shadow-sm rounded-[12px] hover:text-theme-text hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => noteMutation.mutate(noteContent)}
                disabled={noteMutation.isPending}
                className="px-6 py-2.5 text-[14px] font-bold bg-theme-text text-white shadow-sm rounded-[12px] hover:bg-theme-muted transition-colors"
              >
                {noteMutation.isPending ? "Saving..." : "Save Note"}
              </button>
            </div>
          </div>
        ) : problem.note ? (
          <div className="p-6 bg-gray-50 border border-black/5 rounded-[16px]">
            <article className="prose prose-sm max-w-none text-theme-text
              prose-p:leading-relaxed prose-pre:bg-white prose-pre:border prose-pre:border-black/5 prose-a:text-brand-primary">
              <ReactMarkdown>{problem.note}</ReactMarkdown>
            </article>
          </div>
        ) : (
          <div className="py-12 border-2 border-gray-200 border-dashed rounded-[16px] text-center bg-gray-50/50">
            <p className="text-[15px] font-medium text-gray-400">
              No notes saved for this problem.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
