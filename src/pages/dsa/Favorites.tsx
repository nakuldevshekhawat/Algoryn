import { useNavigate } from "react-router-dom";
import { useProblems } from "@/hooks/useProblems";
import {
  StarIcon as StarSolidIcon,
  CheckCircleIcon as CheckSolidIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";

export default function Favorites() {
  const { data, isLoading } = useProblems({ favorite: true, pageSize: 100 });
  const navigate = useNavigate();

  const getDifficultyBadge = (diff: string) => {
    if (diff === "Easy") return "bg-pastel-mint text-brand-primary-dark";
    if (diff === "Medium") return "bg-pastel-yellow text-yellow-800";
    if (diff === "Hard") return "bg-pastel-peach text-orange-800";
    return "bg-theme-surface-muted text-theme-text-dim";
  };

  return (
    <div className="animate-fade-in w-full pb-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Favorites</h1>
        <p className="text-theme-muted text-lg font-medium">Your bookmarked data structure problems.</p>
      </header>

      <div className="flex-1">
        {isLoading ? (
          <div className="p-12 text-center text-[15px] font-medium text-theme-muted">Loading favorites...</div>
        ) : !data?.items.length ? (
          <div className="flex flex-col items-center justify-center py-20 bg-theme-card border border-theme-border-strong rounded-[24px] shadow-softer text-center">
            <div className="w-16 h-16 bg-theme-surface-muted rounded-[16px] flex items-center justify-center mb-6">
              <StarOutlineIcon className="w-8 h-8 text-theme-text-dim" />
            </div>
            <h2 className="text-[18px] font-bold text-theme-text">No favorites yet</h2>
            <p className="text-[15px] font-medium text-theme-muted mt-2 max-w-sm">
              Star problems while practicing to quickly find them here later.
            </p>
            <button 
              onClick={() => navigate("/dsa/problems")}
              className="mt-8 px-6 py-3 bg-theme-text rounded-full shadow-sm text-[15px] font-bold text-white hover:bg-theme-muted transition-colors"
            >
              Browse Problems
            </button>
          </div>
        ) : (
          <div className="flex flex-col bg-theme-card border border-theme-border-strong rounded-[24px] shadow-softer overflow-hidden">
            <div className="flex items-center px-6 py-4 text-[12px] font-bold text-theme-muted uppercase tracking-widest border-b border-theme-border-strong bg-theme-surface-muted/50">
              <div className="w-12 text-center shrink-0">St</div>
              <div className="w-12 shrink-0">#</div>
              <div className="flex-1 min-w-0">Title</div>
              <div className="w-48 shrink-0 hidden md:block">Topic</div>
              <div className="w-24 shrink-0 text-center">Difficulty</div>
            </div>
            
            <div className="flex flex-col">
              {data.items.map((problem) => (
                <div 
                  key={problem.id}
                  onClick={() => navigate(`/?problemId=${problem.id}`)}
                  className="group flex items-center px-6 py-4 hover:bg-theme-surface-hover/50 cursor-pointer transition-colors border-b border-theme-border-strong last:border-0"
                >
                  <div className="w-12 flex justify-center shrink-0">
                    {problem.is_solved ? (
                      <CheckSolidIcon className="w-6 h-6 text-brand-primary" />
                    ) : (
                      <div className="w-5 h-5 rounded-[6px] border-2 border-theme-border-strong group-hover:border-brand-primary bg-theme-card transition-colors" />
                    )}
                  </div>
                  <div className="w-12 shrink-0 text-[14px] font-bold text-theme-muted">
                    {problem.problemNumber}
                  </div>
                  <div className="flex-1 min-w-0 pr-4 flex items-center gap-2">
                    <StarSolidIcon className="w-5 h-5 text-yellow-400 shrink-0" />
                    <span className="text-[15px] text-theme-text font-bold group-hover:text-brand-primary transition-colors truncate block">
                      {problem.name}
                    </span>
                  </div>
                  <div className="w-48 shrink-0 hidden md:block text-[14px] font-medium text-theme-muted truncate pr-4">
                    {problem.topic}
                  </div>
                  <div className="w-24 shrink-0 flex justify-center">
                    <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${getDifficultyBadge(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
