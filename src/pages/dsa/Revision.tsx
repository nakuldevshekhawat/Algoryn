import { useNavigate } from "react-router-dom";
import { useRevisionQueues } from "@/hooks/useProblems";
import { ClockIcon, CheckCircleIcon as CheckSolidIcon } from "@heroicons/react/24/outline";
import * as storage from "@/services/storage";
import { useQueryClient } from "@tanstack/react-query";
import type { ProblemDetail } from "@/types/problem";

export default function Revision() {
  const { data: queues, isLoading } = useRevisionQueues();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLevelChange = (problemId: string, newLevel: number) => {
    storage.setRevision(problemId, newLevel);
    queryClient.invalidateQueries();
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === "Easy") return "bg-pastel-mint text-brand-primary-dark";
    if (diff === "Medium") return "bg-pastel-yellow text-yellow-800";
    if (diff === "Hard") return "bg-pastel-peach text-orange-800";
    return "bg-theme-surface-muted text-theme-text-dim";
  };

  const renderColumn = (title: string, level: number, problems: ProblemDetail[] = []) => (
    <div className="flex flex-col flex-1 min-w-[320px] max-w-md bg-theme-card border border-theme-border-strong rounded-[24px] overflow-hidden h-full shrink-0 shadow-softer">
      <div className="flex items-center justify-between p-6 border-b border-theme-border-strong bg-theme-surface-muted/50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-pastel-yellow rounded-[16px] flex items-center justify-center shadow-sm">
            <ClockIcon className="w-6 h-6 text-theme-text" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-theme-text">{title}</h2>
            <p className="text-[14px] font-medium text-theme-muted">{problems.length} problems</p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-5 overflow-y-auto bg-theme-surface-muted/30">
        {!problems.length ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-theme-surface-muted rounded-[16px] flex items-center justify-center mb-4">
              <CheckSolidIcon className="w-8 h-8 text-theme-text-dim" />
            </div>
            <p className="text-[15px] font-bold text-theme-text-dim">Empty queue</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {problems.map(problem => (
              <div key={problem.id} className="p-5 bg-theme-card border border-theme-border-strong rounded-[20px] shadow-sm hover:shadow-soft transition-all">
                <div className="flex flex-col gap-4">
                  <div className="cursor-pointer" onClick={() => navigate(`/?problemId=${problem.id}`)}>
                    <h3 className="text-[15px] font-bold text-theme-text hover:text-brand-primary transition-colors">{problem.name}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getDifficultyBadge(problem.difficulty)}`}>{problem.difficulty}</span>
                      <span className="text-[13px] font-medium text-theme-muted truncate">{problem.topic}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-theme-border-strong">
                    <button 
                      onClick={() => handleLevelChange(problem.id, level > 1 ? level - 1 : 0)}
                      className="flex-1 py-2 text-[13px] font-bold text-theme-muted bg-theme-surface-muted rounded-xl hover:text-theme-text hover:bg-theme-surface-hover border border-theme-border-strong transition-colors text-center"
                    >
                      {level > 1 ? "Demote" : "Remove"}
                    </button>
                    {level < 3 && (
                      <button 
                        onClick={() => handleLevelChange(problem.id, level + 1)}
                        className="flex-1 py-2 text-[13px] font-bold text-white bg-theme-text rounded-xl hover:bg-theme-muted transition-colors text-center"
                      >
                        Promote
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in pt-4 w-full">
      <header className="mb-10 shrink-0">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Revision Board</h1>
        <p className="text-theme-muted text-lg font-medium">Spaced repetition queues. Review and promote problems as you master them.</p>
      </header>

      {isLoading ? (
        <div className="p-12 text-center text-theme-muted font-medium text-[15px]">Loading revision data...</div>
      ) : (
        <div className="flex gap-6 h-full overflow-x-auto pb-6 items-start">
          {renderColumn("Rev 1", 1, queues?.revision1)}
          {renderColumn("Rev 2", 2, queues?.revision2)}
          {renderColumn("Rev 3", 3, queues?.revision3)}
        </div>
      )}
    </div>
  );
}
