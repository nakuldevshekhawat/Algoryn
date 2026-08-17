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

export const getProgress = (): ProgressState => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

export const saveProgress = (progress: ProgressState) => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
};

export const togglePartCompletion = (lectureId: number, part: number): ProgressState => {
  const progress = getProgress();
  if (!progress[lectureId]) {
    progress[lectureId] = [];
  }
  
  const index = progress[lectureId].indexOf(part);
  if (index === -1) {
    progress[lectureId].push(part);
  } else {
    progress[lectureId].splice(index, 1);
  }
  
  saveProgress(progress);
  return progress;
};

export const resetDataScienceProgress = () => {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify({}));
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify([]));
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
    return data ? JSON.parse(data) : [];
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
  let lastCompletedLectureIndex = -1;
  let lastCompletedPartIndex = -1;

  for (let i = 0; i < courseData.lectures.length; i++) {
    const lecture = courseData.lectures[i];
    const partsDone = progress[lecture.id] || [];
    
    for (let j = 0; j < lecture.videos.length; j++) {
      if (partsDone.includes(lecture.videos[j].part)) {
        lastCompletedLectureIndex = i;
        lastCompletedPartIndex = j;
      }
    }
  }

  if (lastCompletedLectureIndex === -1) {
    for (let i = 0; i < courseData.lectures.length; i++) {
      if (courseData.lectures[i].videos.length > 0) {
        return {
          lectureId: courseData.lectures[i].id,
          part: courseData.lectures[i].videos[0].part
        };
      }
    }
    return null;
  }

  const lastLecture = courseData.lectures[lastCompletedLectureIndex];
  
  if (lastCompletedPartIndex < lastLecture.videos.length - 1) {
    return {
      lectureId: lastLecture.id,
      part: lastLecture.videos[lastCompletedPartIndex + 1].part
    };
  }

  for (let i = lastCompletedLectureIndex + 1; i < courseData.lectures.length; i++) {
    const nextLecture = courseData.lectures[i];
    if (nextLecture.videos.length > 0) {
      return {
        lectureId: nextLecture.id,
        part: nextLecture.videos[0].part
      };
    }
  }

  return null;
};
