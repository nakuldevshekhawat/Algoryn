import { Link } from 'react-router-dom';
import { useMode } from '../contexts/ModeContext';
import { useCalendarStats } from '../hooks/useCalendarStats';
import { getProgress, getCourseStats, courseData, getNextDataSciencePart } from '../data/dsStore';
import { getSolvedIds, getNextDSAProblem } from '../services/storage';
import problemsData from '../data/problems.json';
import { Flame, TerminalSquare, Play, Target } from 'lucide-react';
import { useMemo } from 'react';

const CompactCalendar = () => {
  const { allActivityDates, streak } = useCalendarStats();
  
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 27; i >= 0; i--) { // Last 4 weeks
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const active = allActivityDates.includes(dateStr);
      days.push({ date: dateStr, active });
    }
    return days;
  }, [allActivityDates]);

  return (
    <div className="bg-white rounded-[24px] p-5 shadow-softer border border-white/50 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-bold text-theme-muted uppercase tracking-wider">Learning Calendar</h3>
        <div className="flex items-center gap-1.5 text-orange-500 bg-orange-50 px-2 py-1 rounded-[8px]">
          <Flame className="w-3.5 h-3.5" />
          <span className="text-xs font-bold">{streak}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {heatmapDays.map((d, idx) => (
          <div 
            key={idx} 
            className={`w-full aspect-square rounded-[4px] ${d.active ? 'bg-pastel-lavender-dark' : 'bg-theme-sidebar'}`}
            title={d.date}
          />
        ))}
      </div>
    </div>
  );
};

export const DataScienceRightSidebar = () => {
  const progress = getProgress();
  const stats = getCourseStats(progress);

  const overallPercentage = stats.totalParts === 0 ? 0 : Math.round((stats.completedParts / stats.totalParts) * 100);

  const continueTarget = getNextDataSciencePart(progress);

  const continueLecture = continueTarget ? courseData.lectures.find(l => l.id === continueTarget.lectureId) : null;

  return (
    <>
      <div className="bg-pastel-pink rounded-[28px] p-6 shadow-softer border border-white/50 flex flex-col gap-4">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4" /> Course Progress
        </h3>
        <div className="flex items-end justify-between">
          <div className="text-3xl font-bold text-theme-text">{overallPercentage}%</div>
          <div className="text-sm font-semibold text-theme-text/70 pb-1">{stats.completedParts} / {stats.totalParts} parts</div>
        </div>
        <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-theme-text rounded-full" style={{ width: `${overallPercentage}%` }} />
        </div>
      </div>

      <div className="bg-pastel-yellow rounded-[28px] p-6 shadow-softer border border-white/50 flex flex-col gap-4">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider flex items-center gap-2">
          <Play className="w-4 h-4" /> Continue Learning
        </h3>
        {continueLecture ? (
          <div>
            <h4 className="font-bold text-theme-text text-[15px] leading-snug line-clamp-2 mb-1">{continueLecture.title}</h4>
            <p className="text-[12px] font-semibold text-theme-text/70 mb-4">Part {continueTarget?.part}</p>
            <Link to={`/data-science/lectures/${continueLecture.id}`} className="w-full py-2.5 bg-theme-text text-white rounded-[14px] text-[13px] font-bold flex justify-center hover:opacity-90 transition-opacity">
              Continue &rarr;
            </Link>
          </div>
        ) : (
          <p className="text-[14px] font-semibold text-theme-text">All caught up!</p>
        )}
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

  const continueDsaProblem = getNextDSAProblem();

  return (
    <>
      <div className="bg-pastel-lavender rounded-[28px] p-6 shadow-softer border border-white/50 flex flex-col gap-4 relative overflow-hidden">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider flex items-center gap-2">
          <TerminalSquare className="w-4 h-4" /> DSA Progress
        </h3>
        <div className="flex justify-between items-center z-10">
          <div>
            <div className="text-3xl font-bold text-theme-text mb-1">{dsaPercentage}%</div>
            <div className="text-xs font-semibold text-theme-text/70">{solvedDSA} / {totalDSA} solved</div>
          </div>
          
          <svg className="w-16 h-16 flex-shrink-0 min-w-[64px] transform -rotate-90" viewBox="0 0 100 100">
             <circle className="text-white stroke-current" strokeWidth="6" cx="50" cy="50" r="42" fill="transparent"></circle>
             <circle className="text-theme-text stroke-current transition-all duration-500 ease-out" strokeWidth="6" strokeLinecap="round" cx="50" cy="50" r="42" fill="transparent" strokeDasharray={`${dsaPercentage * 2.6389} 263.89`}></circle>
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-[28px] p-6 shadow-softer border border-white/50 flex flex-col gap-4">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider">Difficulty</h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-emerald-600">
              <span>Easy</span>
              <span>{diffCounts.easy.solved} / {diffCounts.easy.total}</span>
            </div>
            <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(diffCounts.easy.solved/diffCounts.easy.total)*100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-yellow-600">
              <span>Medium</span>
              <span>{diffCounts.medium.solved} / {diffCounts.medium.total}</span>
            </div>
            <div className="h-1.5 w-full bg-yellow-100 rounded-full overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${(diffCounts.medium.solved/diffCounts.medium.total)*100}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-[11px] font-bold mb-1.5 text-orange-600">
              <span>Hard</span>
              <span>{diffCounts.hard.solved} / {diffCounts.hard.total}</span>
            </div>
            <div className="h-1.5 w-full bg-orange-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(diffCounts.hard.solved/diffCounts.hard.total)*100}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-pastel-mint rounded-[28px] p-6 shadow-softer border border-white/50 flex flex-col gap-4">
        <h3 className="text-[13px] font-bold text-theme-text/80 uppercase tracking-wider flex items-center gap-2">
          <Play className="w-4 h-4" /> Continue Practice
        </h3>
        {continueDsaProblem ? (
          <div>
            <h4 className="font-bold text-theme-text text-[15px] leading-snug line-clamp-2 mb-1">{continueDsaProblem.name}</h4>
            <p className="text-[12px] font-semibold text-theme-text/70 mb-4">Next Problem</p>
            <Link to={`/dsa/problems/${continueDsaProblem.id}`} className="w-full py-2.5 bg-theme-text text-white rounded-[14px] text-[13px] font-bold flex justify-center hover:opacity-90 transition-opacity">
              Start Problem &rarr;
            </Link>
          </div>
        ) : (
          <p className="text-[14px] font-semibold text-theme-text">All solved!</p>
        )}
      </div>

      <CompactCalendar />
    </>
  );
};

export const RightSidebar = () => {
  const { activeMode } = useMode();

  return (
    <aside className="w-[300px] flex-shrink-0 hidden xl:flex flex-col gap-6 pt-6 pr-6 h-[calc(100vh)] overflow-y-auto custom-scrollbar pb-10">
      {activeMode === 'dsa' ? <DsaRightSidebar /> : <DataScienceRightSidebar />}
    </aside>
  );
};
