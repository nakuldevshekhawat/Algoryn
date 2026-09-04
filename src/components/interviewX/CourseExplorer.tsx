import { useState, useEffect } from 'react';
import { CourseTreeNode } from './CourseTreeNode';
import type { CourseNode } from '../../utils/courseParser';

interface CourseExplorerProps {
  tree: CourseNode[];
  selectedLessonId: string | null;
  onSelectLesson: (lesson: any) => void;
  completedIds: Set<string>;
  subjectTitle: string;
}

export function CourseExplorer({ tree, selectedLessonId, onSelectLesson, completedIds, subjectTitle }: CourseExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Function to find the path to a lesson node
  const findPathToLesson = (nodes: CourseNode[], targetId: string, currentPath: string[] = []): string[] | null => {
    for (const node of nodes) {
      if (node.type === 'lesson' && node.id === targetId) {
        return currentPath;
      }
      if (node.type === 'folder' && node.children) {
        const path = findPathToLesson(node.children, targetId, [...currentPath, node.id]);
        if (path) return path;
      }
    }
    return null;
  };

  useEffect(() => {
    if (selectedLessonId) {
      const pathToLesson = findPathToLesson(tree, selectedLessonId);
      if (pathToLesson) {
        setExpandedFolders(prev => {
          const next = new Set(prev);
          pathToLesson.forEach(folderId => next.add(folderId));
          return next;
        });
      }
    }
  }, [selectedLessonId, tree]);

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
            selectedLessonId={selectedLessonId}
            onSelectLesson={onSelectLesson}
            expandedFolders={expandedFolders}
            onToggleFolder={handleToggleFolder}
            completedIds={completedIds}
          />
        ))}
      </div>
    </div>
  );
}
