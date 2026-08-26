import { useMemo, useState } from 'react';
import { useCalendarStats, getLocalDateKey, getDayEmoji } from '../hooks/useCalendarStats';
import { TerminalSquare, Clock, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import problemsData from '../data/problems.json';
import { useMode } from '../contexts/ModeContext';

export const Calendar = () => {
  const { activeMode } = useMode();
  const { allActivityDates, streak, longestStreak, ixActivityMap, dsActivity, dsaActivity } = useCalendarStats();
  
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Initialize to Jan 1 of current year
  const [currentViewDate, setCurrentViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1);
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
        dateObj: d,
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
        dateObj: d,
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
          dateObj: d,
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

  // Aggregate selected date activity
  const selectedDateActivity = useMemo(() => {
    if (!selectedDate) return null;

    const dsActs = dsActivity.filter(a => {
      return getLocalDateKey(a.timestamp) === selectedDate;
    });

    const dsaActs = activeMode === 'dsa' || activeMode === 'data-science' ? dsaActivity.filter(a => {
      return getLocalDateKey(a.timestamp) === selectedDate;
    }) : [];

    const ixCount = activeMode === 'interviewX' ? (ixActivityMap[selectedDate] || 0) : 0;

    return { dsActs, dsaActs, ixCount };
  }, [selectedDate, dsActivity, dsaActivity, ixActivityMap, activeMode]);

  const monthYearLabel = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full pb-16 animate-fade-in max-w-[1000px] mx-auto">
      <header className="mb-10 pt-4 pl-2">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Learning Calendar</h1>
        <p className="text-theme-muted text-lg font-medium">Track your consistency.</p>
      </header>

      {/* Main Calendar Card */}
      <div className="bg-theme-card rounded-[28px] p-4 sm:p-8 border border-theme-border shadow-softer mb-6 w-full overflow-hidden">
        
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={handlePrevMonth}
            className="w-10 h-10 rounded-full bg-theme-card shadow-sm flex items-center justify-center text-theme-text hover:bg-theme-surface-hover transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl sm:text-2xl font-bold text-theme-text min-w-[150px] text-center">
            {monthYearLabel}
          </h2>
          
          <button 
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
              isNextDisabled 
                ? 'bg-transparent text-theme-muted/30 cursor-not-allowed' 
                : 'bg-theme-card shadow-sm text-theme-text hover:bg-theme-surface-hover'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Column Grid Container */}
        <div className="w-full min-w-0">
          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <div key={day} className="text-center text-[11px] sm:text-[13px] font-bold text-theme-muted uppercase tracking-wider min-w-0 truncate">
                {day}
              </div>
            ))}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-7 gap-2 sm:gap-4">
            {calendarDays.map((d, idx) => {
              
              const emoji = (!d.isFuture && d.isCurrentMonth) ? getDayEmoji(d.dateKey, allActivityDates) : null;

              let cellClasses = "aspect-square w-full min-w-0 rounded-[12px] sm:rounded-[16px] flex flex-col items-center justify-start pt-2 sm:pt-3 pb-1 transition-all relative overflow-hidden ";
              let textClasses = "text-[13px] sm:text-[15px] font-bold z-10 ";
              
              if (d.isFuture) {
                cellClasses += "opacity-40 cursor-not-allowed ";
                textClasses += "text-theme-muted/50 ";
              } else if (!d.isCurrentMonth) {
                cellClasses += "opacity-50 cursor-pointer hover:bg-theme-surface-hover ";
                textClasses += "text-theme-muted ";
              } else {
                cellClasses += "bg-transparent cursor-pointer hover:bg-theme-surface-hover ";
                textClasses += "text-theme-text ";
              }

              if (d.isToday) {
                cellClasses += "ring-2 ring-theme-text shadow-sm bg-theme-card/50 ";
              }

              if (d.dateKey === selectedDate) {
                cellClasses += "ring-2 ring-theme-text bg-theme-card ";
              }

              return (
                <button
                  key={idx}
                  onClick={() => !d.isFuture && setSelectedDate(d.dateKey)}
                  disabled={d.isFuture}
                  className={cellClasses}
                >
                  <span className={textClasses}>{d.dayNumber}</span>
                  
                  {emoji && (
                    <div className="mt-auto mb-1 sm:mb-2 flex items-center justify-center">
                      {emoji === '🔥' ? (
                        <div className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${
                          activeMode === 'interviewX' ? 'bg-pastel-pink text-pink-700' :
                          activeMode === 'data-science' ? 'bg-accent-lavender text-purple-700' :
                          'bg-pastel-mint text-emerald-700'
                        }`}>
                          <span className="text-[10px] sm:text-[14px]">🔥</span>
                        </div>
                      ) : (
                        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center bg-theme-surface-hover">
                          <span className="text-[10px] sm:text-[14px]">😭</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Compact Streak Bar */}
      <div className="bg-theme-card rounded-[20px] p-5 border border-theme-border shadow-softer flex items-center justify-center gap-8 sm:gap-16 mb-10 mx-auto max-w-fit px-8 sm:px-12">
        <div className="flex items-center gap-3">
          <span className="text-[16px]">🔥</span>
          <span className="text-[14px] font-bold text-theme-muted uppercase tracking-wider">Current</span>
          <span className="text-xl font-black text-theme-text">{streak}</span>
        </div>
        <div className="w-px h-8 bg-theme-border-strong"></div>
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-bold text-theme-muted uppercase tracking-wider">Max</span>
          <span className="text-xl font-black text-theme-text">{longestStreak}</span>
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && selectedDateActivity && (
        <div className="animate-fade-in bg-theme-card rounded-[28px] p-6 sm:p-8 border border-theme-border shadow-softer">
          <h2 className="text-xl font-bold text-theme-text mb-6">
            Activity on {new Date(selectedDate).toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric'})}
          </h2>
          
          {selectedDateActivity.dsActs.length === 0 && selectedDateActivity.dsaActs.length === 0 && selectedDateActivity.ixCount === 0 ? (
            <p className="text-theme-muted font-medium">No activity recorded for this date.</p>
          ) : (
            <div className="space-y-6">
              {selectedDateActivity.dsaActs.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-theme-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TerminalSquare className="w-4 h-4" /> DSA ({selectedDateActivity.dsaActs.length} activities)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedDateActivity.dsaActs.map((act: any, i: number) => {
                      const problem = problemsData.find((p: any) => p.id === act.id);
                      return (
                        <div key={i} className="bg-theme-sidebar p-4 rounded-[16px] border border-theme-border shadow-sm flex items-start gap-3">
                           <div className="w-8 h-8 rounded-lg bg-pastel-mint flex items-center justify-center flex-shrink-0">
                             <TerminalSquare className="w-4 h-4 text-theme-text" />
                           </div>
                           <div>
                             <p className="font-bold text-theme-text text-[14px] leading-snug">{problem?.name || act.id}</p>
                             <p className="text-[12px] font-semibold text-theme-muted mt-0.5">Problem Practiced</p>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedDateActivity.dsActs.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-theme-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Data Science ({selectedDateActivity.dsActs.length} activities)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedDateActivity.dsActs.map((act: any, i: number) => (
                        <div key={i} className="bg-theme-sidebar p-4 rounded-[16px] border border-theme-border shadow-sm flex items-start gap-3">
                           <div className="w-8 h-8 rounded-lg bg-pastel-lavender flex items-center justify-center flex-shrink-0">
                             <Clock className="w-4 h-4 text-theme-text" />
                           </div>
                           <div>
                             <p className="font-bold text-theme-text text-[14px] leading-snug">Lecture Part {act.part}</p>
                             <p className="text-[12px] font-semibold text-theme-muted mt-0.5">Part Completed</p>
                           </div>
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDateActivity.ixCount > 0 && activeMode === 'interviewX' && (
                <div>
                  <h3 className="text-sm font-bold text-theme-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Video className="w-4 h-4" /> InterviewX ({selectedDateActivity.ixCount} activities)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     <div className="bg-theme-sidebar p-4 rounded-[16px] border border-theme-border shadow-sm flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pastel-pink flex items-center justify-center flex-shrink-0">
                          <Video className="w-4 h-4 text-theme-text" />
                        </div>
                        <div>
                          <p className="font-bold text-theme-text text-[14px] leading-snug">Studied {selectedDateActivity.ixCount} InterviewX Videos</p>
                          <p className="text-[12px] font-semibold text-theme-muted mt-0.5">Video Activity</p>
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
