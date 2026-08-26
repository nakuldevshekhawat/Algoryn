import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import * as storage from "@/services/storage";
import {
  StarIcon as StarSolidIcon,
  CheckCircleIcon as CheckSolidIcon,
} from "@heroicons/react/24/solid";
import {
  StarIcon as StarOutlineIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useProblems, useTopics, useDifficulties } from "@/hooks/useProblems";
import type { ProblemFilters } from "@/types/problem";

function FilterDropdown({ value, options, onChange, placeholder }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-theme-card border border-theme-border-strong text-[14px] font-semibold text-theme-text px-4 py-2.5 rounded-full focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary cursor-pointer shadow-sm appearance-none pr-10"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%237A7571' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: "right 12px center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "1.2em 1.2em"
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}

export default function Problems() {
  const [filters, setFilters] = useState<ProblemFilters>({ page: 1, pageSize: 1000 });
  const { data, isLoading } = useProblems(filters);
  const { data: topics = [] } = useTopics();
  const { data: difficulties = [] } = useDifficulties();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleToggleSolved = (e: React.MouseEvent, problemId: string, isSolved: boolean) => {
    e.stopPropagation();
    storage.toggleSolved(problemId);
    if (!isSolved) {
      storage.setRevision(problemId, 1);
    }
    queryClient.invalidateQueries();
  };

  const handleFilterChange = useCallback((key: keyof ProblemFilters, value: string | boolean | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  }, []);

  const getDifficultyBadge = (diff: string) => {
    if (diff === "Easy") return "bg-pastel-mint text-brand-primary-dark";
    if (diff === "Medium") return "bg-pastel-yellow text-yellow-800";
    if (diff === "Hard") return "bg-pastel-peach text-orange-800";
    return "bg-theme-surface-muted text-theme-text-dim";
  };

  return (
    <div className="w-full pb-16">
      {/* Header & Controls */}
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-theme-text mb-2">Problems</h1>
          <p className="text-theme-muted text-lg font-medium">Explore and practice {data?.total || 0} data structure challenges.</p>
        </div>

        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-theme-muted" />
          </div>
          <input
            type="text"
            placeholder="Search problems..."
            value={filters.query || ""}
            onChange={(e) => handleFilterChange("query", e.target.value)}
            className="w-full pl-5 pr-12 py-3.5 bg-theme-card border border-theme-border-strong rounded-full text-theme-text font-semibold shadow-softer focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
      </header>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <FilterDropdown 
          placeholder="All Topics" 
          value={filters.topic || ""} 
          options={topics} 
          onChange={(v: string) => handleFilterChange("topic", v)} 
        />
        <FilterDropdown 
          placeholder="All Difficulties" 
          value={filters.difficulty || ""} 
          options={difficulties} 
          onChange={(v: string) => handleFilterChange("difficulty", v)} 
        />
        
        <button
          onClick={() => handleFilterChange("solved", filters.solved ? undefined : true)}
          className={`px-5 py-2.5 text-[14px] font-semibold rounded-full transition-colors border shadow-sm focus:outline-none ${filters.solved ? "bg-pastel-mint text-brand-primary-dark border-brand-primary/20" : "bg-theme-card text-theme-muted border-theme-border-strong hover:text-theme-text"}`}
        >
          {filters.solved ? "✓ Solved Only" : "Status: All"}
        </button>
      </div>

      {/* Datagrid */}
      <div className="bg-theme-card border border-theme-border-strong rounded-[24px] shadow-softer overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[15px] font-medium text-theme-muted">Loading problems...</div>
        ) : data?.items.length === 0 ? (
          <div className="p-12 text-center text-[15px] font-medium text-theme-muted">No problems match your filters.</div>
        ) : (
          <div className="flex flex-col">
            {/* Table Header */}
            <div className="flex items-center px-6 py-4 text-[12px] font-bold text-theme-muted uppercase tracking-widest border-b border-theme-border-strong bg-theme-surface-muted/50">
              <div className="w-12 text-center shrink-0">St</div>
              <div className="w-12 shrink-0">#</div>
              <div className="flex-1 min-w-0">Title</div>
              <div className="w-48 shrink-0 hidden md:block">Topic</div>
              <div className="w-24 shrink-0 text-center">Difficulty</div>
              <div className="w-12 text-center shrink-0">Fav</div>
            </div>
            
            {/* Table Rows */}
            <div className="flex flex-col">
              {data?.items.map((problem) => (
                <div 
                  key={problem.id}
                  onClick={() => navigate(`?problemId=${problem.id}`)}
                  className="group flex items-center px-6 py-4 hover:bg-theme-surface-hover/50 cursor-pointer transition-colors border-b border-theme-border-strong last:border-0"
                >
                  <div className="w-12 flex justify-center shrink-0">
                    <button onClick={(e) => handleToggleSolved(e, problem.id, problem.is_solved)} className="focus:outline-none">
                      {problem.is_solved ? (
                        <CheckSolidIcon className="w-6 h-6 text-brand-primary" />
                      ) : (
                        <div className="w-5 h-5 rounded-[6px] border-2 border-theme-border-strong group-hover:border-brand-primary bg-theme-card shadow-sm transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="w-12 shrink-0 text-[14px] font-bold text-theme-muted">
                    {problem.problemNumber}
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[15px] text-theme-text font-bold group-hover:text-brand-primary transition-colors truncate block">
                      {problem.name}
                    </span>
                  </div>
                  <div className="w-48 shrink-0 hidden md:block text-[14px] font-medium text-theme-muted truncate pr-4">
                    {problem.topic}
                  </div>
                  <div className="w-24 shrink-0 flex justify-center">
                    <span className={`text-[12px] font-bold px-3 py-1 rounded-full whitespace-nowrap ${getDifficultyBadge(problem.difficulty)}`}>
                      {problem.difficulty}
                    </span>
                  </div>
                  <div className="w-12 flex justify-center shrink-0">
                    <button onClick={(e) => {
                      e.stopPropagation();
                      storage.toggleFavorite(problem.id);
                      queryClient.invalidateQueries();
                    }} className="focus:outline-none">
                      {problem.is_favorite ? (
                        <StarSolidIcon className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <StarOutlineIcon className="w-5 h-5 text-theme-text-dim group-hover:text-theme-text-dim transition-colors" />
                      )}
                    </button>
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
