import { useState, useMemo, useEffect, useRef } from 'react';
import { courseData, getProgress } from '../data/dsStore';
import { LectureCard } from '../components/LectureCard';
import { Search as SearchIcon } from 'lucide-react';

export const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const progress = getProgress();
  const lectures = courseData.lectures;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus search input on mount
    inputRef.current?.focus();
  }, []);

  const filteredLectures = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return courseData.lectures.filter((l: any) => 
      l.title.toLowerCase().includes(query) || 
      l.id.toString().includes(query)
    );
  }, [lectures, searchQuery]);

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
            className="w-full pl-14 pr-6 py-4 bg-white border border-border-subtle rounded-2xl text-text-main text-lg font-bold shadow-soft focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all"
          />
        </div>
      </header>

      <div>
        {!searchQuery.trim() ? (
           <div className="py-12 px-6 bg-white border border-border-subtle rounded-[24px] shadow-softer max-w-2xl text-center">
             <div className="w-16 h-16 bg-brand-primary-light/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-6 h-6 text-brand-primary-dark" />
             </div>
             <p className="font-bold text-text-main text-xl">Find a lecture</p>
             <p className="text-[16px] font-medium text-text-muted mt-2">Type above to instantly search the entire curriculum.</p>
           </div>
        ) : filteredLectures.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-[15px] font-bold text-text-muted uppercase tracking-wider mb-6 pl-2">
               {filteredLectures.length} Result{filteredLectures.length === 1 ? '' : 's'}
            </h2>
            {filteredLectures.map((lecture: any) => (
              <LectureCard 
                key={lecture.id} 
                lecture={lecture} 
                progress={progress}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-text-muted font-medium bg-white rounded-[24px] border border-border-subtle shadow-softer max-w-2xl">
            No lectures found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
