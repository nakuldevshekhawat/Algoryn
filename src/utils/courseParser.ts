export interface ParsedLocationItem {
  raw: string;
  name: string;
  order: number;
}

export interface ParsedVideoMetadata {
  fileName: string;
  locationPath: ParsedLocationItem[];
}

export interface CourseNode {
  id: string;
  name: string;
  order: number;
  type: 'folder' | 'lesson';
  children?: CourseNode[];
  lesson?: {
    video?: any;
    note?: any;
    id: string;
    cleanName: string;
  };
}

export function extractOrder(name: string): number {
  const match = name.match(/^(\d+)\./);
  return match ? parseInt(match[1], 10) : 999;
}

export function removeNumberPrefix(name: string): string {
  return name.replace(/^\d+\.\s*/, '').trim();
}

export function extractCleanFilename(rawTitle: string): string {
  if (!rawTitle) return '';
  const fileMatch = rawTitle.match(/(?:File Name:|File:)\s*(.*?)(?=\s*(?:Location:|Follow Now:|Now:|Downloaded By|$))/i);
  let name = fileMatch ? fileMatch[1].trim() : rawTitle.trim();
  return removeNumberPrefix(name);
}

export function parseVideoMetadata(title: string): ParsedVideoMetadata {
  const fileName = extractCleanFilename(title);

  let locationStr = '';
  const locationMatch = title.match(/Location:\s*(.*?)(?=\s*(?:Follow Now:|Now:|Downloaded By|$))/i);
  if (locationMatch) {
    locationStr = locationMatch[1].trim();
  }

  const locationParts = locationStr ? locationStr.split('/').map(p => p.trim()).filter(Boolean) : [];
  
  const locationPath = locationParts.map(part => ({
    raw: part,
    name: removeNumberPrefix(part),
    order: extractOrder(part)
  }));

  return {
    fileName,
    locationPath
  };
}

export function buildCourseTree(videos: any[], notesData?: any): CourseNode[] {
  const rootNodes: CourseNode[] = [];
  const nodeMap = new Map<string, CourseNode>();

  const unmatchedNotes = notesData?.unmatchedNotes || [];
  const matchedNotes = notesData?.matchedNotes || {};

  for (const video of videos) {
    const titleStr = video.title || '';
    const metadata = parseVideoMetadata(titleStr);
    const note = matchedNotes[video.id];
    
    // Check if video has "(...)" suffix to remove it for a cleaner UI title
    let videoName = metadata.fileName || `Video ${video.id}`;
    videoName = videoName.replace(/\\s*\\(.*\\)\\s*$/, '').trim();
    
    const lessonData = {
       video: { ...video, cleanName: videoName },
       note: note,
       id: `v-${video.id}`,
       cleanName: videoName
    };

    if (metadata.locationPath.length === 0) {
      rootNodes.push({
        id: `v-${video.id}`,
        name: videoName,
        order: 999,
        type: 'lesson',
        lesson: lessonData
      });
      continue;
    }

    let currentLevelNodes = rootNodes;
    let currentPathId = '';

    for (let i = 0; i < metadata.locationPath.length; i++) {
      const part = metadata.locationPath[i];
      currentPathId = currentPathId ? `${currentPathId}/${part.raw}` : part.raw;
      
      if (i === metadata.locationPath.length - 1) {
        // Create lesson node
        const lessonNode: CourseNode = {
          id: `v-${video.id}`,
          name: videoName,
          order: part.order,
          type: 'lesson',
          lesson: lessonData
        };
        currentLevelNodes.push(lessonNode);
      } else {
        let folderNode = nodeMap.get(currentPathId);
        if (!folderNode) {
          folderNode = {
            id: currentPathId,
            name: part.name,
            order: part.order,
            type: 'folder',
            children: []
          };
          nodeMap.set(currentPathId, folderNode);
          currentLevelNodes.push(folderNode);
        }
        
        if (folderNode.children) {
          currentLevelNodes = folderNode.children;
        }
      }
    }
  }

  // Handle unmatched notes by appending them as standalone lessons
  for (let i = 0; i < unmatchedNotes.length; i++) {
    const uNote = unmatchedNotes[i];
    const uNoteId = `n-unmatched-${i}`;
    const lessonData = {
      note: uNote,
      id: uNoteId,
      cleanName: uNote.cleanTitle
    };

    // If note has a relPath (like OS), try to put it in the right folder
    if (uNote.relPath) {
      const parts = uNote.relPath.split('/').filter(Boolean);
      let currentLevelNodes = rootNodes;
      let currentPathId = '';
      
      for (let j = 0; j < parts.length; j++) {
        const partRaw = parts[j];
        const isFile = (j === parts.length - 1);
        currentPathId = currentPathId ? `${currentPathId}/${partRaw}` : partRaw;
        
        if (isFile) {
          currentLevelNodes.push({
            id: uNoteId,
            name: uNote.cleanTitle,
            order: extractOrder(partRaw),
            type: 'lesson',
            lesson: lessonData
          });
        } else {
          let folderNode = nodeMap.get(currentPathId);
          if (!folderNode) {
            folderNode = {
              id: currentPathId,
              name: removeNumberPrefix(partRaw),
              order: extractOrder(partRaw),
              type: 'folder',
              children: []
            };
            nodeMap.set(currentPathId, folderNode);
            currentLevelNodes.push(folderNode);
          }
          if (folderNode.children) {
            currentLevelNodes = folderNode.children;
          }
        }
      }
    } else {
      // Just put at root
      rootNodes.push({
        id: uNoteId,
        name: uNote.cleanTitle,
        order: 999,
        type: 'lesson',
        lesson: lessonData
      });
    }
  }

  function sortNodes(nodes: CourseNode[]) {
    nodes.sort((a, b) => a.order - b.order);
    for (const node of nodes) {
      if (node.children) {
        sortNodes(node.children);
      }
    }
  }

  sortNodes(rootNodes);
  return rootNodes;
}
