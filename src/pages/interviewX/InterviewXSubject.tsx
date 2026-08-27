import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { recordInterviewXActivity, recordRecentInterviewXActivity } from '../../services/interviewXStore';
import { interviewXSubjects, type InterviewXSubjectId } from '../../data/interviewXSubjects';
import { buildCourseTree, parseVideoMetadata } from '../../utils/courseParser';
import { CourseExplorer } from '../../components/interviewX/CourseExplorer';
import { PlayCircle, Target, CheckCircle2, Circle, Menu, X, MonitorPlay } from 'lucide-react';

const getTelegramAppUrl = (video: any) => {
  return `tg://privatepost?channel=3742161248&post=${video.telegramMessageId}&thread=${video.topicId}`;
};

export default function InterviewXSubject() {
  const { subject } = useParams<{ subject: string }>();
  const [searchParams] = useSearchParams();
  const targetVideoId = searchParams.get('video') ? parseInt(searchParams.get('video')!) : null;

  const datasetConfig = interviewXSubjects[subject as InterviewXSubjectId];
  const dataset = datasetConfig ? datasetConfig.data : null;
  const subjectTitle = datasetConfig ? datasetConfig.name : (subject ? subject.toUpperCase() : '');

  const storageKey = `interviewx_${subject}_completed`;
  const [completedIds, setCompletedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Cross-page state synchronization listener
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(storageKey);
      setCompletedIds(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('interviewx-update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('interviewx-update', handleStorageChange);
    };
  }, [storageKey]);

  useEffect(() => {
    if (targetVideoId && dataset?.videos) {
      const video = dataset.videos.find((v: any) => v.id === targetVideoId);
      if (video) {
        setSelectedVideo(video);
      }
    }
  }, [targetVideoId, dataset]);

  const courseTree = useMemo(() => {
    if (dataset && dataset.videos) {
      return buildCourseTree(dataset.videos);
    }
    return [];
  }, [dataset]);

  const toggleCompletion = (id: number) => {
    setCompletedIds(prev => {
      const isCompleted = prev.includes(id);
      const updated = isCompleted ? prev.filter(v => v !== id) : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      if (!isCompleted) {
        recordInterviewXActivity();
      }
      window.dispatchEvent(new Event('interviewx-update'));
      return updated;
    });
  };

  const handleOpenVideo = (video: any) => {
    if (subject) {
      recordRecentInterviewXActivity(subject, video.id, video.cleanName || video.title);
      recordInterviewXActivity();
      window.dispatchEvent(new Event('interviewx-update'));
    }
  };

  const handleSelectVideo = (video: any) => {
    setSelectedVideo(video);
    setIsMobileDrawerOpen(false);
  };

  if (!dataset || !dataset.videos || dataset.videos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/interviewX" className="text-theme-muted hover:text-theme-text transition-colors font-semibold text-sm mb-6 inline-block">
          &larr; Back to InterviewX
        </Link>
        <div className="bg-theme-card border border-theme-border-strong rounded-[24px] p-12 text-center shadow-softer">
          <h2 className="text-xl font-bold text-theme-text mb-2">No videos available yet.</h2>
          <p className="text-theme-muted font-medium">The dataset for {subjectTitle} has not been added.</p>
        </div>
      </div>
    );
  }

  const datasetIds = new Set(dataset.videos.map((v: any) => v.id));
  const validCompletedIds = completedIds.filter(id => datasetIds.has(id));
  const completedCount = validCompletedIds.length;
  const totalCount = dataset.videos.length;
  const completedSet = new Set(validCompletedIds);
  const overallPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const selectedVideoMetadata = selectedVideo ? parseVideoMetadata(selectedVideo.title) : null;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.20))] md:h-[calc(100vh-theme(spacing.8))] relative">
      {/* Mobile Drawer Overlay */}
      {isMobileDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 xl:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* Course Explorer Sidebar */}
      <div className={`
        fixed xl:relative inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isMobileDrawerOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}
        w-[280px] sm:w-[320px] bg-theme-sidebar border-r border-theme-border h-full flex flex-col
      `}>
        <div className="p-4 border-b border-theme-border flex items-center justify-between xl:hidden">
          <span className="font-bold text-theme-text uppercase tracking-wider text-sm">Course Explorer</span>
          <button onClick={() => setIsMobileDrawerOpen(false)} className="p-1 text-theme-muted hover:text-theme-text">
            <X className="w-5 h-5" />
          </button>
        </div>
        <CourseExplorer 
          tree={courseTree} 
          selectedVideoId={selectedVideo ? `v-${selectedVideo.id}` : null}
          onSelectVideo={handleSelectVideo}
          completedIds={completedSet}
          subjectTitle={subjectTitle}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-theme-bg custom-scrollbar relative flex flex-col">
        {/* Mobile Header */}
        <div className="xl:hidden p-4 border-b border-theme-border bg-theme-card flex items-center justify-between sticky top-0 z-30">
          <button 
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex items-center gap-2 text-theme-text font-bold"
          >
            <Menu className="w-5 h-5" />
            <span>Course Explorer</span>
          </button>
          <div className="text-xs font-bold text-theme-muted bg-theme-surface-hover px-2 py-1 rounded-md">
            {completedCount}/{totalCount}
          </div>
        </div>

        <div className="p-4 sm:p-8 flex-1 flex flex-col max-w-5xl mx-auto w-full">
          {/* Top nav / Back */}
          <div className="mb-6 flex items-center justify-between hidden xl:flex">
            <Link to="/interviewX" className="text-theme-muted hover:text-theme-text transition-colors font-bold text-sm flex items-center gap-2">
              &larr; Back to InterviewX
            </Link>
            
            <div className="flex items-center gap-3">
               <div className="text-sm font-bold text-theme-text/80">{completedCount} / {totalCount} completed</div>
               <div className="w-24 h-2 bg-theme-border-strong rounded-full overflow-hidden">
                 <div className="h-full bg-brand-primary" style={{ width: `${overallPercentage}%` }} />
               </div>
            </div>
          </div>

          {!selectedVideo ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-theme-card/30 border border-theme-border-strong rounded-[32px] mt-4 xl:mt-0">
                <div className="w-20 h-20 bg-theme-surface-hover rounded-full flex items-center justify-center text-theme-muted mb-6 shadow-sm border border-theme-border">
                  <MonitorPlay className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h2 className="text-2xl font-black text-theme-text tracking-tight mb-2">Select a topic to start learning</h2>
                <p className="text-theme-muted font-medium max-w-md">Browse the {subjectTitle} curriculum in the course explorer to begin your preparation journey.</p>
                
                <button 
                  className="mt-8 xl:hidden px-6 py-3 bg-brand-primary text-white rounded-xl font-bold flex items-center gap-2 shadow-soft active:scale-95 transition-all"
                  onClick={() => setIsMobileDrawerOpen(true)}
                >
                  <Menu className="w-4 h-4" /> Open Course Explorer
                </button>
             </div>
          ) : (
            <div className="bg-theme-card border border-theme-border rounded-[32px] p-6 sm:p-10 shadow-softer flex flex-col animate-fade-in mt-4 xl:mt-0">
               <div className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-3 py-1.5 rounded-full w-fit">
                 <Target className="w-3.5 h-3.5" />
                 {subjectTitle}
               </div>

               <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-theme-text tracking-tight leading-tight mb-10">
                 {selectedVideo.cleanName || selectedVideoMetadata?.fileName || selectedVideo.title}
               </h1>

               <div className="flex flex-col sm:flex-row gap-4 mt-auto border-t border-theme-border-strong pt-8">
                 <a
                    href={getTelegramAppUrl(selectedVideo)}
                    onClick={() => handleOpenVideo(selectedVideo)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 bg-brand-primary hover:bg-brand-primary/90 text-white active:scale-[0.98] font-bold text-[15px] rounded-2xl shadow-sm transition-all border border-black/10"
                 >
                    <PlayCircle className="w-5 h-5" /> Open Video
                 </a>

                 <button
                    onClick={() => toggleCompletion(selectedVideo.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3.5 sm:py-4 font-bold text-[15px] rounded-2xl transition-all border ${
                      completedSet.has(selectedVideo.id) 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' 
                        : 'bg-theme-bg border-theme-border-strong text-theme-text hover:bg-theme-surface-hover'
                    }`}
                 >
                    {completedSet.has(selectedVideo.id) ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" /> Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-5 h-5 opacity-50" /> Mark Complete
                      </>
                    )}
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
