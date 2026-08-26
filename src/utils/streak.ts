export function getLocalDateKey(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
}

export function calculateStreakStats(activityDates: string[]): StreakStats {
  if (!activityDates || activityDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, activeDays: 0 };
  }

  // Ensure unique dates and sort them ascending
  const uniqueDates = Array.from(new Set(activityDates)).sort();
  const activeDays = uniqueDates.length;

  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let checkDate = new Date(today);
  let isToday = true;

  // Calculate Current Streak
  while (true) {
    const dateStr = getLocalDateKey(checkDate);
    if (uniqueDates.includes(dateStr)) {
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

  // Calculate Longest Streak
  let max = 1;
  let current = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevDate = new Date(uniqueDates[i - 1]);
    const currDate = new Date(uniqueDates[i]);

    const diffTime = currDate.getTime() - prevDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      current++;
      max = Math.max(max, current);
    } else if (diffDays > 1) {
      current = 1;
    }
  }

  // Ensure current streak is also considered for max
  const longestStreak = Math.max(max, currentStreak);

  return { currentStreak, longestStreak, activeDays };
}
