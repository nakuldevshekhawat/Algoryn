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
  type: 'folder' | 'video';
  children?: CourseNode[];
  video?: any;
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
  const fileMatch = rawTitle.match(/File:\s*(.*?)(?=\s*(?:Location:|Follow Now:|Now:|Downloaded By|$))/i);
  if (fileMatch) {
    return fileMatch[1].trim();
  }
  return rawTitle.trim();
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

export function buildCourseTree(videos: any[]): CourseNode[] {
  const rootNodes: CourseNode[] = [];
  const nodeMap = new Map<string, CourseNode>();

  for (const video of videos) {
    const titleStr = video.title || '';
    const metadata = parseVideoMetadata(titleStr);
    
    // If no location path, we can put it at the root or handle it specially.
    // We'll put it at root.
    if (metadata.locationPath.length === 0) {
      rootNodes.push({
        id: `v-${video.id}`,
        name: metadata.fileName || `Video ${video.id}`,
        order: 999,
        type: 'video',
        video: {
           ...video,
           cleanName: metadata.fileName || `Video ${video.id}`
        }
      });
      continue;
    }

    let currentLevelNodes = rootNodes;
    let currentPathId = '';

    // Traverse all parts EXCEPT the last one to build folders
    for (let i = 0; i < metadata.locationPath.length; i++) {
      const part = metadata.locationPath[i];
      currentPathId = currentPathId ? `${currentPathId}/${part.raw}` : part.raw;
      
      // If it's the last part in the location array, it's the video itself
      if (i === metadata.locationPath.length - 1) {
        // Create video node
        const videoName = metadata.fileName || part.name || `Video ${video.id}`;
        const videoNode: CourseNode = {
          id: `v-${video.id}`, // use video id for uniqueness
          name: videoName,
          order: part.order,
          type: 'video',
          video: {
             ...video,
             cleanName: videoName
          }
        };
        currentLevelNodes.push(videoNode);
      } else {
        // It's a folder
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
        
        // Next level will be inserted into this folder's children
        if (folderNode.children) {
          currentLevelNodes = folderNode.children;
        }
      }
    }
  }

  // Sort nodes recursively
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
