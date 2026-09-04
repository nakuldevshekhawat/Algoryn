export interface Video {
  part: number;
  url: string;
}

export interface Lecture {
  id: number;
  title: string;
  videos: Video[];
}

export interface CourseData {
  course: string;
  telegram_channel: string;
  lectures: Lecture[];
}

export interface RecentActivity {
  lectureId: number;
  part: number;
  timestamp: number;
}

import courseDataJson from './videos.json';

export const courseData = courseDataJson as CourseData;

const PROGRESS_KEY = 'data-science-companion-part-level-progress';
const ACTIVITY_KEY = 'data-science-companion-recent-activity';

export type ProgressState = Record<number, number[]>;

// --- PROGRESS ---

let dsProgressCache: ProgressState | null = null;

export const getProgress = (): ProgressState => {
  if (dsProgressCache) return dsProgressCache;
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    dsProgressCache = data ? JSON.parse(data) : {};
    return dsProgressCache!;
  } catch {
    dsProgressCache = {};
    return dsProgressCache;
  }
};

// Listen to storage events to keep cache in sync across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === PROGRESS_KEY) {
      try {
        dsProgressCache = e.newValue ? JSON.parse(e.newValue) : {};
      } catch {
        dsProgressCache = {};
      }
    }
  });
}

export const saveProgress = (progress: ProgressState) => {
  dsProgressCache = progress;
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  window.dispatchEvent(new Event("ds-update"));
};

export const togglePartCompletion = (lectureId: number, part: number): ProgressState => {
  const progress = { ...getProgress() }; // Clone to ensure new reference
  if (!progress[lectureId]) {
    progress[lectureId] = [];
  }
  
  const index = progress[lectureId].indexOf(part);
  const isCompleted = index !== -1;
  
  if (!isCompleted) {
    progress[lectureId] = [...progress[lectureId], part];
    // Record learning activity for streaks when marking as complete
    logActivity(lectureId, part);
  } else {
    // Un-marking does not penalize streaks
    progress[lectureId] = progress[lectureId].filter((p: number) => p !== part);
  }
  
  saveProgress(progress);
  return progress;
};

export const resetDataScienceProgress = () => {
  dsProgressCache = {};
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({}));
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify([]));
  localStorage.setItem('ds_activity_dates', JSON.stringify([]));
  window.dispatchEvent(new Event("ds-update"));
};

export const isLectureComplete = (lectureId: number, progress: ProgressState): boolean => {
  const lecture = courseData.lectures.find(l => l.id === lectureId);
  if (!lecture) return false;
  
  const completedParts = progress[lectureId] || [];
  return lecture.videos.length > 0 && completedParts.length === lecture.videos.length;
};

// --- ACTIVITY ---

export const getRecentActivity = (): RecentActivity[] => {
  try {
    const data = localStorage.getItem(ACTIVITY_KEY);
    const activities: RecentActivity[] = data ? JSON.parse(data) : [];
    const progress = getProgress();
    // Filter out parts that are already completed
    return activities.filter(a => {
      const partsDone = progress[a.lectureId] || [];
      return !partsDone.includes(a.part);
    });
  } catch {
    return [];
  }
};

export const logActivity = (lectureId: number, part: number) => {
  let activities = getRecentActivity();
  
  // Remove existing entry if it exists to avoid duplicates
  activities = activities.filter(a => !(a.lectureId === lectureId && a.part === part));
  
  // Add new at the beginning
  activities.unshift({
    lectureId,
    part,
    timestamp: Date.now()
  });
  
  // Keep only 5
  if (activities.length > 5) {
    activities = activities.slice(0, 5);
  }
  
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  
  // Log Data Science active date
  try {
    const raw = localStorage.getItem('ds_activity_dates');
    const dates: string[] = raw ? JSON.parse(raw) : [];
    
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (!dates.includes(dateStr)) {
      dates.push(dateStr);
      localStorage.setItem('ds_activity_dates', JSON.stringify(dates));
    }
  } catch (e) {
    console.error(e);
  }
};

export const getDSActiveDates = (): string[] => {
  try {
    const raw = localStorage.getItem('ds_activity_dates');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

// --- STATS ---

export const getCourseStats = (progress: ProgressState) => {
  let totalParts = 0;
  let completedParts = 0;
  let completedLectures = 0;
  let inProgressLectures = 0;
  
  courseData.lectures.forEach(lecture => {
    totalParts += lecture.videos.length;
    
    const partsDone = progress[lecture.id] || [];
    completedParts += partsDone.length;
    
    if (lecture.videos.length > 0) {
      if (partsDone.length === lecture.videos.length) {
        completedLectures++;
      } else if (partsDone.length > 0) {
        inProgressLectures++;
      }
    }
  });

  return {
    totalLectures: courseData.lectures.length,
    totalParts,
    completedParts,
    completedLectures,
    inProgressLectures,
    notStartedLectures: courseData.lectures.length - completedLectures - inProgressLectures
  };
};

export const getLecturesByStatus = (progress: ProgressState) => {
  const completed: Lecture[] = [];
  const inProgress: Lecture[] = [];
  const notStarted: Lecture[] = [];

  courseData.lectures.forEach(lecture => {
    const partsDone = progress[lecture.id] || [];
    if (lecture.videos.length === 0) return;

    if (partsDone.length === lecture.videos.length) {
      completed.push(lecture);
    } else if (partsDone.length > 0) {
      inProgress.push(lecture);
    } else {
      notStarted.push(lecture);
    }
  });

  return { completed, inProgress, notStarted };
};

export const getNextDataSciencePart = (progress: ProgressState): { lectureId: number, part: number } | null => {
  for (let i = 0; i < courseData.lectures.length; i++) {
    const lecture = courseData.lectures[i];
    const partsDone = progress[lecture.id] || [];
    
    // Find first incomplete video part in this lecture
    for (let j = 0; j < lecture.videos.length; j++) {
      if (!partsDone.includes(lecture.videos[j].part)) {
        return {
          lectureId: lecture.id,
          part: lecture.videos[j].part
        };
      }
    }
  }

  // If all lectures and all parts are completed
  return null;
};
