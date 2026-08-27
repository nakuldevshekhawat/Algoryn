import { useState, useEffect } from 'react';
import { CourseTreeNode } from './CourseTreeNode';
import type { CourseNode } from '../../utils/courseParser';

interface CourseExplorerProps {
  tree: CourseNode[];
  selectedVideoId: string | null;
  onSelectVideo: (video: any) => void;
  completedIds: Set<number>;
  subjectTitle: string;
}

export function CourseExplorer({ tree, selectedVideoId, onSelectVideo, completedIds, subjectTitle }: CourseExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Function to find the path to a video node
  const findPathToVideo = (nodes: CourseNode[], targetId: string, currentPath: string[] = []): string[] | null => {
    for (const node of nodes) {
      if (node.type === 'video' && `v-${node.video.id}` === targetId) {
        return currentPath;
      }
      if (node.type === 'folder' && node.children) {
        const path = findPathToVideo(node.children, targetId, [...currentPath, node.id]);
        if (path) return path;
      }
    }
    return null;
  };

  useEffect(() => {
    if (selectedVideoId) {
      const pathToVideo = findPathToVideo(tree, selectedVideoId);
      if (pathToVideo) {
        setExpandedFolders(prev => {
          const next = new Set(prev);
          pathToVideo.forEach(folderId => next.add(folderId));
          return next;
        });
      }
    }
  }, [selectedVideoId, tree]);

  const handleToggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-theme-sidebar border-r border-theme-border flex-shrink-0 w-full xl:w-[320px]">
      <div className="p-5 border-b border-theme-border-strong/50 shrink-0">
        <h2 className="text-[14px] font-bold text-theme-muted uppercase tracking-wider">Course Explorer</h2>
        <h3 className="text-xl font-black text-theme-text mt-1">{subjectTitle}</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
        {tree.map(node => (
          <CourseTreeNode
            key={node.id}
            node={node}
            selectedVideoId={selectedVideoId}
            onSelectVideo={onSelectVideo}
            expandedFolders={expandedFolders}
            onToggleFolder={handleToggleFolder}
            completedIds={completedIds}
          />
        ))}
      </div>
    </div>
  );
}
