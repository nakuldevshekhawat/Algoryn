import { useStats } from "@/hooks/useStats";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

export default function Statistics() {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return <div className="p-12 text-center text-[15px] font-medium text-theme-muted">Analyzing progress...</div>;
  }

  return (
    <div className="w-full pb-16 animate-fade-in">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Insights</h1>
        <p className="text-theme-muted text-lg font-medium">Detailed analysis of your DSA mastery.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overall Mastery Ring */}
        <div className="md:col-span-1 bg-theme-card border border-theme-border-strong rounded-[24px] p-8 shadow-softer flex flex-col items-center justify-center">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" className="stroke-gray-100" strokeWidth="12" />
              <circle 
                cx="50" cy="50" r="42" fill="none" 
                className="stroke-brand-primary transition-all duration-1000 ease-out" 
                strokeWidth="12" 
                strokeDasharray={`${2 * Math.PI * 42}`} 
                strokeDashoffset={`${2 * Math.PI * 42 - (stats.completion_percentage / 100) * (2 * Math.PI * 42)}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[28px] font-extrabold text-theme-text font-mono leading-none">
                {stats.completion_percentage}%
              </span>
              <span className="text-[11px] font-bold text-theme-muted uppercase tracking-widest mt-1">
                Completed
              </span>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-6 w-full">
            <div className="flex-1 text-center bg-theme-surface-muted border border-theme-border-strong rounded-[16px] py-3 shadow-sm">
              <p className="text-[20px] font-extrabold text-theme-text">{stats.total_solved}</p>
              <p className="text-[11px] font-bold text-theme-muted uppercase tracking-widest mt-0.5">Solved</p>
            </div>
            <div className="flex-1 text-center bg-theme-surface-muted border border-theme-border-strong rounded-[16px] py-3 shadow-sm">
              <p className="text-[20px] font-extrabold text-theme-text">{stats.total_problems}</p>
              <p className="text-[11px] font-bold text-theme-muted uppercase tracking-widest mt-0.5">Total</p>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="md:col-span-2 bg-theme-card border border-theme-border-strong rounded-[24px] p-8 shadow-softer">
          <div className="flex items-center gap-4 mb-8 text-theme-text">
            <div className="w-12 h-12 rounded-[16px] bg-theme-surface-muted flex items-center justify-center shadow-sm">
              <ArrowTrendingUpIcon className="w-6 h-6 text-theme-muted" />
            </div>
            <h3 className="text-[18px] font-bold">Difficulty Breakdown</h3>
          </div>
          
          <div className="space-y-6">
            {stats.by_difficulty.map(d => {
              const color = d.difficulty === "Easy" ? "bg-emerald-400" : d.difficulty === "Medium" ? "bg-yellow-400" : "bg-orange-400";
              const percentage = d.total > 0 ? (d.solved / d.total) * 100 : 0;
              return (
                <div key={d.difficulty} className="bg-theme-surface-muted border border-theme-border-strong rounded-[20px] p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[15px] font-bold text-theme-text">{d.difficulty}</span>
                    <span className="text-[13px] font-bold text-theme-text bg-theme-card border border-theme-border-strong px-4 py-1.5 rounded-full shadow-sm">{d.solved} / {d.total}</span>
                  </div>
                  <div className="w-full h-3 bg-theme-border rounded-full overflow-hidden shadow-inner">
                    <div 
                      className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Topic Breakdown Grid */}
      <div className="bg-theme-card border border-theme-border-strong rounded-[24px] overflow-hidden shadow-softer">
        <div className="px-8 py-6 border-b border-theme-border-strong bg-theme-surface-muted/50">
          <h3 className="text-[13px] font-bold text-theme-muted uppercase tracking-widest">Topic Mastery</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 gap-[1px] bg-theme-border">
          {stats.by_topic.map((t) => (
            <div key={t.topic} className="p-6 bg-theme-card hover:bg-theme-surface-hover transition-colors">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[14px] font-bold text-theme-text truncate pr-2">{t.topic}</span>
                <span className="text-[12px] font-bold text-theme-text bg-theme-surface-muted border border-theme-border-strong px-3 py-1 rounded-full shadow-sm shrink-0">
                  {t.total > 0 ? Math.round((t.solved / t.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-1.5 h-3">
                {Array.from({ length: Math.min(t.total, 15) }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-full flex-1 rounded-full ${i < (t.solved / t.total) * Math.min(t.total, 15) ? 'bg-brand-primary' : 'bg-theme-surface-muted'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
