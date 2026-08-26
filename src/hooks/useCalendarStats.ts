import { useMemo, useState, useEffect } from 'react';
import { getRecentActivity as getDSActivity, getDSActiveDates } from '../data/dsStore';
import { getRecentProblems, getActiveDates as getDSAActiveDates } from '../services/storage';
import { getInterviewXActivity } from '../services/interviewXStore';
import { useMode } from '../contexts/ModeContext';
import { calculateStreakStats, getLocalDateKey } from '../utils/streak';

export { getLocalDateKey };

export function getDayEmoji(dateStr: string, activityDates: string[]): "🔥" | "😭" | null {
  if (activityDates.includes(dateStr)) {
    return "🔥";
  }

  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  const prevDateStr = getLocalDateKey(d);

  if (activityDates.includes(prevDateStr)) {
    return "😭";
  }

  return null;
}

export function useCalendarStats() {
  const { activeMode } = useMode();
  
  const [ixActivityMap, setIxActivityMap] = useState(getInterviewXActivity());
  const [dsActivity, setDsActivity] = useState(getDSActivity());
  const [dsaActivity, setDsaActivity] = useState(getRecentProblems());
  
  const [dsaActiveDates, setDsaActiveDates] = useState(getDSAActiveDates());
  const [dsActiveDates, setDsActiveDates] = useState(getDSActiveDates());

  useEffect(() => {
    const handleUpdate = () => {
      setIxActivityMap(getInterviewXActivity());
      setDsActivity(getDSActivity());
      setDsaActivity(getRecentProblems());
      setDsaActiveDates(getDSAActiveDates());
      setDsActiveDates(getDSActiveDates());
    };

    window.addEventListener('storage', handleUpdate);
    window.addEventListener('interviewx-update', handleUpdate);
    window.addEventListener('ds-update', handleUpdate);
    window.addEventListener('dsa-update', handleUpdate);
    
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('interviewx-update', handleUpdate);
      window.removeEventListener('ds-update', handleUpdate);
      window.removeEventListener('dsa-update', handleUpdate);
    };
  }, []);

  const allActivityDates = useMemo(() => {
    if (activeMode === 'interviewX') {
      return Object.keys(ixActivityMap).sort();
    }
    
    if (activeMode === 'data-science') {
      return [...dsActiveDates].sort();
    }
    
    // DSA
    return [...dsaActiveDates].sort();
  }, [activeMode, ixActivityMap, dsActiveDates, dsaActiveDates]);

  const { currentStreak: streak, longestStreak, activeDays } = useMemo(() => {
    return calculateStreakStats(allActivityDates);
  }, [allActivityDates]);

  return { allActivityDates, streak, longestStreak, activeDays, ixActivityMap, dsActivity, dsaActivity };
}
