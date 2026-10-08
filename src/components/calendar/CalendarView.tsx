import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  parseDateString,
  formatDate,
  getTodayDateString,
  formatDisplayDate,
  differenceInCalendarDays,
} from '../../utils/scheduler';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    state,
    selectedCalendarDate,
    setSelectedCalendarDate,
    startReviewSession,
    setIsAddTopicOpen,
  } = useApp();

  const todayStr = getTodayDateString();
  const initialDateObj = parseDateString(selectedCalendarDate || todayStr);

  const [currentYear, setCurrentYear] = useState(initialDateObj.year);
  const [currentMonth, setCurrentMonth] = useState(initialDateObj.month); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const jumpToToday = () => {
    const now = parseDateString(todayStr);
    setCurrentYear(now.year);
    setCurrentMonth(now.month);
    setSelectedCalendarDate(todayStr);
  };

  // Build calendar matrix for currentMonth
  const calendarDays = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      days.push({
        dateStr: formatDate(prevY, prevM, d),
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        dateStr: formatDate(currentYear, currentMonth, d),
        dayNumber: d,
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const nextM = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextY = currentMonth === 11 ? currentYear + 1 : currentYear;
      days.push({
        dateStr: formatDate(nextY, nextM, d),
        dayNumber: d,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Map events per date
  const eventsByDate = useMemo(() => {
    const map = new Map<
      string,
      {
        dueCount: number;
        completedCount: number;
        testCount: number;
        overdueCount: number;
        newTopicCount: number;
      }
    >();

    const getEntry = (date: string) => {
      let entry = map.get(date);
      if (!entry) {
        entry = { dueCount: 0, completedCount: 0, testCount: 0, overdueCount: 0, newTopicCount: 0 };
        map.set(date, entry);
      }
      return entry;
    };

    state.topics.forEach((topic) => {
      // New topic on studiedDate
      const studyEntry = getEntry(topic.studiedDate);
      studyEntry.newTopicCount++;

      // Schedules
      topic.schedule.forEach((item) => {
        if (item.stepIndex === 0) return; // Skip step 0 already counted as new topic

        const entry = getEntry(item.scheduledDate);
        if (item.status === 'completed') {
          entry.completedCount++;
        } else if (item.status === 'overdue') {
          entry.overdueCount++;
        } else {
          entry.dueCount++;
        }

        if (item.stepIndex === 3) {
          entry.testCount++;
        }
      });
    });

    return map;
  }, [state.topics]);

  // Events for selected date
  const selectedDateEvents = useMemo(() => {
    const targetDate = selectedCalendarDate || todayStr;
    const items: {
      topic: (typeof state.topics)[0];
      step: (typeof state.topics)[0]['schedule'][0];
    }[] = [];

    state.topics.forEach((topic) => {
      topic.schedule.forEach((step) => {
        if (step.scheduledDate === targetDate || (step.status === 'completed' && step.completedDate === targetDate)) {
          items.push({ topic, step });
        }
      });
    });

    return items;
  }, [state.topics, selectedCalendarDate, todayStr]);

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Revision Calendar
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Map out your spaced repetition schedule across days and weeks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={jumpToToday}
            className="rounded-lg border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-850 dark:text-neutral-300"
          >
            Today
          </button>

          <div className="flex items-center rounded-lg border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-850">
            <button
              onClick={prevMonth}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              aria-label="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-neutral-900 dark:text-neutral-100 min-w-[120px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white"
              aria-label="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Matrix (2 cols on desktop) */}
        <div className="lg:col-span-2 rounded-xl border border-neutral-200/90 bg-white p-3 sm:p-5 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216]">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 mb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map(({ dateStr, dayNumber, isCurrentMonth }) => {
              const isSelected = dateStr === selectedCalendarDate;
              const isToday = dateStr === todayStr;
              const ev = eventsByDate.get(dateStr);

              const hasItems =
                ev &&
                (ev.dueCount > 0 ||
                  ev.completedCount > 0 ||
                  ev.testCount > 0 ||
                  ev.overdueCount > 0 ||
                  ev.newTopicCount > 0);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedCalendarDate(dateStr)}
                  className={`group relative flex flex-col items-center justify-between min-h-[58px] sm:min-h-[72px] rounded-lg p-1.5 transition-all text-left ${
                    isSelected
                      ? 'border border-amber-400 bg-amber-500/10 text-neutral-950 dark:text-white ring-1 ring-amber-400/40'
                      : isCurrentMonth
                      ? 'border border-neutral-100 hover:border-neutral-300 bg-neutral-50/40 dark:border-neutral-850 dark:bg-neutral-900/30 dark:hover:border-neutral-700'
                      : 'opacity-30 border border-transparent'
                  }`}
                >
                  {/* Day Number */}
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isToday
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 font-bold text-neutral-950'
                        : isSelected
                        ? 'font-bold text-amber-500'
                        : 'text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {/* Indicators */}
                  <div className="mt-1 flex flex-wrap justify-center gap-1">
                    {ev?.dueCount ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" title={`${ev.dueCount} reviews due`} />
                    ) : null}
                    {ev?.overdueCount ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title={`${ev.overdueCount} overdue`} />
                    ) : null}
                    {ev?.testCount ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-400" title="Weekly Test" />
                    ) : null}
                    {ev?.completedCount ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" title={`${ev.completedCount} completed`} />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 border-t border-neutral-200/60 pt-3 text-[11px] text-neutral-500 dark:border-neutral-800/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              <span>Review Due</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span>Weekly Test</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Overdue</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Completed</span>
            </span>
          </div>
        </div>

        {/* Selected Date Inspector (1 col on desktop) */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216] space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3 dark:border-neutral-800/60">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Selected Schedule
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {formatDisplayDate(selectedCalendarDate || todayStr, true)}
              </h3>
            </div>

            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="flex h-7 items-center gap-1 rounded-md bg-neutral-900 px-2 text-[11px] font-medium text-amber-300 dark:bg-neutral-800"
            >
              <Plus className="h-3 w-3" />
              <span>Add Topic</span>
            </button>
          </div>

          {/* Events List */}
          {selectedDateEvents.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No revisions scheduled for this date.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {selectedDateEvents.map(({ topic, step }, idx) => {
                const isCompleted = step.status === 'completed';
                const isOverdue = step.status === 'overdue';

                return (
                  <div
                    key={`${topic.id}_${step.stepIndex}_${idx}`}
                    className="rounded-lg border border-neutral-200/80 bg-neutral-50/50 p-3 text-xs dark:border-neutral-800/80 dark:bg-neutral-900/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-medium text-neutral-600 dark:text-neutral-300">
                        {step.stageName} (Step {step.stepIndex + 1})
                      </span>
                      <span className="font-mono">~{topic.estimatedDurationMinutes}m</span>
                    </div>

                    <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {topic.title}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-neutral-500 truncate max-w-[140px]">
                        {topic.chapterName}
                      </span>

                      {!isCompleted ? (
                        <button
                          onClick={() => startReviewSession(topic.id, step.stepIndex)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Review</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-500">
                          Done ({step.confidenceRating || 'Logged'})
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
