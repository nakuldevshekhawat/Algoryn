import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Monitor, Network, Layers, Database } from 'lucide-react';

import {
  getInterviewXSubjectTotal,
  clearInterviewXProgress,
  clearInterviewXActivity,
  clearInterviewXRecentActivity
} from '../../services/interviewXStore';

const subjectsData = [
  { id: 'dsa', title: 'DSA', description: 'InterviewX DSA Videos', bgClass: 'bg-pastel-lavender', fgClass: 'text-accent-lavender', icon: Code2 },
  { id: 'os', title: 'OS', description: 'InterviewX OS Videos', bgClass: 'bg-pastel-mint', fgClass: 'text-accent-mint', icon: Monitor },
  { id: 'cn', title: 'CN', description: 'InterviewX CN Videos', bgClass: 'bg-pastel-peach', fgClass: 'text-accent-peach', icon: Network },
  { id: 'lld', title: 'LLD', description: 'InterviewX LLD Videos', bgClass: 'bg-pastel-pink', fgClass: 'text-accent-pink', icon: Layers },
  { id: 'dbms', title: 'DBMS', description: 'InterviewX DBMS Videos', bgClass: 'bg-pastel-yellow', fgClass: 'text-accent-yellow', icon: Database }
];

function ProgressCircle({ percentage, fgClass }: { percentage: number, fgClass: string }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center mb-3">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-theme-border-strong"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-700 ease-in-out ${fgClass}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-[15px]">{percentage}%</span>
      </div>
    </div>
  );
}

export default function InterviewX() {
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [showResetModal, setShowResetModal] = useState(false);

  const loadProgress = () => {
    const newProgress: Record<string, number> = {};
    subjectsData.forEach(sub => {
      try {
        const saved = localStorage.getItem(`interviewx_${sub.id}_completed`);
        const completedIds = saved ? JSON.parse(saved) : [];
        // Optional strictly valid validation here requires dataset mapping, 
        // but raw length is generally sufficient on the landing page if handled correctly in InterviewXSubject
        newProgress[sub.id] = completedIds.length;
      } catch {
        newProgress[sub.id] = 0;
      }
    });
    setProgressData(newProgress);
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

  const handleReset = () => {
    clearInterviewXProgress();
    clearInterviewXActivity();
    clearInterviewXRecentActivity();
    window.dispatchEvent(new Event('interviewx-update'));
    setShowResetModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-theme-text mb-2">InterviewX</h1>
          <p className="text-theme-muted font-medium">Prepare for technical interviews with structured subject-wise learning.</p>
        </div>
        
        <button
          onClick={() => setShowResetModal(true)}
          className="px-4 py-2 rounded-[14px] font-bold text-[13px] bg-theme-card border border-black/10 text-theme-muted hover:border-black/20 hover:text-theme-text transition-colors shadow-sm"
        >
          Reset InterviewX Progress
        </button>
      </div>
      
      {/* Subject Progress Rings */}
      <div className="bg-theme-card border border-theme-border-strong rounded-[24px] p-6 shadow-sm mb-10">
        <h2 className="text-[13px] font-bold text-theme-muted uppercase tracking-wider mb-6 text-center sm:text-left">InterviewX Subject Progress</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {subjectsData.map(sub => {
            const completed = progressData[sub.id] || 0;
            const subTotal = getInterviewXSubjectTotal(sub.id);
            const percentage = subTotal === 0 ? 0 : Math.round((Math.min(completed, subTotal) / subTotal) * 100);
            
            return (
              <div key={`prog-${sub.id}`} className="flex flex-col items-center justify-center">
                <ProgressCircle percentage={percentage} fgClass={sub.fgClass} />
                <h3 className="font-bold text-theme-text text-[15px] tracking-tight">{sub.title}</h3>
                <p className="text-theme-muted font-bold text-xs mt-1">
                  {Math.min(completed, subTotal)} / {subTotal}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjectsData.map((subject) => {
          const Icon = subject.icon;
          const completed = progressData[subject.id] || 0;
          const subTotal = getInterviewXSubjectTotal(subject.id);
          const isFinished = subTotal > 0 && completed >= subTotal;

          return (
            <div key={subject.id} className={`border border-theme-border rounded-[24px] p-6 shadow-softer hover:shadow-soft transition-all flex flex-col h-full ${subject.bgClass} ${isFinished ? 'opacity-90' : ''}`}>
              <div className="flex-1">
                <div className="w-12 h-12 bg-theme-card/40 rounded-[16px] flex items-center justify-center mb-4 shadow-sm">
                  <Icon className={`w-6 h-6 ${subject.fgClass}`} />
                </div>
                
                <h2 className="text-[22px] font-bold text-theme-text mb-1 tracking-tight">{subject.title}</h2>
                <p className="text-theme-text/80 font-bold text-[14px] mb-4">{subject.description}</p>
                
                <div className="flex flex-col gap-1 mb-6 text-sm font-semibold">
                  <span className="text-theme-text/80">{subTotal} videos</span>
                  {isFinished ? (
                    <span className="text-brand-primary-dark font-bold flex items-center gap-1">
                      ✓ Completed
                    </span>
                  ) : (
                    <span className="text-theme-text/60">{completed} completed</span>
                  )}
                </div>
              </div>
              
              <Link
                to={`/interviewX/${subject.id}`}
                className="inline-flex justify-center items-center px-4 py-3 rounded-[16px] bg-theme-text text-theme-sidebar font-bold text-[14px] transition-transform hover:scale-[1.02] active:scale-[0.98] w-full shadow-sm"
              >
                Open &rarr;
              </Link>
            </div>
          );
        })}
      </div>

      {/* Reset Modal Overlay */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-theme-card rounded-[24px] shadow-soft max-w-sm w-full p-6 border border-theme-border-strong">
            <h2 className="text-xl font-bold text-theme-text mb-2">Reset InterviewX Progress?</h2>
            <p className="text-theme-muted font-medium text-sm mb-6 leading-relaxed">
              This will restore all completed InterviewX videos and reset your InterviewX progress.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-[14px] font-bold text-[13px] text-theme-muted hover:text-theme-text bg-transparent hover:bg-theme-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-[14px] font-bold text-[13px] bg-theme-text text-theme-sidebar shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
