/**
 * AURELIS Study Streak & Consistency Engine
 *
 * Deterministically computes:
 * 1. Current consecutive study day streak
 * 2. Longest historical study streak
 * 3. Rolling 7-day visual consistency track
 * 4. Progress towards next streak milestone
 */

import { AppState, Topic } from '../types';
import {
  getTodayDateString,
  addCalendarDays,
  differenceInCalendarDays,
  parseDateString,
} from './scheduler';

export interface DayConsistencyItem {
  dateStr: string;
  dayNumber: number;
  dayOfWeekAbbr: string; // "M", "T", "W", "T", "F", "S", "S"
  dayName: string; // "Mon", "Tue", etc.
  isToday: boolean;
  hasStudied: boolean;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  studiedToday: boolean;
  studiedYesterday: boolean;
  rolling7Days: DayConsistencyItem[];
  weeklyActiveDaysCount: number; // e.g. 5 out of 7
  weeklyCompletionPercentage: number; // e.g. 71%
  nextMilestone: number; // e.g. 7, 14, 21, 30
  milestoneProgressPercentage: number; // 0 to 100
  milestoneTitle: string;
  statusMessage: string;
}

const STREAK_MILESTONES = [3, 7, 14, 21, 30, 60, 100, 180, 365];

const MILESTONE_TITLES: Record<number, string> = {
  3: 'Habit Spark',
  7: 'First Week Mastery',
  14: 'Fortnight of Focus',
  21: 'Neural Consolidation',
  30: 'Month of Rigor',
  60: 'Disciplined Scholar',
  100: 'Century of Mastery',
  180: 'Academic Elite',
  365: 'Year of Excellence',
};

/**
 * Gathers all unique calendar dates (YYYY-MM-DD) where the user was active:
 * - studied a new topic
 * - completed a scheduled revision
 * - took a weekly test
 * - explicit check-in history
 */
export function getAllStudyDates(state: AppState): Set<string> {
  const dates = new Set<string>();

  // 1. Topic initial study dates
  state.topics.forEach((topic) => {
    if (topic.studiedDate) {
      dates.add(topic.studiedDate);
    }
    // 2. Completed review dates
    topic.schedule.forEach((item) => {
      if (item.status === 'completed' && item.completedDate) {
        dates.add(item.completedDate);
      }
    });
  });

  // 3. Weekly test dates
  state.weeklyTests.forEach((test) => {
    if (test.date) {
      dates.add(test.date);
    }
  });

  // 4. Study days history (if tracked)
  if (state.studyDaysHistory && Array.isArray(state.studyDaysHistory)) {
    state.studyDaysHistory.forEach((d) => dates.add(d));
  }

  return dates;
}

/**
 * Calculates streak metrics given the app state and target date (defaults to today).
 */
export function calculateStreak(
  state: AppState,
  today: string = getTodayDateString()
): StreakInfo {
  const studyDates = getAllStudyDates(state);

  const studiedToday = studyDates.has(today);
  const yesterday = addCalendarDays(today, -1);
  const studiedYesterday = studyDates.has(yesterday);

  // 1. Calculate Current Streak
  let currentStreak = 0;

  if (studiedToday) {
    // Walk backwards starting from today
    let checkDate = today;
    while (studyDates.has(checkDate)) {
      currentStreak++;
      checkDate = addCalendarDays(checkDate, -1);
    }
  } else if (studiedYesterday) {
    // Streak is intact from yesterday, waiting for today's study
    let checkDate = yesterday;
    while (studyDates.has(checkDate)) {
      currentStreak++;
      checkDate = addCalendarDays(checkDate, -1);
    }
  } else {
    currentStreak = 0;
  }

  // 2. Calculate Longest Streak
  const sortedDates = Array.from(studyDates).sort();
  let longestStreak = 0;
  let runningStreak = 0;
  let previousDate: string | null = null;

  for (const dateStr of sortedDates) {
    if (!previousDate) {
      runningStreak = 1;
    } else {
      const diff = differenceInCalendarDays(dateStr, previousDate);
      if (diff === 1) {
        runningStreak++;
      } else if (diff > 1) {
        runningStreak = 1;
      }
      // if diff === 0, same date, do not increment
    }
    previousDate = dateStr;
    if (runningStreak > longestStreak) {
      longestStreak = runningStreak;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 3. Rolling 7-day consistency track (from today - 6 up to today)
  const rolling7Days: DayConsistencyItem[] = [];
  const dayAbbrs = ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // Sunday to Saturday
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let offset = -6; offset <= 0; offset++) {
    const dStr = addCalendarDays(today, offset);
    const parsed = parseDateString(dStr);
    const dateObj = new Date(parsed.year, parsed.month, parsed.day);
    const dayOfWeek = dateObj.getDay();

    rolling7Days.push({
      dateStr: dStr,
      dayNumber: parsed.day,
      dayOfWeekAbbr: dayAbbrs[dayOfWeek],
      dayName: dayNames[dayOfWeek],
      isToday: offset === 0,
      hasStudied: studyDates.has(dStr),
    });
  }

  const weeklyActiveDaysCount = rolling7Days.filter((d) => d.hasStudied).length;
  const weeklyCompletionPercentage = Math.round((weeklyActiveDaysCount / 7) * 100);

  // 4. Milestone Calculation
  let nextMilestone = STREAK_MILESTONES[0];
  let previousMilestoneFloor = 0;

  for (let i = 0; i < STREAK_MILESTONES.length; i++) {
    const m = STREAK_MILESTONES[i];
    if (currentStreak < m) {
      nextMilestone = m;
      previousMilestoneFloor = i > 0 ? STREAK_MILESTONES[i - 1] : 0;
      break;
    }
    if (i === STREAK_MILESTONES.length - 1) {
      nextMilestone = m + 30;
      previousMilestoneFloor = m;
    }
  }

  const span = Math.max(1, nextMilestone - previousMilestoneFloor);
  const progressInSpan = Math.max(0, currentStreak - previousMilestoneFloor);
  const milestoneProgressPercentage = Math.min(
    100,
    Math.round((progressInSpan / span) * 100)
  );
  const milestoneTitle = MILESTONE_TITLES[nextMilestone] || `${nextMilestone}-Day Milestone`;

  // Status message
  let statusMessage = '';
  if (studiedToday) {
    statusMessage =
      currentStreak > 1
        ? `Streak active · ${currentStreak} days consecutive`
        : 'Day 1 completed · Rhythm initiated';
  } else if (studiedYesterday) {
    statusMessage = `Revise today to extend your ${currentStreak}-day streak`;
  } else {
    statusMessage = 'Complete a revision to start your streak';
  }

  return {
    currentStreak,
    longestStreak,
    studiedToday,
    studiedYesterday,
    rolling7Days,
    weeklyActiveDaysCount,
    weeklyCompletionPercentage,
    nextMilestone,
    milestoneProgressPercentage,
    milestoneTitle,
    statusMessage,
  };
}
