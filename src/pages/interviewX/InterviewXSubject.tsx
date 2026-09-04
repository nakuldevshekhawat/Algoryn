import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { recordInterviewXActivity, recordRecentInterviewXActivity, clearInterviewXSubjectProgress } from '../../services/interviewXStore';
import { interviewXSubjects, type InterviewXSubjectId } from '../../data/interviewXSubjects';
import { buildCourseTree } from '../../utils/courseParser';
import { CourseExplorer } from '../../components/interviewX/CourseExplorer';
import { useMode } from '../../contexts/ModeContext';
import { NoteViewer } from '../../components/interviewX/NoteViewer';
import { PlayCircle, Target, CheckCircle2, Circle, Menu, X, Video, BookOpen, Maximize2, Minimize2, ArrowLeft, RotateCcw } from 'lucide-react';

const getTelegramAppUrl = (video: any) => {
  return `tg://privatepost?channel=3742161248&post=${video.telegramMessageId}&thread=${video.topicId}`;
};

export default function InterviewXSubject() {
  const { subject } = useParams<{ subject: string }>();
  const [searchParams] = useSearchParams();
  const targetLessonId = searchParams.get('lesson') || searchParams.get('video');

  const datasetConfig = interviewXSubjects[subject as InterviewXSubjectId];
  const dataset = datasetConfig ? datasetConfig.data : null;
  const notesData = datasetConfig ? datasetConfig.notesData : null;
  const subjectTitle = datasetConfig ? datasetConfig.name : (subject ? subject.toUpperCase() : '');

  const storageKey = `interviewx_${subject}_completed`;
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(storageKey);
    // Convert old numeric IDs to new string IDs
    const parsed = saved ? JSON.parse(saved) : [];
    return parsed.map((id: any) => typeof id === 'number' ? `v-${id}` : id);
  });

  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'video' | 'notes'>('video');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const { isFocusMode, setIsFocusMode } = useMode();

  // Escape key to exit focus mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode, setIsFocusMode]);

  // Cross-page state synchronization listener
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem(storageKey);
      const parsed = saved ? JSON.parse(saved) : [];
      setCompletedIds(parsed.map((id: any) => typeof id === 'number' ? `v-${id}` : id));
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('interviewx-update', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('interviewx-update', handleStorageChange);
    };
  }, [storageKey]);

  const courseTree = useMemo(() => {
    if (dataset && dataset.videos) {
      return buildCourseTree(dataset.videos, notesData);
    }
    return [];
  }, [dataset, notesData]);

  useEffect(() => {
    if (targetLessonId && courseTree.length > 0) {
      let targetId = targetLessonId;
      if (!isNaN(parseInt(targetLessonId)) && !targetLessonId.startsWith('v-') && !targetLessonId.startsWith('n-')) {
        targetId = `v-${targetLessonId}`;
      }

      const findLesson = (nodes: any[]): any => {
        for (const node of nodes) {
          if (node.type === 'lesson' && node.id === targetId) return node.lesson;
          if (node.children) {
            const found = findLesson(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const lesson = findLesson(courseTree);
      if (lesson) {
        setSelectedLesson(lesson);
        // Automatically select the available tab
        if (lesson.video && !lesson.note) setActiveTab('video');
        else if (lesson.note && !lesson.video) setActiveTab('notes');
        
        // Record as recent activity so Continue Learning knows our position
        if (subject) {
          recordRecentInterviewXActivity(subject, lesson.id, lesson.cleanName || lesson.title);
          window.dispatchEvent(new Event('interviewx-update'));
        }
      }
    }
  }, [targetLessonId, courseTree, subject]);

  const toggleCompletion = (id: string) => {
    setCompletedIds(prev => {
      const isCompleted = prev.includes(id);
      const updated = isCompleted ? prev.filter(v => v !== id) : [...prev, id];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      // Update activity and position
      if (!isCompleted && subject && selectedLesson) {
        recordInterviewXActivity();
        recordRecentInterviewXActivity(subject, selectedLesson.id, selectedLesson.cleanName || selectedLesson.title);
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

  const handleSelectLesson = (lesson: any) => {
    setSelectedLesson(lesson);
    if (lesson.video && !lesson.note) setActiveTab('video');
    else if (lesson.note && !lesson.video) setActiveTab('notes');
    else if (!lesson.video && !lesson.note) setActiveTab('video');
    
    if (subject) {
      recordRecentInterviewXActivity(subject, lesson.id, lesson.cleanName || lesson.title);
      window.dispatchEvent(new Event('interviewx-update'));
    }
    
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

  // Flatten course tree to get total lessons count
  const getAllLessons = (nodes: any[]): any[] => {
    let lessons: any[] = [];
    for (const node of nodes) {
      if (node.type === 'lesson') lessons.push(node);
      if (node.children) lessons = lessons.concat(getAllLessons(node.children));
    }
    return lessons;
  };
  
  const allLessons = useMemo(() => getAllLessons(courseTree), [courseTree]);
  const datasetIds = new Set(allLessons.map(l => l.id));
  const validCompletedIds = completedIds.filter(id => datasetIds.has(id));
  const completedCount = validCompletedIds.length;
  const totalCount = allLessons.length;
  const completedSet = new Set(validCompletedIds);
  const overallPercentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

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
      {!isFocusMode && (
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
            selectedLessonId={selectedLesson ? selectedLesson.id : null}
            onSelectLesson={handleSelectLesson}
            completedIds={completedSet}
            subjectTitle={subjectTitle}
          />
        </div>
      )}

      {/* Main Content Area (Normal View) */}
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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowResetModal(true)}
              className="p-1.5 text-accent-red bg-pastel-red rounded-md hover:opacity-80 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <div className="text-xs font-bold text-theme-muted bg-theme-surface-hover px-2 py-1 rounded-md">
              {completedCount}/{totalCount}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col w-full mx-auto max-w-5xl p-4 sm:p-8">
          {/* Top nav / Back */}
          <div className="mb-6 flex items-center justify-between hidden xl:flex">
            <Link to="/interviewX" className="text-theme-muted hover:text-theme-text transition-colors font-bold text-sm flex items-center gap-2">
              &larr; Back to InterviewX
            </Link>
            
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setShowResetModal(true)}
                 className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-bold text-accent-red bg-pastel-red rounded-full hover:opacity-80 transition-colors mr-2"
               >
                 <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                 <span>Reset</span>
               </button>
               <div className="text-sm font-bold text-theme-text/80">{completedCount} / {totalCount} completed</div>
               <div className="w-24 h-2 bg-theme-border-strong rounded-full overflow-hidden">
                 <div className="h-full bg-brand-primary" style={{ width: `${overallPercentage}%` }} />
               </div>
            </div>
          </div>

          {!selectedLesson ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-theme-card/30 border border-theme-border-strong rounded-[32px] mt-4 xl:mt-0">
                <div className="w-20 h-20 bg-theme-surface-hover rounded-full flex items-center justify-center text-theme-muted mb-6 shadow-sm border border-theme-border">
                  <BookOpen className="w-10 h-10" strokeWidth={1.5} />
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
            <div className="bg-theme-card border border-theme-border rounded-[32px] p-6 sm:p-10 shadow-softer flex flex-col animate-fade-in mt-4 xl:mt-0 flex-1">
               <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                 <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-primary uppercase tracking-wider bg-brand-primary/10 px-3 py-1.5 rounded-full">
                   <Target className="w-3.5 h-3.5" />
                   {subjectTitle}
                 </div>
                 
                 <button
                    onClick={() => toggleCompletion(selectedLesson.id)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 font-bold text-sm rounded-full transition-all border ${
                      completedSet.has(selectedLesson.id) 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' 
                        : 'bg-theme-bg border-theme-border-strong text-theme-text hover:bg-theme-surface-hover'
                    }`}
                 >
                    {completedSet.has(selectedLesson.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </>
                    ) : (
                      <>
                        <Circle className="w-4 h-4 opacity-50" /> Mark Complete
                      </>
                    )}
                 </button>
               </div>

               <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-theme-text tracking-tight leading-tight mb-8">
                 {selectedLesson.cleanName}
               </h1>

               {(selectedLesson.video && selectedLesson.note) && (
                 <div className="flex items-center justify-between border-b border-theme-border-strong mb-6">
                   <div className="flex">
                     <button
                       onClick={() => setActiveTab('video')}
                       className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'video' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-theme-muted hover:text-theme-text'}`}
                     >
                       <Video className="w-4 h-4" /> Video
                     </button>
                     <button
                       onClick={() => setActiveTab('notes')}
                       className={`flex items-center gap-2 px-6 py-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'notes' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-theme-muted hover:text-theme-text'}`}
                     >
                       <BookOpen className="w-4 h-4" /> Notes
                     </button>
                   </div>
                   
                   {activeTab === 'notes' && (
                     <button
                       onClick={() => setIsFocusMode(true)}
                       className="p-2 text-theme-muted hover:text-theme-text hover:bg-theme-surface-hover rounded-lg transition-colors mr-2"
                       title="Open fullscreen"
                     >
                       <Maximize2 className="w-4 h-4" />
                     </button>
                   )}
                 </div>
               )}

               <div className="flex-1 flex flex-col min-h-0">
                 {activeTab === 'video' && selectedLesson.video && (
                   <div className="flex flex-col items-center justify-center py-12 px-4 border border-theme-border-strong rounded-2xl bg-theme-bg/50">
                     <div className="w-16 h-16 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center mb-6">
                       <PlayCircle className="w-8 h-8" />
                     </div>
                     <h3 className="text-xl font-bold text-theme-text mb-2">Watch Lesson Video</h3>
                     <p className="text-theme-muted mb-8 text-center max-w-sm">This video is available on Telegram. Click below to open it in the Telegram app.</p>
                     <a
                        href={getTelegramAppUrl(selectedLesson.video)}
                        onClick={() => handleOpenVideo(selectedLesson.video)}
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-brand-primary hover:bg-brand-primary/90 text-white active:scale-[0.98] font-bold text-[15px] rounded-2xl shadow-sm transition-all border border-black/10"
                     >
                        <PlayCircle className="w-5 h-5" /> Open Video in Telegram
                     </a>
                   </div>
                 )}

                 {activeTab === 'video' && !selectedLesson.video && (
                   <div className="flex flex-col items-center justify-center py-12 px-4 border border-theme-border-strong rounded-2xl bg-theme-bg/50">
                     <div className="w-16 h-16 bg-theme-surface-hover text-theme-muted rounded-full flex items-center justify-center mb-6">
                       <Video className="w-8 h-8" />
                     </div>
                     <h3 className="text-lg font-bold text-theme-text mb-2">No Video Available</h3>
                     <p className="text-theme-muted text-center max-w-sm">This lesson does not have a video available yet.</p>
                   </div>
                 )}

                 {activeTab === 'notes' && selectedLesson.note && (
                   <div className="flex-1 flex flex-col h-full min-h-[600px] w-full">
                     <NoteViewer url={selectedLesson.note.path} />
                   </div>
                 )}

                 {activeTab === 'notes' && !selectedLesson.note && (
                   <div className="flex flex-col items-center justify-center py-12 px-4 border border-theme-border-strong rounded-2xl bg-theme-bg/50">
                     <div className="w-16 h-16 bg-theme-surface-hover text-theme-muted rounded-full flex items-center justify-center mb-6">
                       <BookOpen className="w-8 h-8" />
                     </div>
                     <h3 className="text-lg font-bold text-theme-text mb-2">No Notes Available</h3>
                     <p className="text-theme-muted text-center max-w-sm">This lesson does not have detailed notes yet.</p>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </div>

      {/* TRUE FULLSCREEN OVERLAY - ALGORYN READING MODE */}
      {isFocusMode && activeTab === 'notes' && selectedLesson?.note && (
        <div className="fixed inset-0 z-[100] bg-theme-bg flex flex-col animate-fade-in w-screen h-screen">
          {/* Sticky Algoryn Header */}
          <div className="w-full bg-theme-card border-b border-theme-border flex items-center justify-between px-4 sm:px-8 py-4 shadow-sm z-10 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsFocusMode(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-theme-surface-hover text-theme-text hover:bg-theme-border transition-colors"
                title="Exit fullscreen"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="hidden sm:inline-flex items-center gap-2 text-[11px] font-bold text-brand-primary uppercase tracking-widest bg-brand-primary/10 px-3 py-1.5 rounded-lg">
                <Target className="w-3.5 h-3.5" />
                {subjectTitle}
              </div>
              
              <h1 className="text-lg sm:text-xl font-black text-theme-text tracking-tight truncate max-w-[300px] sm:max-w-md lg:max-w-2xl">
                {selectedLesson.cleanName}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                 onClick={() => toggleCompletion(selectedLesson.id)}
                 className={`hidden sm:flex items-center justify-center gap-2 px-4 py-2 font-bold text-sm rounded-xl transition-all border ${
                   completedSet.has(selectedLesson.id) 
                     ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50' 
                     : 'bg-theme-bg border-theme-border-strong text-theme-text hover:bg-theme-surface-hover'
                 }`}
              >
                 {completedSet.has(selectedLesson.id) ? (
                   <>
                     <CheckCircle2 className="w-4 h-4" /> Completed
                   </>
                 ) : (
                   <>
                     <Circle className="w-4 h-4 opacity-50" /> Mark Complete
                   </>
                 )}
              </button>

              <button
                onClick={() => setIsFocusMode(false)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-theme-surface-hover text-theme-text hover:bg-theme-border transition-colors"
                title="Exit fullscreen"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Reading Area */}
          <div className="flex-1 w-full bg-theme-bg overflow-hidden flex flex-col relative">
            <div className="flex-1 flex flex-col w-full max-w-[1200px] mx-auto h-full">
              <NoteViewer url={selectedLesson.note.path} />
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-theme-card rounded-[24px] shadow-soft max-w-sm w-full p-6 border border-theme-border-strong">
            <h2 className="text-xl font-bold text-theme-text mb-2">Reset {subjectTitle} Progress?</h2>
            <p className="text-theme-muted font-medium text-sm mb-6 leading-relaxed">
              This will remove all completed progress for {subjectTitle}. Progress in other InterviewX subjects will not be affected.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-[14px] font-bold text-[13px] text-theme-muted hover:text-theme-text bg-transparent hover:bg-theme-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (subject) {
                    clearInterviewXSubjectProgress(subject);
                    window.dispatchEvent(new Event('interviewx-update'));
                  }
                  setShowResetModal(false);
                }}
                className="px-4 py-2.5 rounded-[14px] font-bold text-[13px] bg-theme-text text-theme-sidebar shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
