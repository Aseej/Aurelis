import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, Check, ArrowRight, Zap } from 'lucide-react';

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
      className="rounded-2xl glass-premium p-4 sm:p-5 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Column: Streak Numerical Counter & Status */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative flex h-12 w-12 sm:h-13 sm:w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E6C27A]/20 to-[#B88A43]/10 text-[#A97B32] dark:text-[#E6C27A] border border-[#E6C27A]/30 shadow-xs">
            <Flame className="h-6 w-6 fill-[#E6C27A]/30 text-[#B88A43] dark:text-[#E6C27A]" />
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-2xl" />
          </div>

          <div className="space-y-0.5 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
                {String(currentStreak).padStart(2, '0')}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#686D77] dark:text-[#A7ABB5]">
                {currentStreak === 1 ? 'Day Streak' : 'Days Streak'}
              </span>

              {longestStreak > 0 && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#858A93] dark:text-[#777F8C] font-mono">
                  <span aria-hidden="true">·</span>
                  <span>Best: {longestStreak} {longestStreak === 1 ? 'day' : 'days'}</span>
                </span>
              )}
            </div>

            {/* Unboxed Status Metadata line */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#686D77] dark:text-[#A7ABB5]">
              <span className={studiedToday ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-[#A97B32] dark:text-[#E6C27A] font-medium'}>
                {statusMessage}
              </span>
              {longestStreak > 0 && (
                <span className="sm:hidden text-[#858A93] dark:text-[#777F8C] font-mono">
                  · Best: {longestStreak}d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Column: Progress Visuals */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-black/[0.06] dark:border-white/[0.08]">
          {/* Progress Visual 1: 7-Day Rolling Consistency Track */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#858A93] dark:text-[#777F8C]">
              <span className="font-medium text-[#20232A] dark:text-[#F6F3EC]">
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
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl text-xs font-mono transition-all ${
                        isDone
                          ? 'bg-[#E6C27A]/25 text-[#8C6221] border border-[#E6C27A]/50 dark:bg-[#E6C27A]/20 dark:text-[#FFE6AD] dark:border-[#E6C27A]/40 font-bold shadow-xs'
                          : isToday
                          ? 'border border-dashed border-[#E6C27A] bg-[#E6C27A]/10 text-[#A97B32] dark:text-[#E6C27A] font-semibold'
                          : 'border border-black/[0.08] bg-black/[0.02] text-[#858A93] dark:border-white/[0.08] dark:bg-white/[0.02] dark:text-[#777F8C]'
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      ) : (
                        <span className="text-[11px] tabular-nums">{day.dayNumber}</span>
                      )}
                    </div>
                    <span
                      className={`text-[9px] uppercase font-mono ${
                        isToday
                          ? 'font-bold text-[#A97B32] dark:text-[#E6C27A]'
                          : 'text-[#858A93] dark:text-[#777F8C]'
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
          <div className="space-y-1.5 sm:min-w-[190px] border-t sm:border-t-0 sm:border-l border-black/[0.06] sm:pl-5 pt-3 sm:pt-0 dark:border-white/[0.08]">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#686D77] dark:text-[#A7ABB5] font-medium truncate max-w-[130px]">
                {milestoneTitle}
              </span>
              <span className="font-mono text-[#858A93] dark:text-[#777F8C] tabular-nums">
                {currentStreak}/{nextMilestone}d
              </span>
            </div>

            {/* Sleek Milestone Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-black/[0.08] dark:bg-white/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B88A43] via-[#E6C27A] to-[#FFE6AD] transition-all duration-500 ease-out"
                style={{ width: `${milestoneProgressPercentage}%` }}
              />
            </div>

            {/* Contextual Action */}
            <div className="pt-0.5 flex items-center justify-between text-[11px]">
              {!studiedToday ? (
                todayReviewsDue.length > 0 ? (
                  <button
                    onClick={() => startReviewSession(todayReviewsDue[0].topic.id, todayReviewsDue[0].item.stepIndex)}
                    className="inline-flex items-center gap-1 font-semibold text-[#A97B32] dark:text-[#E6C27A] hover:underline"
                  >
                    <span>Revise now to lock in streak</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    onClick={recordDailyCheckin}
                    className="inline-flex items-center gap-1 font-semibold text-[#A97B32] dark:text-[#E6C27A] hover:underline"
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
