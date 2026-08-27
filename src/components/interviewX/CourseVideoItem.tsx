import { Bookmark } from 'lucide-react';
import type { CourseNode } from '../../utils/courseParser';

interface CourseVideoItemProps {
  node: CourseNode;
  isSelected: boolean;
  onSelect: (video: any) => void;
  isCompleted?: boolean;
}

export function CourseVideoItem({ node, isSelected, onSelect, isCompleted }: CourseVideoItemProps) {
  return (
    <button
      onClick={() => onSelect(node.video)}
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
        {isCompleted && (
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mt-0.5 flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Completed
          </span>
        )}
      </div>
    </button>
  );
}
