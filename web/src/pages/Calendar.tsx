import { useMemo, useState } from 'react';
import { getRecentActivity as getDSActivity } from '../data/dsStore';
import { getRecentProblems } from '../services/storage';
import { useCalendarStats, getLocalDateKey } from '../hooks/useCalendarStats';
import { Flame, Trophy, Activity, TerminalSquare, Clock } from 'lucide-react';
import problemsData from '../data/problems.json';

export const Calendar = () => {
  const { allActivityDates, streak, longestStreak } = useCalendarStats();
  
  const dsActivity = getDSActivity();
  const dsaActivity = getRecentProblems();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Generate Jan 1 to TODAY
  const heatmapDays = useMemo(() => {
    const days = [];
    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(); // TODAY

    let currentColumn = 0; // Starts from 0
    let isFirstDay = true;

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const row = (d.getDay() + 6) % 7; // Mon=0, Tue=1 ... Sun=6
      
      // Increment column on Mondays (but not on the very first loop iteration)
      if (row === 0 && !isFirstDay) {
         currentColumn++;
      }
      isFirstDay = false;

      const dateStr = getLocalDateKey(d);
      const month = d.toLocaleString('default', { month: 'short' });

      days.push({
        date: dateStr,
        active: allActivityDates.includes(dateStr),
        month: month,
        row: row,
        column: currentColumn,
        isFirstOfMonth: d.getDate() === 1
      });
    }
    return days;
  }, [allActivityDates]);

  const monthLabels = useMemo(() => {
    const labels = [];
    for (const day of heatmapDays) {
      if (day.isFirstOfMonth) {
        labels.push({ month: day.month, column: day.column });
      }
    }
    return labels;
  }, [heatmapDays]);

  const totalColumns = useMemo(() => {
    if (heatmapDays.length === 0) return 1;
    return heatmapDays[heatmapDays.length - 1].column + 1;
  }, [heatmapDays]);


  // Aggregate selected date activity
  const selectedDateActivity = useMemo(() => {
    if (!selectedDate) return null;

    const dsActs = dsActivity.filter(a => {
      return getLocalDateKey(a.timestamp) === selectedDate;
    });

    const dsaActs = dsaActivity.filter(a => {
      return getLocalDateKey(a.timestamp) === selectedDate;
    });

    return { dsActs, dsaActs };
  }, [selectedDate, dsActivity, dsaActivity]);

  return (
    <div className="w-full pb-16 animate-fade-in">
      <header className="mb-10 pt-4 pl-2">
        <h1 className="text-3xl font-bold text-theme-text mb-2">Activity Calendar</h1>
        <p className="text-theme-muted text-lg font-medium">Track your learning consistency across all subjects.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-theme-card rounded-[24px] p-6 border border-white/50 shadow-softer flex items-center gap-5">
          <div className="w-14 h-14 rounded-[16px] bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Flame className="w-7 h-7 text-orange-500" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-theme-muted uppercase tracking-wider mb-1">Current Streak</h3>
            <div className="text-3xl font-black text-theme-text">{streak} <span className="text-lg text-theme-muted font-bold">days</span></div>
          </div>
        </div>

        <div className="bg-theme-card rounded-[24px] p-6 border border-white/50 shadow-softer flex items-center gap-5">
          <div className="w-14 h-14 rounded-[16px] bg-pastel-mint flex items-center justify-center flex-shrink-0">
            <Trophy className="w-7 h-7 text-theme-text" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-theme-muted uppercase tracking-wider mb-1">Longest Streak</h3>
            <div className="text-3xl font-black text-theme-text">{longestStreak} <span className="text-lg text-theme-muted font-bold">days</span></div>
          </div>
        </div>

        <div className="bg-theme-card rounded-[24px] p-6 border border-white/50 shadow-softer flex items-center gap-5">
          <div className="w-14 h-14 rounded-[16px] bg-pastel-lavender flex items-center justify-center flex-shrink-0">
            <Activity className="w-7 h-7 text-theme-text" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-theme-muted uppercase tracking-wider mb-1">Active Days</h3>
            <div className="text-3xl font-black text-theme-text">{allActivityDates.length} <span className="text-lg text-theme-muted font-bold">days</span></div>
          </div>
        </div>
      </div>

      <div className="bg-theme-card rounded-[28px] p-8 border border-white/50 shadow-softer mb-10 w-full overflow-hidden">
        <h2 className="text-xl font-bold text-theme-text mb-8">Learning Heatmap</h2>
        
        <div 
          className="grid w-full"
          style={{
             gridTemplateColumns: `36px repeat(${totalColumns}, minmax(0, 16px))`,
             gap: 'clamp(2px, 0.5vw, 4px)'
          }}
        >
          {/* Month Labels */}
          {monthLabels.map((lbl, i) => (
            <div 
              key={i} 
              style={{ gridRow: 1, gridColumn: lbl.column + 2, position: 'relative' }}
              className="h-[20px]"
            >
              <span className="absolute bottom-1 left-0 text-[12px] font-bold text-theme-muted whitespace-nowrap">
                {lbl.month}
              </span>
            </div>
          ))}
          
          {/* Day Labels */}
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => (
            <div 
              key={day}
              className="text-[11px] font-bold text-theme-muted flex items-center justify-end pr-2 w-full h-full leading-none"
              style={{ gridRow: idx + 2, gridColumn: 1 }}
            >
              {day}
            </div>
          ))}

          {/* Heatmap Cells */}
          {heatmapDays.map((d, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDate(d.date)}
              className={`aspect-square w-full rounded-[3px] transition-all hover:scale-110 hover:ring-2 ring-theme-text/20 ${
                d.active ? 'bg-pastel-lavender-dark' : 'bg-theme-sidebar'
              } ${selectedDate === d.date ? 'ring-2 ring-theme-text' : ''}`}
              style={{ gridRow: d.row + 2, gridColumn: d.column + 2 }}
              title={`${d.date}`}
            />
          ))}
        </div>
      </div>

      {selectedDate && selectedDateActivity && (
        <div className="animate-fade-in bg-theme-card rounded-[28px] p-8 border border-white/50 shadow-softer">
          <h2 className="text-xl font-bold text-theme-text mb-6">Activity on {selectedDate}</h2>
          
          {selectedDateActivity.dsActs.length === 0 && selectedDateActivity.dsaActs.length === 0 ? (
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
                        <div key={i} className="bg-theme-sidebar p-4 rounded-[16px] border border-white shadow-sm flex items-start gap-3">
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
                        <div key={i} className="bg-theme-sidebar p-4 rounded-[16px] border border-white shadow-sm flex items-start gap-3">
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
            </div>
          )}
        </div>
      )}

    </div>
  );
};
