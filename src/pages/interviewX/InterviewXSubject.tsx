import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { recordInterviewXActivity, recordRecentInterviewXActivity } from '../../services/interviewXStore';
import interviewxDsa from '../../data/interviewX/interviewx-dsa.json';

// Import all interviewX JSON files eagerly
const futureSubjectData = import.meta.glob('../../data/interviewX/interviewx-*.json', {
  eager: true,
  import: 'default'
});

const getDataset = (subject: string | undefined) => {
  if (subject === 'dsa') return interviewxDsa;
  if (!subject) return null;
  const path = `../../data/interviewX/interviewx-${subject}.json`;
  return futureSubjectData[path] || null;
};

const getTelegramAppUrl = (video: any) => {
  return `tg://privatepost?channel=3742161248&post=${video.telegramMessageId}&thread=${video.topicId}`;
};

const pastels = [
  'bg-pastel-mint',
  'bg-pastel-lavender',
  'bg-pastel-peach',
  'bg-pastel-pink'
];

export default function InterviewXSubject() {
  const { subject } = useParams<{ subject: string }>();
  const [searchParams] = useSearchParams();
  const targetVideoId = searchParams.get('video') ? parseInt(searchParams.get('video')!) : null;
  const targetRef = useRef<HTMLDivElement>(null);

  const dataset = getDataset(subject) as any;

  const storageKey = `interviewx_${subject}_completed`;
  const [completedIds, setCompletedIds] = useState<number[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  // Cross-page state synchronization listener
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(storageKey);
      setCompletedIds(saved ? JSON.parse(saved) : []);
    };
    
    // Listen for cross-tab or manually dispatched storage events (like Reset)
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-window updates
    window.addEventListener('interviewx-update', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('interviewx-update', handleStorageChange);
    };
  }, [storageKey]);

  const toggleCompletion = (id: number) => {
    setCompletedIds(prev => {
      const isCompleted = prev.includes(id);
      const updated = isCompleted ? prev.filter(v => v !== id) : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      // If marking complete, record activity
      if (!isCompleted) {
        recordInterviewXActivity();
      }
      
      // Dispatch custom event to notify other components (e.g., if we had a mini-progress somewhere)
      window.dispatchEvent(new Event('interviewx-update'));
      return updated;
    });
  };

  const handleOpenVideo = (video: any) => {
    if (subject) {
      recordRecentInterviewXActivity(subject, video.id, video.title);
      recordInterviewXActivity();
      window.dispatchEvent(new Event('interviewx-update'));
    }
  };

  useEffect(() => {
    if (targetVideoId && targetRef.current) {
      targetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [targetVideoId, completedIds]); // re-run if it finishes loading or state changes

  const subjectTitle = subject ? subject.toUpperCase() : '';

  if (!dataset || !dataset.videos || dataset.videos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center gap-4">
          <Link to="/interviewX" className="text-theme-muted hover:text-theme-text transition-colors font-semibold text-sm">
            &larr; Back to InterviewX
          </Link>
        </div>
        <div className="bg-theme-card border border-theme-border-strong rounded-[24px] p-12 text-center shadow-softer">
          <h2 className="text-xl font-bold text-theme-text mb-2">No videos available yet.</h2>
          <p className="text-theme-muted font-medium">The dataset for {subjectTitle} has not been added.</p>
        </div>
      </div>
    );
  }

  // Calculate actual valid progress using intersection
  const datasetIds = new Set(dataset.videos.map((v: any) => v.id));
  const validCompletedIds = completedIds.filter(id => datasetIds.has(id));
  const completedCount = validCompletedIds.length;
  const totalCount = dataset.videos.length;
  
  // Hide-on-complete logic
  const completedIdSet = new Set(validCompletedIds);
  let visibleVideos = dataset.videos.filter((video: any) => !completedIdSet.has(video.id));
  
  // If targetVideo is completed, we inject it temporarily at the top for deep linking
  let targetCompletedVideo = null;
  if (targetVideoId && completedIdSet.has(targetVideoId)) {
    targetCompletedVideo = dataset.videos.find((v: any) => v.id === targetVideoId);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="mb-2">
            <Link to="/interviewX" className="text-theme-muted hover:text-theme-text transition-colors font-semibold text-sm">
              &larr; Back to InterviewX
            </Link>
          </div>
          <h1 className="text-[28px] font-bold text-theme-text tracking-tight">{subjectTitle} Videos</h1>
        </div>
        
        {/* Compact Pastel Pill for Completion Count */}
        <div className="bg-pastel-lavender/50 border border-accent-lavender/50 px-4 py-2 rounded-full shadow-sm text-[13px] font-bold text-theme-text flex items-center gap-2 w-fit">
          <div className="w-2 h-2 rounded-full bg-accent-lavender" />
          {totalCount} videos &bull; {completedCount} completed
        </div>
      </div>
      
      {/* Empty Success State */}
      {visibleVideos.length === 0 && !targetCompletedVideo ? (
        <div className="bg-theme-card border border-theme-border-strong rounded-[24px] p-12 text-center shadow-softer mt-8">
          <div className="w-16 h-16 mx-auto bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-theme-text mb-2">All {subjectTitle} videos completed!</h2>
          <p className="text-theme-muted font-medium">You've finished all {totalCount} videos.</p>
        </div>
      ) : (
        /* Video Grid */
        <div className="space-y-8">
          {targetCompletedVideo && (
            <div>
              <h2 className="text-[15px] font-bold text-brand-primary uppercase tracking-wider mb-4 pl-2 flex items-center gap-2">
                Requested Search Result
              </h2>
              <div
                ref={targetRef}
                className="border-2 border-brand-primary bg-brand-primary-light/10 rounded-[24px] p-5 shadow-soft flex flex-col transition-all max-w-sm relative"
              >
                <div className="absolute top-0 right-0 bg-brand-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-[24px]">
                  ✓ Completed
                </div>
                <div className="flex flex-col h-full mt-2">
                  <h3 className="font-bold text-theme-text mb-6 text-[16px] leading-snug flex-1 pr-10">
                    {targetCompletedVideo.title || `Video ${targetCompletedVideo.id}`}
                  </h3>
                  <div className="flex flex-col gap-2 mt-auto">
                    <a
                      href={getTelegramAppUrl(targetCompletedVideo)}
                      onClick={() => handleOpenVideo(targetCompletedVideo)}
                      className="w-full text-center py-2.5 bg-theme-text text-theme-sidebar hover:bg-theme-muted active:scale-[0.98] font-bold text-[13px] rounded-[14px] shadow-sm transition-all"
                    >
                      Open Video
                    </a>
                    <button
                      onClick={() => toggleCompletion(targetCompletedVideo.id)}
                      className="w-full text-center py-2.5 font-bold text-[13px] rounded-[14px] transition-colors border bg-brand-primary/10 border-brand-primary/20 text-brand-primary hover:bg-brand-primary/20 mt-1"
                    >
                      Undo Completion
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {visibleVideos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleVideos.map((video: any, index: number) => {
                const cardBg = pastels[index % pastels.length];
                const isTarget = video.id === targetVideoId;
                
                return (
                  <div 
                    key={video.id} 
                    ref={isTarget ? targetRef : null}
                    className={`border ${isTarget ? 'border-theme-text ring-2 ring-theme-text ring-offset-2' : 'border-theme-border'} rounded-[24px] p-5 shadow-softer flex flex-col transition-all hover:shadow-soft ${cardBg}`}
                  >
                    <div className="flex flex-col h-full">
                      <h3 className="font-bold text-theme-text mb-6 text-[16px] leading-snug flex-1">
                        {video.title || `Video ${video.id}`}
                      </h3>
                      
                      <div className="flex flex-col gap-2 mt-auto">
                        {/* Primary App Link */}
                        <a
                          href={getTelegramAppUrl(video)}
                          onClick={() => handleOpenVideo(video)}
                          className="w-full text-center py-2.5 bg-theme-text text-theme-sidebar hover:bg-theme-muted active:scale-[0.98] font-bold text-[13px] rounded-[14px] shadow-sm transition-all"
                        >
                          Open Video
                        </a>
                        
                        {/* Complete Button (Immediately Hides on Click) */}
                        <button
                          onClick={() => toggleCompletion(video.id)}
                          className="w-full text-center py-2.5 font-bold text-[13px] rounded-[14px] transition-colors border bg-transparent border-black/10 text-theme-muted hover:border-black/20 hover:text-theme-text mt-1"
                        >
                          ☐ Mark Complete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
