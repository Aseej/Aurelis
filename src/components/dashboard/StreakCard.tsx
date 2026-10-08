import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Check, ArrowRight, Award, Zap } from 'lucide-react';

export const StreakCard: React.FC = () => {
  const { streakInfo, todayReviewsDue, startReviewSession, recordDailyCheckin } = useApp();

  const {
    currentStreak,
    longestStreak,
    studiedToday,
    rolling7Days,
    weeklyActiveDaysCount,
    weeklyCompletionPercentage,
    nextMilestone,
    milestoneProgressPercentage,
    milestoneTitle,
    statusMessage,
  } = streakInfo;

  return (
    <section
      aria-label="Daily Study Streak & Consistency Tracker"
      className="rounded-xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216] transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Column: Streak Numerical Counter & Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400/10 text-amber-500 ring-1 ring-amber-400/25 dark:bg-amber-400/10 dark:text-amber-400">
            <Flame className="h-5 w-5 sm:h-6 sm:w-6 fill-amber-400/20 text-amber-500 dark:text-amber-400" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
                {String(currentStreak).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
              </span>

              {longestStreak > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
                  <span aria-hidden="true">·</span>
                  <span>Best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}</span>
                </span>
              )}
            </div>

            {/* Unboxed Status Metadata line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <span className={studiedToday ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                {statusMessage}
              </span>
              {longestStreak > 0 && (
                <span className="sm:hidden text-neutral-400 font-mono">
                  · Best: {longestStreak}d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Column: Progress Visuals */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100 dark:border-neutral-850">
          {/* Progress Visual 1: 7-Day Rolling Consistency Track */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                7-Day Consistency Track
              </span>
              <span className="font-mono tabular-nums">
                {weeklyActiveDaysCount}/7 days ({weeklyCompletionPercentage}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {rolling7Days.map((day) => {
                const isDone = day.hasStudied;
                const isToday = day.isToday;

                return (
                  <div
                    key={day.dateStr}
                    title={`${day.dayName} (${day.dateStr}): ${isDone ? 'Study completed' : 'No activity logged'}`}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg text-xs font-mono transition-all ${
                        isDone
                          ? 'bg-amber-400/20 text-amber-700 border border-amber-400/50 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/35 font-bold shadow-xs'
                          : isToday
                          ? 'border border-dashed border-amber-400/70 bg-amber-400/5 text-amber-600 dark:text-amber-400 dark:border-amber-400/60 font-semibold'
                          : 'border border-neutral-200 bg-neutral-50/60 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-500'
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      ) : (
                        <span className="text-[11px] tabular-nums">{day.dayNumber}</span>
                      )}
                    </div>
                    <span
                      className={`text-[10px] uppercase font-mono ${
                        isToday
                          ? 'font-bold text-amber-600 dark:text-amber-400'
                          : 'text-neutral-400 dark:text-neutral-500'
                      }`}
                    >
                      {day.dayOfWeekAbbr}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress Visual 2: Milestone Meter & Fast Action */}
          <div className="space-y-1.5 sm:min-w-[190px] border-t sm:border-t-0 sm:border-l border-neutral-100 sm:border-neutral-200/60 sm:pl-5 pt-3 sm:pt-0 dark:border-neutral-800/60">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-neutral-600 dark:text-neutral-300 font-medium truncate max-w-[130px]">
                {milestoneTitle}
              </span>
              <span className="font-mono text-neutral-400 tabular-nums">
                {currentStreak}/{nextMilestone}d
              </span>
            </div>

            {/* Sleek Milestone Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-400 transition-all duration-500 ease-out"
                style={{ width: `${milestoneProgressPercentage}%` }}
              />
            </div>

            {/* Contextual Action */}
            <div className="pt-0.5 flex items-center justify-between text-[11px]">
              {!studiedToday ? (
                todayReviewsDue.length > 0 ? (
                  <button
                    onClick={() => startReviewSession(todayReviewsDue[0].topic.id, todayReviewsDue[0].item.stepIndex)}
                    className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>Revise now to lock in streak</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={recordDailyCheckin}
                    className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Zap className="h-3 w-3" />
                    <span>Check in for today</span>
                  </button>
                )
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  <span>Streak saved today</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
