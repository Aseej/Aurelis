/**
 * AURELIS Revision Scheduling Engine
 *
 * Implements calendar-pure date arithmetic for spaced-repetition schedules.
 * Avoids fragile millisecond arithmetic to correctly handle leap years,
 * month transitions, year boundaries, and daylight-saving time shifts.
 */

import { ReviewScheduleItem, ReviewStatus, RecallRating } from '../types';

/** Default day offsets from initial study date: Day 1 (0), Day 3 (2), Day 5 (4), Day 7 (6), Day 14 (13), Day 21 (20), Day 28 (27) */
export const DEFAULT_REVISION_INTERVALS = [0, 2, 4, 6, 13, 20, 27];

export const STAGE_NAMES = [
  'Learn',
  'Revision 1',
  'Revision 2',
  'Weekly Test',
  'Review 1',
  'Review 2',
  'Review 3',
];

/**
 * Parses YYYY-MM-DD string into explicit calendar components [year, monthIndex, day].
 * monthIndex is 0-indexed (0 = Jan, 11 = Dec).
 */
export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  return { year, month, day };
}

/**
 * Formats calendar components or Date object into pristine YYYY-MM-DD.
 */
export function formatDate(year: number, monthIndex: number, day: number): string {
  const y = year.toString().padStart(4, '0');
  const m = (monthIndex + 1).toString().padStart(2, '0');
  const d = day.toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Adds an exact integer number of calendar days to a YYYY-MM-DD date.
 * Leverages local Date constructor with explicit year, monthIndex, day + daysAdded.
 * This guarantees proper handling of 28/29/30/31-day months and leap years without DST drift.
 */
export function addCalendarDays(baseDateStr: string, daysToAdd: number): string {
  const { year, month, day } = parseDateString(baseDateStr);
  // Using explicit Date constructor year, monthIndex, date handles rollover safely
  const result = new Date(year, month, day + daysToAdd);
  return formatDate(result.getFullYear(), result.getMonth(), result.getDate());
}

/**
 * Returns today's date formatted as YYYY-MM-DD in the user's local timezone.
 */
export function getTodayDateString(): string {
  const now = new Date();
  return formatDate(now.getFullYear(), now.getMonth(), now.getDate());
}

/**
 * Calculates signed difference in days between two YYYY-MM-DD dates: (dateA - dateB).
 * Positive means dateA is after dateB.
 */
export function differenceInCalendarDays(dateA: string, dateB: string): number {
  const a = parseDateString(dateA);
  const b = parseDateString(dateB);
  const utcDateA = Date.UTC(a.year, a.month, a.day);
  const utcDateB = Date.UTC(b.year, b.month, b.day);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((utcDateA - utcDateB) / msPerDay);
}

/**
 * Formats a YYYY-MM-DD date into human-readable format (e.g., "Oct 8, 2026" or "Today")
 */
export function formatDisplayDate(dateStr: string, includeRelative = true): string {
  if (!dateStr) return '';
  const today = getTodayDateString();
  const diff = differenceInCalendarDays(dateStr, today);

  if (includeRelative) {
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';
  }

  const { year, month, day } = parseDateString(dateStr);
  const dateObj = new Date(year, month, day);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Generates the full 7-step spaced repetition schedule for a topic starting on studiedDate.
 */
export function generateSchedule(
  topicId: string,
  studiedDate: string,
  customIntervals: number[] = DEFAULT_REVISION_INTERVALS
): ReviewScheduleItem[] {
  const intervals = customIntervals.length > 0 ? customIntervals : DEFAULT_REVISION_INTERVALS;
  const today = getTodayDateString();

  return intervals.map((offset, index) => {
    const scheduledDate = addCalendarDays(studiedDate, offset);
    const stageName = STAGE_NAMES[index] || `Revision ${index}`;
    const isLearnStage = index === 0;

    let initialStatus: ReviewStatus = 'scheduled';
    let completedDate: string | undefined = undefined;

    // The initial "Learn" session is completed on the day studied
    if (isLearnStage) {
      initialStatus = 'completed';
      completedDate = studiedDate;
    } else {
      const diffFromToday = differenceInCalendarDays(today, scheduledDate);
      if (diffFromToday > 0) {
        initialStatus = 'overdue';
      }
    }

    return {
      id: `${topicId}_step_${index}`,
      topicId,
      stepIndex: index,
      stageName,
      intervalDaysFromStart: offset,
      scheduledDate,
      completedDate,
      status: initialStatus,
      confidenceRating: isLearnStage ? 'okay' : undefined,
    };
  });
}

/**
 * Safely recalculates future uncompleted review dates if studiedDate is edited,
 * preserving any already completed reviews and recall history.
 */
export function recalculateScheduleOnDateChange(
  currentSchedule: ReviewScheduleItem[],
  newStudiedDate: string,
  customIntervals: number[] = DEFAULT_REVISION_INTERVALS
): ReviewScheduleItem[] {
  const intervals = customIntervals.length > 0 ? customIntervals : DEFAULT_REVISION_INTERVALS;
  const today = getTodayDateString();

  return currentSchedule.map((item, index) => {
    // If review was already completed, keep historical record intact
    if (item.status === 'completed') {
      return item;
    }

    const offset = intervals[index] ?? item.intervalDaysFromStart;
    const newScheduledDate = addCalendarDays(newStudiedDate, offset);
    const diffFromToday = differenceInCalendarDays(today, newScheduledDate);
    const newStatus: ReviewStatus = diffFromToday > 0 ? 'overdue' : 'scheduled';

    return {
      ...item,
      intervalDaysFromStart: offset,
      scheduledDate: newScheduledDate,
      status: newStatus,
    };
  });
}

/**
 * Updates dynamic review statuses (scheduled vs overdue) based on current date.
 */
export function refreshReviewStatuses(
  schedule: ReviewScheduleItem[],
  currentDate: string = getTodayDateString()
): ReviewScheduleItem[] {
  return schedule.map((item) => {
    if (item.status === 'completed' || item.status === 'skipped') {
      return item;
    }

    const diff = differenceInCalendarDays(currentDate, item.scheduledDate);
    if (diff > 0) {
      return { ...item, status: 'overdue' };
    }
    return { ...item, status: 'scheduled' };
  });
}

/**
 * Generates transparent explanation of why this review is due.
 */
export function getDueReasonExplanation(
  item: ReviewScheduleItem,
  studiedDate: string,
  today: string = getTodayDateString()
): string {
  const diffFromToday = differenceInCalendarDays(today, item.scheduledDate);
  const daysSinceStudied = differenceInCalendarDays(today, studiedDate);

  if (item.stepIndex === 3) {
    return `Due for Day 7 Weekly Test (${daysSinceStudied} days after initial study).`;
  }
  if (diffFromToday > 0) {
    return `Overdue by ${diffFromToday} ${diffFromToday === 1 ? 'day' : 'days'} (scheduled for ${formatDisplayDate(item.scheduledDate, false)}).`;
  }
  if (diffFromToday === 0) {
    if (item.intervalDaysFromStart === 0) {
      return 'Initial learning session logged for today.';
    }
    return `Due today (${item.stageName}) based on your ${item.intervalDaysFromStart}-day interval.`;
  }
  return `Scheduled for ${formatDisplayDate(item.scheduledDate)} (in ${Math.abs(diffFromToday)} days).`;
}

/**
 * Adaptive scheduling adjustment:
 * If the user rated their recall as 'hard', suggest an earlier check-in or flag for priority review.
 */
export function applyAdaptiveAdjustment(
  schedule: ReviewScheduleItem[],
  completedStepIndex: number,
  rating: RecallRating,
  today: string = getTodayDateString()
): ReviewScheduleItem[] {
  // If recall was hard, accelerate the very next review if it is scheduled more than 2 days away
  if (rating === 'hard') {
    const nextItemIndex = completedStepIndex + 1;
    if (nextItemIndex < schedule.length) {
      const nextItem = schedule[nextItemIndex];
      if (nextItem.status !== 'completed') {
        const daysUntilNext = differenceInCalendarDays(nextItem.scheduledDate, today);
        // Bring it closer: 1 or 2 days from now instead of waiting full interval
        if (daysUntilNext > 2) {
          const acceleratedDate = addCalendarDays(today, 2);
          const updated = [...schedule];
          updated[nextItemIndex] = {
            ...nextItem,
            scheduledDate: acceleratedDate,
            status: 'scheduled',
          };
          return updated;
        }
      }
    }
  }
  return schedule;
}
