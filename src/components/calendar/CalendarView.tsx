import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  parseDateString,
  formatDate,
  getTodayDateString,
  formatDisplayDate,
} from '../../utils/scheduler';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';

export const CalendarView: React.FC = () => {
  const {
    state,
    selectedCalendarDate,
    setSelectedCalendarDate,
    startReviewSession,
    setIsAddTopicOpen,
  } = useApp();

  const { t, language, formatDate: i18nFormatDate, isRTL } = useI18n();

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

    // Next month padding to fill grid
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

  const monthName = useMemo(() => {
    return i18nFormatDate(new Date(currentYear, currentMonth, 1), {
      month: 'long',
      year: 'numeric',
    });
  }, [i18nFormatDate, currentYear, currentMonth]);

  // Dynamic localized weekday headers (Sun -> Sat)
  const weekdayHeaders = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6].map((dayOffset) => {
      const d = new Date(2026, 0, 4 + dayOffset); // 2026-01-04 was Sunday
      try {
        return new Intl.DateTimeFormat(language, { weekday: 'short' }).format(d);
      } catch (err) {
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOffset];
      }
    });
  }, [language]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('calendar.title', 'Revision Calendar')}
          </h1>
          <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
            {t('calendar.subtitle', 'Plan and inspect your spaced repetition schedule across days and weeks')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={jumpToToday}
            className="btn-glass-secondary rounded-xl px-3 py-1.5 text-xs font-medium transition-all"
          >
            {t('common.today', 'Today')}
          </button>

          <div className="flex items-center rounded-xl glass-subtle border border-black/[0.08] dark:border-white/[0.08] p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] rounded-lg transition-colors"
              aria-label="Previous Month"
            >
              {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <span className="px-3 text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC] min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] rounded-lg transition-colors"
              aria-label="Next Month"
            >
              {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Matrix (2 cols on desktop) */}
        <div className="lg:col-span-2 rounded-3xl glass-premium p-4 sm:p-6 transition-all">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 mb-3 text-center text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            {weekdayHeaders.map((dayName, idx) => (
              <span key={idx}>{dayName}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map(({ dateStr, dayNumber, isCurrentMonth }) => {
              const isSelected = dateStr === selectedCalendarDate;
              const isToday = dateStr === todayStr;
              const ev = eventsByDate.get(dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedCalendarDate(dateStr)}
                  className={`group relative flex flex-col items-center justify-between min-h-[58px] sm:min-h-[72px] rounded-2xl p-1.5 transition-all text-left ${
                    isSelected
                      ? 'border border-[#E6C27A] bg-[#E6C27A]/15 text-[#20232A] dark:text-[#FFE6AD] shadow-xs'
                      : isCurrentMonth
                      ? 'border border-black/[0.04] hover:border-black/[0.12] bg-white/40 dark:border-white/[0.04] dark:bg-white/[0.02] dark:hover:border-white/[0.12]'
                      : 'opacity-25 border border-transparent'
                  }`}
                >
                  {/* Day Number */}
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      isToday
                        ? 'flex h-5 w-5 items-center justify-center rounded-full bg-[#E6C27A] font-bold text-[#090B10]'
                        : isSelected
                        ? 'font-bold text-[#A97B32] dark:text-[#E6C27A]'
                        : 'text-[#20232A] dark:text-[#F6F3EC]'
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {/* Indicators */}
                  <div className="mt-1 flex flex-wrap justify-center gap-1">
                    {ev?.dueCount ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E6C27A]" title={`${ev.dueCount} reviews due`} />
                    ) : null}
                    {ev?.overdueCount ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#F87171]" title={`${ev.overdueCount} overdue`} />
                    ) : null}
                    {ev?.testCount ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#60A5FA]" title="Weekly Test" />
                    ) : null}
                    {ev?.completedCount ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#34D399]" title={`${ev.completedCount} completed`} />
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-5 border-t border-black/[0.06] pt-3 text-[11px] text-[#858A93] dark:border-white/[0.08] dark:text-[#777F8C]">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#E6C27A]" />
              <span>Review Due</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#60A5FA]" />
              <span>Weekly Test</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#F87171]" />
              <span>Overdue</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#34D399]" />
              <span>Completed</span>
            </span>
          </div>
        </div>

        {/* Selected Date Inspector (1 col on desktop) */}
        <div className="rounded-3xl glass-subtle p-5 sm:p-6 space-y-4 transition-all">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 dark:border-white/[0.08]">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                Selected Schedule
              </div>
              <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                {formatDisplayDate(selectedCalendarDate || todayStr, true)}
              </h3>
            </div>

            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="btn-gold-primary flex h-8 items-center gap-1 rounded-xl px-2.5 text-[11px] font-semibold shadow-xs"
            >
              <Plus className="h-3 w-3 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>

          {/* Events List */}
          {selectedDateEvents.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
              No spaced repetitions scheduled for this date.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {selectedDateEvents.map(({ topic, step }, idx) => {
                const isCompleted = step.status === 'completed';
                const isOverdue = step.status === 'overdue';

                return (
                  <div
                    key={`${topic.id}_${step.stepIndex}_${idx}`}
                    className="rounded-2xl glass-subtle p-3.5 text-xs space-y-1.5 transition-all hover:border-[#E6C27A]/30"
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#858A93] dark:text-[#777F8C]">
                      <span className="font-medium text-[#686D77] dark:text-[#A7ABB5]">
                        {step.stageName} (Step {step.stepIndex + 1})
                      </span>
                      <span className="font-mono">~{topic.estimatedDurationMinutes}m</span>
                    </div>

                    <div className="font-semibold text-[#20232A] dark:text-[#F6F3EC] truncate">
                      {topic.title}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-[#858A93] dark:text-[#777F8C] truncate max-w-[140px]">
                        {topic.chapterName}
                      </span>

                      {!isCompleted ? (
                        <button
                          onClick={() => startReviewSession(topic.id, step.stepIndex)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-[#A97B32] dark:text-[#E6C27A] hover:underline"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span>Review</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
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
