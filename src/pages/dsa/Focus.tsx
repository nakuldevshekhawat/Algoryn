import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { useStats } from '@/hooks/useStats';
import { useProblems } from '@/hooks/useProblems';
import { 
  MagnifyingGlassIcon as SearchIcon, 
  PlayIcon as Play, 
  BookOpenIcon as BookOpen, 
  ClockIcon as Clock, 
  CheckCircleIcon as CheckCircle, 
  ChartBarIcon as BarChart2, 
  ListBulletIcon as ListVideo 
} from '@heroicons/react/24/outline';

export default function Focus() {
  const { data: stats } = useStats();
  const { data: fallbackProblems } = useProblems({ pageSize: 1 });
  
  const { data: recentProblems = [] } = useQuery({
    queryKey: ['recentProblems'],
    queryFn: async () => {
      const storage = await import('@/services/storage');
      const recentIds = storage.getRecentProblems();
      const localService = await import('@/services/localProblemService');
      const problems = await Promise.all(
        recentIds.map(id => localService.fetchProblem(id).catch(() => null))
      );
      return problems.filter(Boolean) as any[];
    }
  });

  const navigate = useNavigate();

  const recent = recentProblems;
  
  const overallPercentage = stats?.total_problems === 0 
    ? 0 
    : Math.round(((stats?.total_solved || 0) / (stats?.total_problems || 1)) * 100);

  const continueTarget = recent.find(p => !p.is_solved) || recent[0] || fallbackProblems?.items?.[0];

  return (
    <div className="w-full pb-16">
      {/* Greeting */}
      <header className="mb-10 pt-4 pl-2">
        <h1 className="text-[34px] font-bold text-theme-text flex items-center gap-3 leading-tight tracking-tight">
          Invest in your <br/> education
        </h1>
        <p className="text-theme-muted mt-3 text-[17px] font-medium">Hello, Learner! 👋 Let's continue your DSA journey.</p>
      </header>

      {/* Quick Access Categories */}
      <div className="flex flex-wrap items-center gap-4 mb-10 pl-2">
         <div className="bg-theme-text text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 cursor-default">
           <ListVideo className="w-4 h-4" /> All
         </div>
         <Link to="/roadmap" className="bg-accent-mint/40 hover:bg-accent-mint/60 text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <ListVideo className="w-4 h-4" /> Browse
         </Link>
         <button onClick={() => {
           const event = new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true });
           document.dispatchEvent(event);
         }} className="bg-pastel-lavender hover:bg-accent-lavender text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <SearchIcon className="w-4 h-4" /> Search
         </button>
         <Link to="/statistics" className="bg-pastel-peach hover:bg-accent-peach text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <BarChart2 className="w-4 h-4" /> Statistics
         </Link>
      </div>

      <h2 className="text-sm font-bold text-theme-muted mb-4 pl-2">Course overview</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        
        {/* Progress Hero */}
        <div className="bg-pastel-pink border border-theme-border rounded-[28px] p-8 flex flex-col justify-between shadow-softer relative overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 bg-theme-card/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <BarChart2 className="w-4 h-4 text-theme-text" />
                <span className="text-xs font-bold text-theme-text">Progress</span>
             </div>
             <div className="bg-theme-card px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                {overallPercentage}%
             </div>
          </div>
          <div className="z-10 relative mt-4">
            <h3 className="text-2xl font-bold text-theme-text mb-2 tracking-tight leading-snug">DSA Journey</h3>
            <p className="text-[14px] font-semibold text-theme-text/70">{stats?.total_solved || 0} / {stats?.total_problems || 0} problems solved</p>
          </div>
        </div>

        {/* Continue Learning */}
        <div className="bg-pastel-yellow border border-theme-border rounded-[28px] p-8 flex flex-col justify-between shadow-softer relative overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 bg-theme-card/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Play className="w-4 h-4 text-theme-text" />
                <span className="text-xs font-bold text-theme-text">Continue</span>
             </div>
             <div className="bg-theme-card px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                Up next
             </div>
          </div>
          <div className="z-10 relative mt-4">
            {continueTarget ? (
               <>
                 <h3 className="text-xl font-bold text-theme-text mb-2 tracking-tight leading-snug line-clamp-2">{continueTarget.name}</h3>
                 <button onClick={() => navigate(`/?problemId=${continueTarget.id}`)} className="text-[14px] font-bold text-theme-text hover:opacity-70 transition-opacity">{continueTarget.topic} &rarr;</button>
               </>
            ) : (
               <h3 className="text-2xl font-bold text-theme-text mb-2 tracking-tight leading-snug">All caught up!</h3>
            )}
          </div>
        </div>

        {/* Learning Status */}
        <div className="bg-pastel-lavender border border-theme-border rounded-[28px] p-8 flex flex-col justify-between shadow-softer relative overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 bg-theme-card/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <CheckCircle className="w-4 h-4 text-theme-text" />
                <span className="text-xs font-bold text-theme-text">Status</span>
             </div>
             <div className="bg-theme-card px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                Overview
             </div>
          </div>
          <div className="z-10 relative mt-4">
            <h3 className="text-xl font-bold text-theme-text mb-2 tracking-tight leading-snug">Course Status</h3>
            <div className="flex gap-4 mt-2">
               <div><span className="font-bold text-lg">{stats?.total_solved || 0}</span> <span className="text-xs font-semibold text-theme-text/70">Done</span></div>
               <div><span className="font-bold text-lg">{stats?.total_remaining || 0}</span> <span className="text-xs font-semibold text-theme-text/70">Remaining</span></div>
            </div>
          </div>
        </div>

        {/* Course Summary */}
        <div className="bg-pastel-mint border border-theme-border rounded-[28px] p-8 flex flex-col justify-between shadow-softer relative overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 bg-theme-card/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <BookOpen className="w-4 h-4 text-theme-text" />
                <span className="text-xs font-bold text-theme-text">Course</span>
             </div>
             <div className="bg-theme-card px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                <span className="text-orange-500">★</span> Top 10
             </div>
          </div>
          <div className="z-10 relative mt-4">
            <h3 className="text-xl font-bold text-theme-text mb-2 tracking-tight leading-snug">DSA Companion</h3>
            <p className="text-[14px] font-semibold text-theme-text/70">{stats?.total_problems || 0} Problems &middot; Master Data Structures</p>
          </div>
        </div>

      </div>

      <h2 className="text-sm font-bold text-theme-muted mb-4 pl-2 mt-12">Recently Opened</h2>
      
      {recent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recent.map((problem) => {
            return (
              <button 
                key={problem.id}
                onClick={() => navigate(`/?problemId=${problem.id}`)}
                className="flex flex-col justify-between p-6 bg-theme-card rounded-[24px] shadow-softer hover:shadow-soft hover:-translate-y-1 transition-all group border border-theme-border-strong text-left w-full h-full"
              >
                <div className="flex items-center gap-3 mb-5 w-full">
                  <div className="w-12 h-12 bg-pastel-lavender/40 rounded-[16px] flex items-center justify-center text-theme-text group-hover:bg-pastel-lavender transition-colors flex-shrink-0 shadow-sm">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-theme-muted bg-theme-surface-muted border border-theme-border-strong px-3 py-1.5 rounded-[8px] ml-auto">Recent</span>
                </div>
                <div>
                  <h3 className="font-bold text-theme-text text-[16px] leading-snug mb-1 line-clamp-2 group-hover:text-brand-primary transition-colors">{problem.name}</h3>
                  <p className="text-[13px] font-semibold text-theme-muted">{problem.topic}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 bg-theme-card border border-theme-border-strong rounded-[24px] shadow-softer text-center">
           <div className="w-16 h-16 bg-theme-surface-muted rounded-[16px] flex items-center justify-center mb-4 border border-theme-border-strong shadow-sm">
             <Clock className="w-8 h-8 text-theme-text-dim" />
           </div>
           <p className="font-bold text-theme-text text-[18px]">No problems opened yet.</p>
           <p className="text-[15px] font-medium text-theme-muted mt-2">Start exploring problems from the Roadmap.</p>
        </div>
      )}

    </div>
  );
}
