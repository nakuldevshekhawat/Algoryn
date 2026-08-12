import { useState, useMemo } from 'react';
import { courseData, getProgress } from '../../data/dsStore';
import { LectureCard } from '../../components/LectureCard';
import { Search } from 'lucide-react';

export const Lectures = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const progress = getProgress();
  const lectures = courseData.lectures;

  const filteredLectures = useMemo(() => {
    if (!searchQuery.trim()) return lectures;
    const query = searchQuery.toLowerCase();
    return courseData.lectures.filter((l: any) => 
      l.title.toLowerCase().includes(query) || 
      l.id.toString().includes(query)
    );
  }, [lectures, searchQuery]);

  return (
    <div className="w-full pb-16">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main mb-2">
            All Lectures
          </h1>
          <p className="text-text-muted text-lg font-medium">Browse the entire Data Science curriculum.</p>
        </div>
        
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-text-muted" />
          </div>
          <input
            type="text"
            placeholder="Search lectures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-5 pr-12 py-3.5 bg-white border border-border-subtle rounded-full text-text-main font-semibold shadow-softer focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors"
          />
        </div>
      </header>

      <div className="space-y-4">
        {filteredLectures.length > 0 ? (
          filteredLectures.map((lecture: any) => (
            <LectureCard 
              key={lecture.id} 
              lecture={lecture} 
              progress={progress}
            />
          ))
        ) : (
          <div className="text-center py-16 text-text-muted font-medium bg-white rounded-[24px] border border-border-subtle shadow-softer">
            No lectures found matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
};
