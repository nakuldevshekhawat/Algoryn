import { useState, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as storage from "@/services/storage";
import { useTopics, useProblems } from "@/hooks/useProblems";
import { useNavigate } from "react-router-dom";
import { ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckSolidIcon, ClockIcon as ClockSolidIcon } from "@heroicons/react/24/solid";
import { ClockIcon as ClockOutlineIcon } from "@heroicons/react/24/outline";
import { 
  GFGIcon, 
  LeetCodeIcon, 
  CodeStudioIcon, 
  YouTubeIcon, 
  TUFIcon 
} from "@/components/ui/PlatformIcons";
import { useRevisionQueues } from "@/hooks/useProblems";

function SubtopicBlock({ subtopic, subProblems, searchQuery }: { subtopic: string, subProblems: any[], searchQuery?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchQuery && subProblems.length > 0) {
      setIsExpanded(true);
    }
  }, [searchQuery, subProblems]);

  const handleToggleRevision = (e: React.MouseEvent, problemId: string, currentLevel: number) => {
    e.stopPropagation();
    const levelToToggle = currentLevel > 0 ? 0 : 1;
    storage.setRevision(problemId, levelToToggle);
    queryClient.invalidateQueries();
  };

  const handleToggleSolved = (e: React.MouseEvent, problemId: string, isSolved: boolean) => {
    e.stopPropagation();
    storage.toggleSolved(problemId);
    if (!isSolved) {
      storage.setRevision(problemId, 1);
    }
    queryClient.invalidateQueries();
  };

  const subTotal = subProblems.length;
  const subSolved = subProblems.filter(p => p.is_solved).length;

  return (
    <div className="border border-black/5 rounded-[16px] overflow-hidden bg-white shadow-sm mb-4 last:mb-0">
      {/* Subtopic Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-gray-50 transition-colors bg-white"
      >
        <div className="flex items-center gap-3">
          <ChevronRightIcon className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
          <h3 className="text-[14px] font-bold text-theme-text">{subtopic}</h3>
        </div>
        <span className={`text-[12px] font-bold px-3 py-1 rounded-full ${subSolved === subTotal && subTotal > 0 ? 'bg-pastel-mint text-brand-primary-dark' : 'bg-gray-100 text-gray-500'}`}>
          {subSolved} / {subTotal}
        </span>
      </div>

      {isExpanded && (
        <div className="border-t border-black/5 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Table Header */}
              <div className="flex items-center px-5 py-2.5 text-[11px] font-bold text-theme-muted uppercase tracking-wider bg-gray-50/50 border-b border-black/5">
                <div className="w-12 text-center shrink-0">St</div>
                <div className="flex-1 min-w-0 px-2">Problem</div>
                <div className="w-10 flex justify-center shrink-0" title="TUF Article">TUF</div>
                <div className="w-10 flex justify-center shrink-0" title="YouTube">YT</div>
                <div className="w-10 flex justify-center shrink-0" title="LeetCode">LC</div>
                <div className="w-10 flex justify-center shrink-0" title="GeeksforGeeks">GFG</div>
                <div className="w-10 flex justify-center shrink-0" title="CodeStudio">CS</div>
                <div className="w-16 flex justify-center shrink-0">Rev</div>
              </div>

              {/* Table Rows */}
              <div className="flex flex-col">
                {subProblems.map((problem) => (
                  <div 
                    key={problem.id}
                    className="group flex items-center px-5 py-3 hover:bg-gray-50/50 transition-colors border-b border-black/5 last:border-0"
                  >
                    <div className="w-12 flex justify-center shrink-0">
                      <button onClick={(e) => handleToggleSolved(e, problem.id, problem.is_solved)} className="focus:outline-none">
                        {problem.is_solved ? (
                          <CheckSolidIcon className="w-5 h-5 text-brand-primary" />
                        ) : (
                          <div className="w-4 h-4 rounded-[4px] border-2 border-gray-300 group-hover:border-brand-primary transition-colors bg-white" />
                        )}
                      </button>
                    </div>
                    
                    <div 
                      className="flex-1 min-w-0 px-2 cursor-pointer flex items-center gap-3"
                      onClick={() => navigate(`/?problemId=${problem.id}`)}
                    >
                      <span className="text-[14px] font-semibold text-theme-text group-hover:text-brand-primary transition-colors truncate">
                        {problem.name}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        problem.difficulty === 'Easy' ? 'bg-pastel-mint text-brand-primary-dark' :
                        problem.difficulty === 'Medium' ? 'bg-pastel-yellow text-yellow-800' :
                        'bg-pastel-peach text-orange-800'
                      }`}>
                        {problem.difficulty}
                      </span>
                    </div>

                    <div className="w-10 flex justify-center shrink-0">
                      {problem.platforms.editorial ? (
                        <a href={problem.platforms.editorial} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <TUFIcon className="w-4 h-4 text-theme-text" />
                        </a>
                      ) : <span className="text-gray-300">-</span>}
                    </div>

                    <div className="w-10 flex justify-center shrink-0">
                      {problem.platforms.youtube ? (
                        <a href={problem.platforms.youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <YouTubeIcon className="w-4 h-4 text-red-500" />
                        </a>
                      ) : <span className="text-gray-300">-</span>}
                    </div>

                    <div className="w-10 flex justify-center shrink-0">
                      {problem.platforms.leetcode ? (
                        <a href={problem.platforms.leetcode} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <LeetCodeIcon className="w-4 h-4 text-orange-500" />
                        </a>
                      ) : <span className="text-gray-300">-</span>}
                    </div>

                    <div className="w-10 flex justify-center shrink-0">
                      {problem.platforms.gfg ? (
                        <a href={problem.platforms.gfg} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <GFGIcon className="w-4 h-4 text-green-600" />
                        </a>
                      ) : <span className="text-gray-300">-</span>}
                    </div>

                    <div className="w-10 flex justify-center shrink-0">
                      {problem.platforms.codestudio ? (
                        <a href={problem.platforms.codestudio} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <CodeStudioIcon className="w-4 h-4 text-orange-400" />
                        </a>
                      ) : <span className="text-gray-300">-</span>}
                    </div>

                    <div className="w-16 flex justify-center shrink-0">
                      <button onClick={(e) => handleToggleRevision(e, problem.id, problem.revision_level || 0)} className="focus:outline-none">
                        {(problem.revision_level || 0) > 0 ? (
                          <ClockSolidIcon className="w-5 h-5 text-orange-400" />
                        ) : (
                          <ClockOutlineIcon className="w-5 h-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TopicBlock({ topic, displayName, searchQuery, difficultyFilter, revisionDue }: { topic: string, displayName?: string, searchQuery: string, difficultyFilter: string, revisionDue: boolean }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const filters: any = { topic, pageSize: 50 };
  if (searchQuery) filters.query = searchQuery;
  if (difficultyFilter && difficultyFilter !== 'all') {
    filters.difficulty = difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1);
  }
  if (revisionDue) {
    filters.revisionDue = true;
  }
  
  const { data: problems, isLoading } = useProblems(filters);

  useEffect(() => {
    if (searchQuery && problems?.items?.length) {
      setIsExpanded(true);
    }
  }, [searchQuery, problems]);

  const total = problems?.items.length || 0;
  const solved = problems?.items.filter(p => p.is_solved).length || 0;
  const progressPercent = total === 0 ? 0 : (solved / total) * 100;

  const problemsBySubtopic = useMemo(() => {
    if (!problems?.items) return {};
    return problems.items.reduce((acc, problem) => {
      const sub = problem.subtopic || "General";
      if (!acc[sub]) acc[sub] = [];
      acc[sub].push(problem);
      return acc;
    }, {} as Record<string, typeof problems.items>);
  }, [problems]);

  return (
    <div className="mb-6">
      {/* Sleek Topic Row */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-6 py-4 cursor-pointer bg-pastel-lavender/30 rounded-[20px] hover:bg-pastel-lavender/50 transition-colors mb-3"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[14px] bg-white border border-black/5 flex items-center justify-center shadow-sm">
            <ChevronRightIcon className={`w-5 h-5 text-theme-text transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
          </div>
          <h2 className="text-[16px] font-bold text-theme-text tracking-wide">{displayName || topic}</h2>
        </div>
        <div className="flex items-center gap-5">
          <div className="w-32 h-2.5 bg-white rounded-full overflow-hidden shadow-inner hidden sm:block">
            <div 
              className="h-full bg-brand-primary transition-all duration-500 rounded-full" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[14px] text-theme-text font-bold bg-white border border-black/5 px-4 py-1.5 rounded-full shadow-sm">{solved} / {total}</span>
        </div>
      </div>

      {/* Expanded Subtopics */}
      {isExpanded && (
        <div className="pl-6 sm:pl-10 pr-2 pb-2">
          {isLoading ? (
            <div className="p-4 text-[13px] font-medium text-theme-muted">Loading problems...</div>
          ) : problems?.items.length === 0 ? (
            <div className="p-4 text-[13px] font-medium text-theme-muted">No problems found for this topic.</div>
          ) : (
            <div className="flex flex-col">
              {Object.entries(problemsBySubtopic).map(([subtopic, subProblems]) => (
                <SubtopicBlock key={subtopic} subtopic={subtopic} subProblems={subProblems} searchQuery={searchQuery} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TOPIC_ORDER = [
  "Learn the basics",
  "Learn Important Sorting Techniques",
  "Solve Problems on Arrays [Easy -> Medium -> Hard]",
  "Binary Search [1D, 2D Arrays, Search Space]",
  "Strings [Basic and Medium]",
  "Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]",
  "Recursion [PatternWise]",
  "Bit Manipulation [Concepts & Problems]",
  "Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]",
  "Sliding Window & Two Pointer Combined Problems",
  "Heaps [Learning, Medium, Hard Problems]",
  "Greedy Algorithms [Easy, Medium/Hard]",
  "Binary Trees [Traversals, Medium and Hard Problems]",
  "Binary Search Trees [Concept and Problems]",
  "Graphs [Concepts & Problems]",
  "Dynamic Programming [Patterns and Problems]",
  "Tries",
  "Strings"
];

export default function Roadmap() {
  const { data: topics = [], isLoading: isLoadingTopics } = useTopics();
  const { data: revQueues, isLoading: isLoadingRev } = useRevisionQueues();
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'revision'>('all');

  const isLoading = isLoadingTopics || isLoadingRev;

  const sortedTopics = useMemo(() => {
    if (!topics) return [];
    return [...topics].sort((a, b) => {
      const indexA = TOPIC_ORDER.indexOf(a);
      const indexB = TOPIC_ORDER.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [topics]);

  const revisionProblems = useMemo(() => {
    if (!revQueues) return [];
    return [...revQueues.revision1, ...revQueues.revision2, ...revQueues.revision3];
  }, [revQueues]);

  const displayedTopics = useMemo(() => {
    if (activeTab === 'all') return sortedTopics;
    const revTopics = new Set(revisionProblems.map(p => p.topic));
    return sortedTopics.filter(t => revTopics.has(t));
  }, [activeTab, sortedTopics, revisionProblems]);

  if (isLoading) {
    return <div className="p-12 text-center text-[15px] font-medium text-theme-muted">Loading roadmap...</div>;
  }

  return (
    <div className="w-full pb-16">
      <div className="min-w-0">
        
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-theme-text mb-2">
              Striver's A2Z Sheet
            </h1>
            <p className="text-theme-muted text-lg font-medium">
              Learn DSA from A to Z for free in a well-organised manner.
            </p>
          </div>
        </header>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 p-1 bg-white border border-black/5 rounded-full shadow-sm">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 text-[14px] font-bold rounded-full shadow-sm transition-colors ${
                activeTab === 'all' ? 'bg-theme-text text-white' : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              All Problems
            </button>
            <button 
              onClick={() => setActiveTab('revision')}
              className={`px-5 py-2 text-[14px] font-bold rounded-full shadow-sm transition-colors ${
                activeTab === 'revision' ? 'bg-theme-text text-white' : 'text-theme-muted hover:text-theme-text'
              }`}
            >
              Revision
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-theme-muted" />
              </div>
              <input
                type="text"
                placeholder="Search roadmap..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-5 pr-12 py-2.5 bg-white border border-black/5 rounded-full text-theme-text font-semibold shadow-sm focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
              />
            </div>

            <select 
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-white border border-black/5 shadow-sm font-semibold text-theme-text text-[14px] px-5 py-2.5 rounded-full focus:outline-none focus:border-brand-primary cursor-pointer appearance-none pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%237A7571' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: "right 12px center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1.2em 1.2em"
              }}
            >
              <option value="all">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-2">
          {activeTab === 'revision' && displayedTopics.length === 0 ? (
            <div className="py-20 text-center bg-white border border-black/5 rounded-[24px] shadow-softer">
              <div className="w-16 h-16 bg-pastel-lavender/30 rounded-[16px] flex items-center justify-center mx-auto mb-4">
                <CheckSolidIcon className="w-8 h-8 text-pastel-lavender-dark" />
              </div>
              <h2 className="text-[18px] font-bold text-theme-text">No problems are due for revision.</h2>
              <p className="text-[14px] font-medium text-theme-muted mt-2 max-w-sm mx-auto">
                You're all caught up! Keep practicing and problems will appear here when it's time to review them.
              </p>
            </div>
          ) : (
            displayedTopics.map((topic) => {
              const stepPrefix = TOPIC_ORDER.includes(topic) ? `Step ${TOPIC_ORDER.indexOf(topic) + 1}: ` : '';
              return <TopicBlock key={topic} topic={topic} displayName={`${stepPrefix}${topic}`} searchQuery={searchQuery} difficultyFilter={difficultyFilter} revisionDue={activeTab === 'revision'} />
            })
          )}
        </div>
      </div>
    </div>
  );
}
