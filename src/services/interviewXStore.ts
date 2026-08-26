export const subjectsOrder = [
  { id: 'dsa', name: 'DSA' },
  { id: 'os', name: 'OS' },
  { id: 'cn', name: 'CN' },
  { id: 'lld', name: 'LLD' },
  { id: 'dbms', name: 'DBMS' }
];

export const interviewXData = import.meta.glob('../data/interviewX/interviewx-*.json', {
  eager: true,
  import: 'default'
}) as Record<string, any>;

export interface InterviewXActivity {
  subject: string;
  videoId: number;
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
      completedIds: completedIds as number[]
    };
  } catch {
    return { completed: 0, completedIds: [] };
  }
};

export const getNextInterviewXVideo = () => {
  for (const sub of subjectsOrder) {
    const datasetKey = `../data/interviewX/interviewx-${sub.id}.json`;
    const dataset = interviewXData[datasetKey];
    if (dataset && dataset.videos) {
      const { completedIds } = getInterviewXSubjectProgress(sub.id);
      const completedSet = new Set(completedIds);
      const nextVid = dataset.videos.find((v: any) => !completedSet.has(v.id));
      if (nextVid) {
        return { subject: sub, video: nextVid };
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

export const recordRecentInterviewXActivity = (subjectId: string, videoId: number, title: string) => {
  const recent = getRecentInterviewXActivity();
  const newActivity = {
    subject: subjectId,
    videoId,
    title,
    timestamp: new Date().toISOString()
  };
  
  // Remove existing entry for same video if exists to push it to the top
  const filtered = recent.filter(a => !(a.subject === subjectId && a.videoId === videoId));
  
  const updated = [newActivity, ...filtered].slice(0, 10); // Keep max 10
  localStorage.setItem('interviewx_recent_activity', JSON.stringify(updated));
};

export const clearInterviewXProgress = () => {
  subjectsOrder.forEach(sub => {
    localStorage.removeItem(`interviewx_${sub.id}_completed`);
  });
};

export const clearInterviewXActivity = () => {
  localStorage.removeItem('interviewx_activity');
};

export const clearInterviewXRecentActivity = () => {
  localStorage.removeItem('interviewx_recent_activity');
};
