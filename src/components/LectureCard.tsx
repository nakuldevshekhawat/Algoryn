import { Link } from 'react-router-dom';
import type { Lecture, ProgressState } from '../data/dsStore';
import { isLectureComplete } from '../data/dsStore';
import { ChevronRight, Check } from 'lucide-react';

interface LectureCardProps {
  lecture: Lecture;
  progress: ProgressState;
}

export const LectureCard = ({ lecture, progress }: LectureCardProps) => {
  const partsCount = lecture.videos.length;
  const partsText = partsCount === 1 ? '1 video' : `${partsCount} parts`;
  
  const completed = isLectureComplete(lecture.id, progress);
  const partsCompleted = progress[lecture.id]?.length || 0;
  const isPartiallyComplete = partsCompleted > 0 && !completed;

  return (
    <Link 
      to={`/data-science/lectures/${lecture.id}`}
      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4 bg-white rounded-[20px] border border-border-subtle shadow-softer hover:shadow-soft hover:border-border-normal transition-all group"
    >
      <div className="flex items-center gap-4 min-w-0">
        {/* Number Badge */}
        <div className={`
          w-11 h-11 rounded-2xl flex items-center justify-center text-[15px] font-bold flex-shrink-0 transition-colors
          ${completed 
            ? 'bg-brand-primary text-white shadow-sm' 
            : isPartiallyComplete
              ? 'bg-orange-100 text-orange-600'
              : 'bg-emerald-50 text-brand-primary-dark group-hover:bg-brand-primary-light'
          }
        `}>
          {completed ? <Check className="w-5 h-5 stroke-[3]" /> : lecture.id}
        </div>
        
        <h3 className={`font-semibold text-lg line-clamp-1 ${completed ? 'text-text-muted' : 'text-text-main'}`}>
          {lecture.title}
        </h3>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-5 sm:pl-4 w-full sm:w-auto">
        <span className={`
          text-[13px] font-bold px-4 py-1.5 rounded-full whitespace-nowrap
          ${completed ? 'bg-gray-100 text-gray-500' : 'bg-orange-50 text-orange-500'}
        `}>
          {partsText}
        </span>
        <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-text-main transition-colors" />
      </div>
    </Link>
  );
};
