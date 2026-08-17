import { Link } from 'react-router-dom';
import { courseData, getProgress, getCourseStats, getRecentActivity, resetDataScienceProgress, getNextDataSciencePart } from '../data/dsStore';
import { Search, Play, Clock, BarChart2, ListVideo, TerminalSquare, RotateCcw } from 'lucide-react';
import { getSolvedIds, getRecentProblems, getNextDSAProblem, resetProgress } from '../services/storage';
import problemsData from '../data/problems.json';
import { useMode } from '../contexts/ModeContext';
import { DsaRightSidebar, DataScienceRightSidebar } from '../layout/RightSidebar';

const DataScienceDashboard = () => {
  const progress = getProgress();
  const stats = getCourseStats(progress);
  const recentDS = getRecentActivity();

  const overallPercentage = stats.totalParts === 0 
    ? 0 
    : Math.round((stats.completedParts / stats.totalParts) * 100);

  const continueTarget = getNextDataSciencePart(progress);

  const continueLecture = continueTarget ? courseData.lectures.find(l => l.id === continueTarget.lectureId) : null;


  return (
    <div className="w-full pb-16">
      <header className="mb-10 pt-4 pl-2">
        <h1 className="text-[34px] font-bold text-theme-text flex items-center gap-3 leading-tight tracking-tight">
          Invest in your <br/> Data Science education
        </h1>
        <p className="text-theme-muted mt-3 text-[17px] font-medium">Hello, Learner! 👋 Let's continue your journey.</p>
      </header>

      <div className="flex flex-wrap items-center gap-4 mb-10 pl-2">
         <Link to="/data-science/lectures" className="bg-pastel-mint-dark/40 hover:bg-pastel-mint-dark/60 text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <ListVideo className="w-4 h-4" /> Browse Lectures
         </Link>
         <Link to="/search" className="bg-pastel-lavender hover:bg-pastel-lavender-dark text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <Search className="w-4 h-4" /> Search
         </Link>
         <Link to="/progress" className="bg-pastel-peach hover:bg-pastel-peach-dark text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <BarChart2 className="w-4 h-4" /> Progress
         </Link>
         <button 
           onClick={() => {
             if (window.confirm('Are you sure you want to reset all your Data Science progress? This cannot be undone.')) {
               resetDataScienceProgress();
               window.location.reload();
             }
           }}
           className="flex items-center gap-2 px-5 py-2.5 text-[14px] font-bold text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors ml-auto"
         >
           <RotateCcw className="w-4 h-4 stroke-[2.5]" />
           <span>Reset</span>
         </button>
      </div>

      <h2 className="text-sm font-bold text-theme-muted mb-4 pl-2">Course overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        <div className="bg-pastel-pink border border-white/50 rounded-[28px] p-8 flex flex-col justify-between shadow-softer relative overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <BarChart2 className="w-4 h-4 text-theme-text" />
                <span className="text-xs font-bold text-theme-text">Progress</span>
             </div>
             <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                {overallPercentage}%
             </div>
          </div>
          <div className="z-10 relative mt-4">
            <h3 className="text-2xl font-bold text-theme-text mb-2 tracking-tight leading-snug">Data Science Journey</h3>
            <p className="text-[14px] font-semibold text-theme-text/70">{stats.completedParts} / {stats.totalParts} parts completed</p>
          </div>
        </div>

        <div className="bg-pastel-yellow border border-white/50 rounded-[28px] p-8 flex flex-col justify-between shadow-softer relative overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Play className="w-4 h-4 text-theme-text" />
                <span className="text-xs font-bold text-theme-text">Continue</span>
             </div>
             <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                Up next
             </div>
          </div>
          <div className="z-10 relative mt-4">
            {continueLecture ? (
               <>
                 <h3 className="text-xl font-bold text-theme-text mb-2 tracking-tight leading-snug line-clamp-2">{continueLecture.title}</h3>
                 <Link to={`/data-science/lectures/${continueLecture.id}`} className="text-[14px] font-bold text-theme-text hover:opacity-70 transition-opacity">Part {continueTarget?.part} &rarr;</Link>
               </>
            ) : (
               <h3 className="text-2xl font-bold text-theme-text mb-2 tracking-tight leading-snug">All caught up!</h3>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-sm font-bold text-theme-muted mb-4 pl-2 mt-12">Recently Opened</h2>
      {recentDS.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentDS.slice(0, 6).map((activity: any, idx: number) => {
            const lec = courseData.lectures.find((l: any) => l.id === activity.lectureId);
            if (!lec) return null;
            return (
              <Link 
                key={`ds-${activity.lectureId}-${activity.part}-${idx}`}
                to={`/data-science/lectures/${activity.lectureId}`}
                className="flex flex-col justify-between p-6 bg-theme-card rounded-[28px] shadow-softer hover:shadow-soft hover:-translate-y-1 transition-all group border border-white/60"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-pastel-lavender rounded-[12px] flex items-center justify-center text-theme-text group-hover:bg-pastel-lavender-dark transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-theme-text bg-theme-bg px-3 py-1.5 rounded-full">Recent</span>
                </div>
                <div>
                  <h3 className="font-bold text-theme-text text-lg leading-snug mb-1 line-clamp-2">{lec.title}</h3>
                  <p className="text-[13px] font-semibold text-theme-muted">Part {activity.part}</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-theme-sidebar border border-white rounded-[28px] shadow-softer">
           <p className="font-bold text-theme-text text-lg">No recent activity</p>
           <p className="text-[14px] font-medium text-theme-muted mt-2">Start a lecture and it will appear here.</p>
        </div>
      )}
    </div>
  );
};

const DsaDashboard = () => {
  const recentDSA = getRecentProblems();
  const solvedIds = getSolvedIds();
  const solvedDSA = solvedIds.size;
  const totalDSA = (problemsData as any[]).length;
  const dsaPercentage = totalDSA === 0 ? 0 : Math.round((solvedDSA / totalDSA) * 100);

  const continueDsaProblem = getNextDSAProblem();
  return (
    <div className="w-full pb-16">
      <header className="mb-10 pt-4 pl-2">
        <h1 className="text-[34px] font-bold text-theme-text flex items-center gap-3 leading-tight tracking-tight">
          Level up your <br/> coding skills
        </h1>
        <p className="text-theme-muted mt-3 text-[17px] font-medium">Hello, Coder! 👋 Ready to practice?</p>
      </header>

      <div className="flex flex-wrap items-center gap-4 mb-10 pl-2">
         <Link to="/dsa/roadmap" className="bg-pastel-mint-dark/40 hover:bg-pastel-mint-dark/60 text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <TerminalSquare className="w-4 h-4" /> View Roadmap
         </Link>
         <Link to="/search" className="bg-pastel-lavender hover:bg-pastel-lavender-dark text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <Search className="w-4 h-4" /> Search
         </Link>
         <Link to="/progress" className="bg-pastel-peach hover:bg-pastel-peach-dark text-theme-text px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
           <BarChart2 className="w-4 h-4" /> Progress
         </Link>
         <button 
           onClick={() => {
             if (window.confirm('Are you sure you want to reset all your DSA progress? This cannot be undone.')) {
               resetProgress();
               window.location.reload();
             }
           }}
           className="flex items-center gap-2 px-5 py-2.5 text-[14px] font-bold text-orange-600 bg-orange-50 rounded-full hover:bg-orange-100 transition-colors ml-auto"
         >
           <RotateCcw className="w-4 h-4 stroke-[2.5]" />
           <span>Reset</span>
         </button>
      </div>

      <h2 className="text-sm font-bold text-theme-muted mb-4 pl-2">Course overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10">
        <div className="bg-pastel-lavender border border-white/50 rounded-[28px] p-8 flex flex-col justify-between shadow-softer relative overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <TerminalSquare className="w-4 h-4 text-theme-text" />
                <span className="text-xs font-bold text-theme-text">Progress</span>
             </div>
             <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                {dsaPercentage}%
             </div>
          </div>
          <div className="z-10 relative mt-4">
            <h3 className="text-2xl font-bold text-theme-text mb-2 tracking-tight leading-snug">DSA Preparation</h3>
            <p className="text-[14px] font-semibold text-theme-text/70">{solvedDSA} / {totalDSA} problems solved</p>
          </div>
        </div>

        <div className="bg-pastel-mint border border-white/50 rounded-[28px] p-8 flex flex-col justify-between shadow-softer relative overflow-hidden min-h-[200px]">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Play className="w-4 h-4 text-theme-text" />
                <span className="text-xs font-bold text-theme-text">Continue</span>
             </div>
             <div className="bg-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                Up next
             </div>
          </div>
          <div className="z-10 relative mt-4">
            {continueDsaProblem ? (
               <>
                 <h3 className="text-xl font-bold text-theme-text mb-2 tracking-tight leading-snug line-clamp-2">{continueDsaProblem.name}</h3>
                 <Link to={`/dsa/problems/${continueDsaProblem.id}`} className="text-[14px] font-bold text-theme-text hover:opacity-70 transition-opacity">Solve Problem &rarr;</Link>
               </>
            ) : (
               <h3 className="text-2xl font-bold text-theme-text mb-2 tracking-tight leading-snug">All solved! 🎉</h3>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-sm font-bold text-theme-muted mb-4 pl-2 mt-12">Recently Opened</h2>
      {recentDSA.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentDSA.slice(0, 6).map((activity: any, idx: number) => {
            const problem = problemsData.find((p: any) => p.id === activity.id);
            if (!problem) return null;
            return (
              <Link 
                key={`dsa-${activity.id}-${idx}`}
                to={`/dsa/problems/${activity.id}`}
                className="flex flex-col justify-between p-6 bg-theme-card rounded-[28px] shadow-softer hover:shadow-soft hover:-translate-y-1 transition-all group border border-white/60"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-pastel-mint rounded-[12px] flex items-center justify-center text-theme-text group-hover:bg-pastel-mint-dark transition-colors">
                    <TerminalSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-theme-text bg-theme-bg px-3 py-1.5 rounded-full">Recent</span>
                </div>
                <div>
                  <h3 className="font-bold text-theme-text text-lg leading-snug mb-1 line-clamp-2">{problem.name}</h3>
                  <p className="text-[13px] font-semibold text-theme-muted">DSA Problem</p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-theme-sidebar border border-white rounded-[28px] shadow-softer">
           <p className="font-bold text-theme-text text-lg">No recent activity</p>
           <p className="text-[14px] font-medium text-theme-muted mt-2">Start practicing and your recent problems will appear here.</p>
        </div>
      )}
    </div>
  );
};


export const Home = () => {
  const { activeMode } = useMode();
  return (
    <div className="flex flex-col">
      {activeMode === 'dsa' ? <DsaDashboard /> : <DataScienceDashboard />}
      <div className="xl:hidden flex flex-col gap-6 mt-8">
        <h2 className="text-sm font-bold text-theme-muted mb-[-8px] pl-2">Your Activity</h2>
        {activeMode === 'dsa' ? <DsaRightSidebar /> : <DataScienceRightSidebar />}
      </div>
    </div>
  );
};
