
import { useMode } from '../contexts/ModeContext';
import { useCalendarStats, getLocalDateKey, getDayEmoji } from '../hooks/useCalendarStats';
import { getProgress, getCourseStats } from '../data/dsStore';
import { getSolvedIds } from '../services/storage';
import problemsData from '../data/problems.json';
import { TerminalSquare, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';

const CompactCalendar = () => {
  const { allActivityDates, streak, longestStreak } = useCalendarStats();
  const { activeMode } = useMode();
  
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const todayKey = getLocalDateKey(new Date());
  const currentRealMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const handlePrevMonth = () => {
    setCurrentViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentViewDate(prev => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      if (next.getTime() > currentRealMonth.getTime()) return prev;
      return next;
    });
  };

  const isNextDisabled = currentViewDate.getTime() >= currentRealMonth.getTime();

  const calendarDays = useMemo(() => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    let firstDayWeekday = firstDayOfMonth.getDay() - 1;
    if (firstDayWeekday === -1) firstDayWeekday = 6; // Mon=0..Sun=6
    
    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // Prev month padding
    for (let i = firstDayWeekday - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        dateKey: getLocalDateKey(d),
        isCurrentMonth: false,
        isFuture: getLocalDateKey(d) > todayKey,
        isToday: getLocalDateKey(d) === todayKey,
        dayNumber: d.getDate()
      });
    }
    
    // Current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const d = new Date(year, month, i);
      days.push({
        dateKey: getLocalDateKey(d),
        isCurrentMonth: true,
        isFuture: getLocalDateKey(d) > todayKey,
        isToday: getLocalDateKey(d) === todayKey,
        dayNumber: d.getDate()
      });
    }
    
    // Next month padding
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        const d = new Date(year, month + 1, i);
        days.push({
          dateKey: getLocalDateKey(d),
          isCurrentMonth: false,
          isFuture: getLocalDateKey(d) > todayKey,
          isToday: getLocalDateKey(d) === todayKey,
          dayNumber: d.getDate()
        });
      }
    }
    
    return days;
  }, [currentViewDate, todayKey]);

  const monthYearLabel = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-theme-card rounded-[24px] p-5 sm:p-6 shadow-softer border border-theme-border flex flex-col gap-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1">
        <div className="w-6 h-6 flex items-center justify-center text-theme-muted/50 cursor-pointer hover:text-theme-text transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevMonth}
            className="w-7 h-7 rounded-full bg-theme-bg flex items-center justify-center text-theme-text hover:bg-theme-surface-hover transition-colors border border-theme-border-strong"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="bg-theme-bg border border-theme-border-strong px-4 py-1.5 rounded-full text-[13px] font-bold text-theme-text">
            {monthYearLabel}
          </div>
          
          <button 
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors border border-theme-border-strong ${
              isNextDisabled 
                ? 'bg-transparent text-theme-muted/30 cursor-not-allowed border-transparent' 
                : 'bg-theme-bg text-theme-text hover:bg-theme-surface-hover'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="w-6 h-6"></div>
      </div>
      
      {/* 7-Column Grid Container */}
      <div className="w-full min-w-0 px-1">
        {/* Weekdays */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-theme-muted uppercase tracking-wider min-w-0 truncate">
              {day}
            </div>
          ))}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((d, idx) => {
            
            const emoji = (!d.isFuture && d.isCurrentMonth) ? getDayEmoji(d.dateKey, allActivityDates) : null;

            let cellClasses = "aspect-square w-full min-w-0 rounded-[8px] flex flex-col items-center justify-center transition-all relative overflow-hidden ";
            
            if (d.isFuture) {
              cellClasses += "opacity-30 cursor-default ";
            } else if (!d.isCurrentMonth) {
              cellClasses += "opacity-50 cursor-pointer hover:bg-theme-surface-hover ";
            } else {
              cellClasses += "bg-transparent cursor-pointer hover:bg-theme-surface-hover ";
            }

            if (d.isToday) {
              cellClasses += "ring-[1.5px] ring-brand-primary shadow-sm bg-theme-surface-hover ";
            }

            return (
              <div key={idx} className={cellClasses} title={d.dateKey}>
                {!d.isFuture ? (
                  <div className="flex flex-col items-center justify-center w-full h-full gap-[1px]">
                    {emoji ? (
                      emoji === '🔥' ? (
                        <div className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                          activeMode === 'interviewX' ? 'bg-pastel-pink text-pink-700' :
                          activeMode === 'data-science' ? 'bg-accent-lavender text-purple-700' :
                          'bg-pastel-mint text-emerald-700'
                        }`}>
                          <span className="text-[10px] leading-none select-none">🔥</span>
                        </div>
                      ) : (
                        <div className="w-[18px] h-[18px] rounded-full flex items-center justify-center bg-theme-surface-hover">
                          <span className="text-[10px] leading-none select-none">😭</span>
                        </div>
                      )
                    ) : (
                      <div className="w-[18px] h-[18px]"></div>
                    )}
                    <span className={`text-[10px] font-bold leading-none ${!d.isCurrentMonth ? 'text-theme-muted/70' : 'text-theme-text'}`}>
                      {d.dayNumber}
                    </span>
                  </div>
                ) : (
                   <div className="flex flex-col items-center justify-center w-full h-full gap-[1px]">
                     <span className="text-[10px] font-bold text-theme-muted/50 mt-[19px]">
                       {d.dayNumber}
                     </span>
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Compact Streak Bar */}
      <div className="pt-3 mt-1 border-t border-theme-border-strong flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">🔥</span>
          <span className="text-[12px] font-bold text-theme-muted uppercase tracking-wider">Current</span>
          <span className="text-[15px] font-black text-theme-text">{streak}</span>
        </div>
        <div className="w-px h-5 bg-theme-border-strong"></div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-theme-muted uppercase tracking-wider">Max</span>
          <span className="text-[15px] font-black text-theme-text">{longestStreak}</span>
        </div>
      </div>
    </div>
  );
};

export const DataScienceRightSidebar = () => {
  const progress = getProgress();
  const stats = getCourseStats(progress);

  const overallPercentage = stats.totalParts === 0 ? 0 : Math.round((stats.completedParts / stats.totalParts) * 100);


  return (
    <>
      <div className="bg-pastel-pink rounded-[28px] p-6 shadow-softer border border-theme-border flex flex-col gap-4">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4" /> Course Progress
        </h3>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-theme-text">{overallPercentage}%</div>
          <div className="text-sm font-semibold text-theme-text/70 pb-1">{stats.completedParts} / {stats.totalParts} parts</div>
        </div>
        <div className="h-2 w-full bg-theme-card/40 dark:bg-theme-border-strong rounded-full overflow-hidden mt-1">
          <div className="h-full bg-theme-text rounded-full" style={{ width: `${overallPercentage}%` }} />
        </div>
      </div>


      <CompactCalendar />
    </>
  );
};

export const DsaRightSidebar = () => {
  const solvedIds = getSolvedIds();
  const allProblems = problemsData as any[];
  const totalDSA = allProblems.length;
  const solvedDSA = solvedIds.size;
  const dsaPercentage = totalDSA === 0 ? 0 : Math.round((solvedDSA / totalDSA) * 100);

  const diffCounts = useMemo(() => {
    let easy = { total: 0, solved: 0 };
    let medium = { total: 0, solved: 0 };
    let hard = { total: 0, solved: 0 };

    allProblems.forEach(p => {
      const isSolved = solvedIds.has(p.id);
      if (p.difficulty === 'Easy') {
        easy.total++;
        if (isSolved) easy.solved++;
      } else if (p.difficulty === 'Medium') {
        medium.total++;
        if (isSolved) medium.solved++;
      } else {
        hard.total++;
        if (isSolved) hard.solved++;
      }
    });
    return { easy, medium, hard };
  }, [allProblems, solvedIds]);


  return (
    <>
      <div className="bg-pastel-lavender rounded-[28px] p-5 sm:p-6 shadow-softer border border-theme-border flex flex-col">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider flex items-center gap-2 mb-3 sm:mb-4">
          <TerminalSquare className="w-4 h-4" /> DSA Progress
        </h3>
        
        <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
          <div className="flex flex-col min-w-0 pr-2">
            <div className="text-[32px] sm:text-4xl font-black text-theme-text mb-1 truncate leading-none tracking-tight">
              {dsaPercentage}%
            </div>
            <div className="text-[13px] sm:text-[14px] font-semibold text-theme-text/70 truncate">
              {solvedDSA} / {totalDSA} solved
            </div>
          </div>
          
          <svg className="w-[60px] h-[60px] sm:w-[72px] sm:h-[72px] flex-shrink-0" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
             <circle className="text-theme-border-strong stroke-current" strokeWidth="8" cx="50" cy="50" r="42" fill="transparent"></circle>
             <circle className="text-theme-text stroke-current transition-all duration-500 ease-out" strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="42" fill="transparent" strokeDasharray={`${dsaPercentage * 2.6389} 263.89`}></circle>
          </svg>
        </div>
      </div>

      <div className="bg-theme-card rounded-[28px] p-6 shadow-softer border border-theme-border flex flex-col gap-4">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider">Difficulty</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-emerald-600">
              <span>Easy</span>
              <span>{diffCounts.easy.solved} / {diffCounts.easy.total}</span>
            </div>
            <div className="h-1.5 w-full bg-emerald-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(diffCounts.easy.solved/diffCounts.easy.total)*100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-yellow-600">
              <span>Medium</span>
              <span>{diffCounts.medium.solved} / {diffCounts.medium.total}</span>
            </div>
            <div className="h-1.5 w-full bg-yellow-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(diffCounts.medium.solved/diffCounts.medium.total)*100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-orange-600">
              <span>Hard</span>
              <span>{diffCounts.hard.solved} / {diffCounts.hard.total}</span>
            </div>
            <div className="h-1.5 w-full bg-orange-500/20 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(diffCounts.hard.solved/diffCounts.hard.total)*100}%` }} />
            </div>
          </div>
        </div>
      </div>



      <CompactCalendar />
    </>
  );
};

export const InterviewXRightSidebar = () => {
  const subjectsOrder = [
    { id: 'dsa', name: 'DSA', total: 418 },
    { id: 'os', name: 'OS', total: 54 },
    { id: 'cn', name: 'CN', total: 40 },
    { id: 'lld', name: 'LLD', total: 55 },
    { id: 'dbms', name: 'DBMS', total: 94 }
  ];

  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});

  const loadProgress = () => {
    const counts: Record<string, number> = {};
    subjectsOrder.forEach(sub => {
      try {
        const saved = localStorage.getItem(`interviewx_${sub.id}_completed`);
        const arr = saved ? JSON.parse(saved) : [];
        counts[sub.id] = arr.length;
      } catch {
        counts[sub.id] = 0;
      }
    });
    setCompletedCounts(counts);
  };

  useEffect(() => {
    loadProgress();
    window.addEventListener('storage', loadProgress);
    window.addEventListener('interviewx-update', loadProgress);
    return () => {
      window.removeEventListener('storage', loadProgress);
      window.removeEventListener('interviewx-update', loadProgress);
    };
  }, []);

  const totalCompleted = Object.values(completedCounts).reduce((a, b) => a + b, 0);
  const totalVideos = 661;
  const overallPercentage = Math.round((totalCompleted / totalVideos) * 100);


  return (
    <>
      <div className="bg-pastel-pink rounded-[28px] p-6 shadow-softer border border-theme-border flex flex-col gap-4">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4" /> InterviewX Progress
        </h3>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-theme-text">{overallPercentage}%</div>
          <div className="text-sm font-semibold text-theme-text/70 pb-1">{totalCompleted} / {totalVideos} videos</div>
        </div>
        
        <div className="space-y-3 mt-2">
          {subjectsOrder.map(sub => {
             const c = completedCounts[sub.id] || 0;
             const p = Math.round((c / sub.total) * 100);
             return (
               <div key={sub.id}>
                 <div className="flex justify-between text-[11px] font-bold mb-1.5 text-theme-text/70">
                   <span>{sub.name}</span>
                   <span>{c} / {sub.total}</span>
                 </div>
                 <div className="h-1.5 w-full bg-theme-card/50 rounded-full overflow-hidden">
                   <div className="h-full bg-theme-text rounded-full" style={{ width: `${p}%` }} />
                 </div>
               </div>
             );
          })}
        </div>
      </div>


      <CompactCalendar />
    </>
  );
};

export const RightSidebar = () => {
  const { activeMode } = useMode();

  return (
    <aside className="w-[300px] flex-shrink-0 hidden xl:flex flex-col gap-6 pt-6 pr-6 h-[calc(100vh)] overflow-y-auto custom-scrollbar pb-10">
      {activeMode === 'dsa' && <DsaRightSidebar />}
      {activeMode === 'data-science' && <DataScienceRightSidebar />}
      {activeMode === 'interviewX' && <InterviewXRightSidebar />}
    </aside>
  );
};
