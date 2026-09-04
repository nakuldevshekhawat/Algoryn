import { Bookmark, Video, BookOpen } from 'lucide-react';
import type { CourseNode } from '../../utils/courseParser';

interface CourseVideoItemProps {
  node: CourseNode;
  isSelected: boolean;
  onSelect: (lesson: any) => void;
  isCompleted?: boolean;
}

export function CourseVideoItem({ node, isSelected, onSelect, isCompleted }: CourseVideoItemProps) {
  const hasVideo = !!node.lesson?.video;
  const hasNote = !!node.lesson?.note;

  return (
    <button
      onClick={() => onSelect(node.lesson)}
      className={`w-full text-left flex items-start gap-3 py-2 px-3 rounded-xl transition-all mb-1 ${
        isSelected 
          ? 'bg-brand-primary/10 text-brand-primary font-bold shadow-sm ring-1 ring-brand-primary/20' 
          : 'text-theme-text hover:bg-theme-surface-hover hover:text-brand-primary/80'
      }`}
    >
      <div className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-brand-primary' : 'text-theme-muted'}`}>
        <Bookmark className="w-[18px] h-[18px]" strokeWidth={isSelected ? 2.5 : 2} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-[14px] leading-snug break-words truncate whitespace-normal line-clamp-2">
          {node.name}
        </span>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {hasVideo && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <Video className="w-3 h-3" /> Video
            </span>
          )}
          {hasNote && (
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Notes
            </span>
          )}
          {isCompleted && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-md flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Completed
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
