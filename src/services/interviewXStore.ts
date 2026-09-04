export const subjectsOrder = [
  { id: 'dsa', name: 'DSA' },
  { id: 'os', name: 'OS' },
  { id: 'cn', name: 'CN' },
  { id: 'lld', name: 'LLD' },
  { id: 'dbms', name: 'DBMS' }
];

import { interviewXSubjects, type InterviewXSubjectId } from '../data/interviewXSubjects';
import { buildCourseTree } from '../utils/courseParser';

export const interviewXData = import.meta.glob('../data/interviewX/interviewx-*.json', {
  eager: true,
  import: 'default'
}) as Record<string, any>;

export interface InterviewXActivity {
  subject: string;
  lessonId: string;
  title: string;
  timestamp: string;
}

export const getInterviewXTotalVideos = () => {
  let total = 0;
  subjectsOrder.forEach(sub => {
    const dataset = interviewXData[`../data/interviewX/interviewx-${sub.id}.json`];
    if (dataset && dataset.videos) {
      total += dataset.videos.length;
    }
  });
  return total;
};

export const getInterviewXSubjectTotal = (subjectId: string) => {
  const dataset = interviewXData[`../data/interviewX/interviewx-${subjectId}.json`];
  if (dataset && dataset.videos) {
    return dataset.videos.length;
  }
  return 0;
};

export const getInterviewXProgress = () => {
  let totalCompleted = 0;
  subjectsOrder.forEach(sub => {
    totalCompleted += getInterviewXSubjectProgress(sub.id).completed;
  });
  return totalCompleted;
};

export const getInterviewXSubjectProgress = (subjectId: string) => {
  try {
    const saved = localStorage.getItem(`interviewx_${subjectId}_completed`);
    const completedIds = saved ? JSON.parse(saved) : [];
    return {
      completed: completedIds.length,
      completedIds: completedIds as string[]
    };
  } catch {
    return { completed: 0, completedIds: [] as string[] };
  }
};

export const getNextInterviewXVideo = () => {
  // Helper to flatten the course tree
  const getAllLessons = (nodes: any[]): any[] => {
    let lessons: any[] = [];
    for (const node of nodes) {
      if (node.type === 'lesson') lessons.push(node.lesson);
      if (node.children) lessons = lessons.concat(getAllLessons(node.children));
    }
    return lessons;
  };

  const recentActivities = getRecentInterviewXActivity();
  const mostRecent = recentActivities.length > 0 ? recentActivities[0] : null;

  let startingSubjectIdx = 0;
  let startingLessonId: string | null = null;
  
  if (mostRecent) {
    startingSubjectIdx = subjectsOrder.findIndex(s => s.id === mostRecent.subject);
    if (startingSubjectIdx === -1) startingSubjectIdx = 0;
    // Support legacy numeric IDs or new string IDs
    startingLessonId = typeof mostRecent.lessonId === 'number' ? `v-${mostRecent.lessonId}` : mostRecent.lessonId;
    // Legacy fallback for old key
    if (!startingLessonId && (mostRecent as any).videoId !== undefined) {
       startingLessonId = typeof (mostRecent as any).videoId === 'number' ? `v-${(mostRecent as any).videoId}` : (mostRecent as any).videoId;
    }
  }

  for (let i = 0; i < subjectsOrder.length; i++) {
    const subIdx = (startingSubjectIdx + i) % subjectsOrder.length;
    const sub = subjectsOrder[subIdx];
    
    const config = interviewXSubjects[sub.id as InterviewXSubjectId];
    if (config && config.data && config.data.videos) {
      const tree = buildCourseTree(config.data.videos, config.notesData);
      const allLessons = getAllLessons(tree);
      
      const { completedIds } = getInterviewXSubjectProgress(sub.id);
      const completedSet = new Set(completedIds);
      
      let searchStartIndex = 0;
      
      if (i === 0 && startingLessonId) {
        const foundIdx = allLessons.findIndex(lesson => lesson.id === startingLessonId);
        if (foundIdx !== -1) {
          searchStartIndex = foundIdx + 1;
        }
      }
      
      // Search forward
      for (let j = searchStartIndex; j < allLessons.length; j++) {
        const lesson = allLessons[j];
        if (!completedSet.has(lesson.id)) {
          return { subject: sub, lesson };
        }
      }
      
      // Loop back to beginning of the SAME subject if we didn't find one and started midway
      if (i === 0 && searchStartIndex > 0) {
        for (let j = 0; j < searchStartIndex; j++) {
          const lesson = allLessons[j];
          if (!completedSet.has(lesson.id)) {
            return { subject: sub, lesson };
          }
        }
      }
    }
  }
  
  return null;
};

export const getInterviewXActivity = (): Record<string, number> => {
  try {
    const saved = localStorage.getItem('interviewx_activity');
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const recordInterviewXActivity = () => {
  const activity = getInterviewXActivity();
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;

  if (activity[dateStr]) {
    activity[dateStr] += 1;
  } else {
    activity[dateStr] = 1;
  }

  localStorage.setItem('interviewx_activity', JSON.stringify(activity));
};

export const getRecentInterviewXActivity = (): InterviewXActivity[] => {
  try {
    const saved = localStorage.getItem('interviewx_recent_activity');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const recordRecentInterviewXActivity = (subjectId: string, lessonId: string | number, title: string) => {
  const recent = getRecentInterviewXActivity();
  const finalLessonId = typeof lessonId === 'number' ? `v-${lessonId}` : lessonId;
  const newActivity: InterviewXActivity = {
    subject: subjectId,
    lessonId: finalLessonId,
    title,
    timestamp: new Date().toISOString()
  };
  
  // Support legacy filter
  const filtered = recent.filter(a => !(a.subject === subjectId && (a.lessonId === finalLessonId || (a as any).videoId === lessonId)));
  
  const updated = [newActivity, ...filtered].slice(0, 10);
  localStorage.setItem('interviewx_recent_activity', JSON.stringify(updated));
};

export const clearInterviewXProgress = () => {
  subjectsOrder.forEach(sub => {
    localStorage.removeItem(`interviewx_${sub.id}_completed`);
  });
};

export const clearInterviewXSubjectProgress = (subjectId: string) => {
  localStorage.removeItem(`interviewx_${subjectId}_completed`);
};

export const clearInterviewXActivity = () => {
  localStorage.removeItem('interviewx_activity');
};

export const clearInterviewXRecentActivity = () => {
  localStorage.removeItem('interviewx_recent_activity');
};
