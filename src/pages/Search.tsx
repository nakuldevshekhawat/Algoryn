import { useState, useMemo, useEffect, useRef } from 'react';
import { courseData, getProgress } from '../data/dsStore';
import { LectureCard } from '../components/LectureCard';
import { Search as SearchIcon, Video, CheckCircle2 } from 'lucide-react';
import { useMode } from '../contexts/ModeContext';
import { Link } from 'react-router-dom';
import { subjectsOrder, interviewXData, getInterviewXSubjectProgress } from '../services/interviewXStore';
import { extractCleanFilename } from '../utils/courseParser';

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const progress = getProgress();
  const lectures = courseData.lectures;
  const inputRef = useRef<HTMLInputElement>(null);
  const { activeMode } = useMode();

  useEffect(() => {
    // Focus search input on mount
    inputRef.current?.focus();
  }, []);

  const filteredDataScience = useMemo(() => {
    if (activeMode !== 'data-science' || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return courseData.lectures.filter((l: any) => 
      l.title.toLowerCase().includes(query) || 
      l.id.toString().includes(query)
    );
  }, [lectures, searchQuery, activeMode]);

  const filteredInterviewX = useMemo(() => {
    if (activeMode !== 'interviewX' || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    subjectsOrder.forEach(sub => {
      const dataset = interviewXData[`../data/interviewX/interviewx-${sub.id}.json`];
      const { completedIds } = getInterviewXSubjectProgress(sub.id);
      const completedSet = new Set(completedIds);

      if (dataset && dataset.videos) {
        dataset.videos.forEach((vid: any) => {
          const cleanName = extractCleanFilename(vid.title || '');
          if (cleanName.toLowerCase().includes(query) || vid.id.toString().includes(query)) {
            results.push({
              subject: sub,
              video: vid,
              cleanName: cleanName,
              completed: completedSet.has(vid.id)
            });
          }
        });
      }
    });

    return results;
  }, [searchQuery, activeMode]);

  return (
    <div className="w-full pb-16">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-text-main mb-6">
          Search
        </h1>
        
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <SearchIcon className="h-6 w-6 text-brand-primary" />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by lecture number or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-theme-card border border-border-subtle rounded-2xl text-text-main text-lg font-bold shadow-soft focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>
      </header>

      <div>
        {!searchQuery.trim() ? (
           <div className="py-12 px-6 bg-theme-card border border-border-subtle rounded-[24px] shadow-softer max-w-2xl text-center">
             <div className="w-16 h-16 bg-brand-primary-light/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-6 h-6 text-brand-primary-dark" />
             </div>
             <p className="font-bold text-text-main text-xl">Find a {activeMode === 'interviewX' ? 'video' : 'lecture'}</p>
             <p className="text-[16px] font-medium text-text-muted mt-2">Type above to instantly search the entire {activeMode === 'interviewX' ? 'InterviewX' : 'Data Science'} curriculum.</p>
           </div>
        ) : activeMode === 'interviewX' ? (
          filteredInterviewX.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-[15px] font-bold text-text-muted uppercase tracking-wider mb-6 pl-2">
                 {filteredInterviewX.length} Result{filteredInterviewX.length === 1 ? '' : 's'}
              </h2>
              {filteredInterviewX.map((res: any, idx: number) => (
                <Link 
                  key={`ix-search-${res.subject.id}-${res.video.id}-${idx}`}
                  to={`/interviewX/${res.subject.id}?video=${res.video.id}`}
                  className={`block bg-theme-card border ${res.completed ? 'border-brand-primary bg-brand-primary-light/10' : 'border-border-subtle'} rounded-[24px] p-6 shadow-softer hover:-translate-y-1 hover:shadow-soft transition-all group relative overflow-hidden`}
                >
                  {res.completed && (
                    <div className="absolute top-0 right-0 bg-brand-primary text-white text-[11px] font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-[24px] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </div>
                  )}
                  <div className="flex items-start gap-4">
                     <div className="w-12 h-12 bg-pastel-pink rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                       <Video className="w-5 h-5 text-text-main" />
                     </div>
                     <div className="flex-1 pr-16">
                       <h3 className="font-bold text-text-main text-lg mb-1">{res.cleanName || `Video ${res.video.id}`}</h3>
                       <div className="flex items-center gap-3 text-text-muted font-bold text-sm">
                         <span className="bg-theme-bg px-2.5 py-1 rounded-md">{res.subject.name}</span>
                         <span>Video {res.video.id}</span>
                       </div>
                     </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-text-muted font-medium bg-theme-card rounded-[24px] border border-border-subtle shadow-softer max-w-2xl">
              No videos found matching "{searchQuery}"
            </div>
          )
        ) : (
          filteredDataScience.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-[15px] font-bold text-text-muted uppercase tracking-wider mb-6 pl-2">
                 {filteredDataScience.length} Result{filteredDataScience.length === 1 ? '' : 's'}
              </h2>
              {filteredDataScience.map((lecture: any) => (
                <LectureCard 
                  key={lecture.id} 
                  lecture={lecture} 
                  progress={progress}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-text-muted font-medium bg-theme-card rounded-[24px] border border-border-subtle shadow-softer max-w-2xl">
              No lectures found matching "{searchQuery}"
            </div>
          )
        )}
      </div>
    </div>
  );
};
