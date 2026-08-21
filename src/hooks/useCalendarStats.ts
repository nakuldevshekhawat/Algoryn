import { useMemo } from 'react';
import { getRecentActivity as getDSActivity } from '../data/dsStore';
import { getRecentProblems, getActiveDates } from '../services/storage';

export function getLocalDateKey(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function useCalendarStats() {
  const dsActivity = getDSActivity();
  const dsaActivity = getRecentProblems();
  const storedActiveDates = getActiveDates();

  const allActivityDates = useMemo(() => {
    const dates = new Set<string>(storedActiveDates);
    
    dsActivity.forEach(a => {
      dates.add(getLocalDateKey(a.timestamp));
    });

    dsaActivity.forEach(a => {
      dates.add(getLocalDateKey(a.timestamp));
    });

    return Array.from(dates).sort();
  }, [dsActivity, dsaActivity, storedActiveDates]);

  const streak = useMemo(() => {
    if (allActivityDates.length === 0) return 0;
    
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let checkDate = new Date(today);
    let isToday = true;
    
    while(true) {
      const dateStr = getLocalDateKey(checkDate);
      if (allActivityDates.includes(dateStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
        isToday = false;
      } else if (isToday) {
        // Missed today, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        isToday = false;
      } else {
        break;
      }
    }
    return currentStreak;
  }, [allActivityDates]);

  const longestStreak = useMemo(() => {
    if (allActivityDates.length === 0) return 0;
    
    let max = 1;
    let current = 1;
    
    for (let i = 1; i < allActivityDates.length; i++) {
      const prevDate = new Date(allActivityDates[i - 1]);
      const currDate = new Date(allActivityDates[i]);
      
      const diffTime = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        current++;
        max = Math.max(max, current);
      } else if (diffDays > 1) {
        current = 1;
      }
    }
    
    // Ensure current streak is also considered
    return Math.max(max, streak);
  }, [allActivityDates, streak]);

  return { allActivityDates, streak, longestStreak };
}
