import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import type { CourseNode } from '../../utils/courseParser';
import { CourseVideoItem } from './CourseVideoItem';

interface CourseTreeNodeProps {
  node: CourseNode;
  selectedVideoId: string | null;
  onSelectVideo: (video: any) => void;
  expandedFolders: Set<string>;
  onToggleFolder: (folderId: string) => void;
  completedIds: Set<number>;
}

export function CourseTreeNode({ node, selectedVideoId, onSelectVideo, expandedFolders, onToggleFolder, completedIds }: CourseTreeNodeProps) {
  if (node.type === 'video') {
    const isSelected = selectedVideoId === `v-${node.video.id}`;
    const isCompleted = node.video ? completedIds.has(node.video.id) : false;
    return (
      <CourseVideoItem
        node={node}
        isSelected={isSelected}
        onSelect={onSelectVideo}
        isCompleted={isCompleted}
      />
    );
  }

  // It's a folder
  const isExpanded = expandedFolders.has(node.id);

  return (
    <div className="mb-1">
      <button
        onClick={() => onToggleFolder(node.id)}
        className="w-full text-left flex items-center gap-2 py-2 px-2 rounded-xl transition-colors hover:bg-theme-surface-hover text-theme-text group"
      >
        <div className="text-theme-muted group-hover:text-theme-text transition-colors flex-shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
        <div className="text-brand-primary/80 flex-shrink-0">
          {isExpanded ? (
             <FolderOpen className="w-[18px] h-[18px]" fill="currentColor" fillOpacity={0.2} strokeWidth={2} />
          ) : (
             <Folder className="w-[18px] h-[18px]" fill="currentColor" fillOpacity={0.2} strokeWidth={2} />
          )}
        </div>
        <span className="text-[14px] font-bold truncate leading-snug">
          {node.name}
        </span>
      </button>

      {isExpanded && node.children && (
        <div className="ml-4 pl-3 border-l border-theme-border-strong/50 mt-1 flex flex-col gap-0.5">
          {node.children.map(child => (
            <CourseTreeNode
              key={child.id}
              node={child}
              selectedVideoId={selectedVideoId}
              onSelectVideo={onSelectVideo}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              completedIds={completedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}
