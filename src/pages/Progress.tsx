import { getProgress, getCourseStats, getLecturesByStatus } from '../data/dsStore';
import { LectureCard } from '../components/LectureCard';
import { CheckCircle, Clock, BookOpen, Target } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';
import { getSolvedIds } from '../services/storage';
import problemsData from '../data/problems.json';
import { useMemo } from 'react';

const DataScienceProgress = () => {
  const progress = getProgress();
  const stats = getCourseStats(progress);
  const { completed, inProgress, notStarted } = getLecturesByStatus(progress);

  const overallPercentage = stats.totalParts === 0 
    ? 0 
    : Math.round((stats.completedParts / stats.totalParts) * 100);

  return (
    <div className="w-full pb-16">
      <header className="mb-10 pl-2">
        <h1 className="text-3xl font-bold text-theme-text mb-2">
          Data Science Progress
        </h1>
        <p className="text-theme-muted text-lg font-medium">Track your journey through the Data Science course.</p>
      </header>

      <div className="bg-theme-card border border-white/50 rounded-[32px] p-8 sm:p-10 shadow-softer mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-8">
           <div>
             <h2 className="text-[15px] font-bold text-theme-muted uppercase tracking-wider mb-2">Overall Course Progress</h2>
             <div className="text-5xl font-black text-theme-text tracking-tight">{overallPercentage}%</div>
           </div>
           
           <div className="flex gap-6">
              <div className="p-5 bg-pastel-mint/30 rounded-2xl border border-pastel-mint min-w-[120px]">
                 <div className="text-2xl font-black text-theme-text mb-1">{stats.completedParts} <span className="text-sm text-theme-muted">/ {stats.totalParts}</span></div>
                 <div className="text-[13px] font-bold text-theme-text uppercase tracking-wider">Parts</div>
              </div>
              <div className="p-5 bg-pastel-lavender/30 rounded-2xl border border-pastel-lavender min-w-[120px]">
                 <div className="text-2xl font-black text-theme-text mb-1">{stats.completedLectures} <span className="text-sm text-theme-muted">/ {stats.totalLectures}</span></div>
                 <div className="text-[13px] font-bold text-theme-text uppercase tracking-wider">Lectures</div>
              </div>
           </div>
        </div>
        
        <div className="h-4 w-full bg-theme-sidebar rounded-full overflow-hidden">
          <div 
            className="h-full bg-theme-text rounded-full transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-6 pl-2">
            <div className="w-8 h-8 bg-pastel-yellow rounded-xl flex items-center justify-center">
               <Clock className="w-4 h-4 text-theme-text" />
            </div>
            <h2 className="text-xl font-bold text-theme-text">In Progress ({inProgress.length})</h2>
          </div>
          {inProgress.length > 0 ? (
            <div className="space-y-4">
              {inProgress.map((lecture: any) => (
                <LectureCard key={lecture.id} lecture={lecture} progress={progress} />
              ))}
            </div>
          ) : (
             <p className="text-[15px] font-medium text-theme-muted bg-theme-card p-6 rounded-[20px] border border-white/50 shadow-softer">No lectures currently in progress.</p>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6 pl-2">
            <div className="w-8 h-8 bg-pastel-mint rounded-xl flex items-center justify-center">
               <CheckCircle className="w-4 h-4 text-theme-text" />
            </div>
            <h2 className="text-xl font-bold text-theme-text">Completed ({completed.length})</h2>
          </div>
          {completed.length > 0 ? (
            <div className="space-y-4">
              {completed.map((lecture: any) => (
                <LectureCard key={lecture.id} lecture={lecture} progress={progress} />
              ))}
            </div>
          ) : (
             <p className="text-[15px] font-medium text-theme-muted bg-theme-card p-6 rounded-[20px] border border-white/50 shadow-softer">No lectures completed yet.</p>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6 pl-2">
            <div className="w-8 h-8 bg-theme-sidebar border border-white/50 rounded-xl flex items-center justify-center">
               <BookOpen className="w-4 h-4 text-theme-text" />
            </div>
            <h2 className="text-xl font-bold text-theme-text">Not Started ({notStarted.length})</h2>
          </div>
          {notStarted.length > 0 ? (
            <div className="space-y-4">
              {notStarted.map((lecture: any) => (
                <LectureCard key={lecture.id} lecture={lecture} progress={progress} />
              ))}
            </div>
          ) : (
             <p className="text-[15px] font-medium text-theme-muted bg-theme-card p-6 rounded-[20px] border border-white/50 shadow-softer">All lectures started or completed!</p>
          )}
        </section>
      </div>
    </div>
  );
};

const DsaProgress = () => {
  const solvedIds = getSolvedIds();
  const allProblems = problemsData as any[];
  const totalDSA = allProblems.length;
  const solvedDSA = solvedIds.size;
  const remainingDSA = totalDSA - solvedDSA;
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
    <div className="w-full pb-16">
      <header className="mb-10 pl-2">
        <h1 className="text-3xl font-bold text-theme-text mb-2">
          DSA Progress
        </h1>
        <p className="text-theme-muted text-lg font-medium">Track your problem solving journey.</p>
      </header>

      <div className="bg-theme-card border border-white/50 rounded-[32px] p-8 sm:p-10 shadow-softer mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mb-8">
           <div>
             <h2 className="text-[15px] font-bold text-theme-muted uppercase tracking-wider mb-2">Overall Completion</h2>
             <div className="text-5xl font-black text-theme-text tracking-tight">{dsaPercentage}%</div>
           </div>
           
           <div className="flex gap-6">
              <div className="p-5 bg-pastel-lavender/30 rounded-2xl border border-pastel-lavender min-w-[120px]">
                 <div className="text-2xl font-black text-theme-text mb-1">{solvedDSA}</div>
                 <div className="text-[13px] font-bold text-theme-text uppercase tracking-wider">Solved</div>
              </div>
              <div className="p-5 bg-pastel-pink/30 rounded-2xl border border-pastel-pink min-w-[120px]">
                 <div className="text-2xl font-black text-theme-text mb-1">{remainingDSA}</div>
                 <div className="text-[13px] font-bold text-theme-text uppercase tracking-wider">Remaining</div>
              </div>
           </div>
        </div>
        
        <div className="h-4 w-full bg-theme-sidebar rounded-full overflow-hidden">
          <div 
            className="h-full bg-theme-text rounded-full transition-all duration-500"
            style={{ width: `${dsaPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-theme-card p-8 rounded-[28px] border border-white/50 shadow-softer">
          <h3 className="text-[14px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Easy
          </h3>
          <div className="text-3xl font-black text-theme-text mb-4">{diffCounts.easy.solved} <span className="text-lg text-theme-muted">/ {diffCounts.easy.total}</span></div>
          <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${diffCounts.easy.total === 0 ? 0 : (diffCounts.easy.solved/diffCounts.easy.total)*100}%` }} />
          </div>
        </div>

        <div className="bg-theme-card p-8 rounded-[28px] border border-white/50 shadow-softer">
          <h3 className="text-[14px] font-bold text-yellow-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Medium
          </h3>
          <div className="text-3xl font-black text-theme-text mb-4">{diffCounts.medium.solved} <span className="text-lg text-theme-muted">/ {diffCounts.medium.total}</span></div>
          <div className="h-2 w-full bg-yellow-100 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${diffCounts.medium.total === 0 ? 0 : (diffCounts.medium.solved/diffCounts.medium.total)*100}%` }} />
          </div>
        </div>

        <div className="bg-theme-card p-8 rounded-[28px] border border-white/50 shadow-softer">
          <h3 className="text-[14px] font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Hard
          </h3>
          <div className="text-3xl font-black text-theme-text mb-4">{diffCounts.hard.solved} <span className="text-lg text-theme-muted">/ {diffCounts.hard.total}</span></div>
          <div className="h-2 w-full bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${diffCounts.hard.total === 0 ? 0 : (diffCounts.hard.solved/diffCounts.hard.total)*100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Progress = () => {
  const { activeMode } = useMode();
  return activeMode === 'dsa' ? <DsaProgress /> : <DataScienceProgress />;
};
