import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getTodayDateString,
  formatDisplayDate,
  getDueReasonExplanation,
} from '../../utils/scheduler';
import { getMasteryBadgeClass } from '../../utils/mastery';
import { StreakCard } from './StreakCard';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Plus,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    state,
    todayReviewsDue,
    todayCompletedReviews,
    overdueReviews,
    weeklyTestsDue,
    topicsNeedingAttention,
    startReviewSession,
    setIsAddTopicOpen,
    setActiveView,
    purgeDemoData,
  } = useApp();

  const todayStr = getTodayDateString();

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Today's topics logged (studied today)
  const newTopicsToday = useMemo(() => {
    return state.topics.filter((t) => t.studiedDate === todayStr);
  }, [state.topics, todayStr]);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    state.subjects.forEach((s) => map.set(s.id, { name: s.name, color: s.color }));
    return map;
  }, [state.subjects]);

  return (
    <div className="space-y-8 pb-12">
      {/* Demo Data Reset Banner */}
      {state.isDemoData && (
        <section className="rounded-xl border border-amber-300/40 bg-amber-50/60 p-3.5 sm:p-4 dark:border-amber-400/20 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-neutral-700 dark:text-neutral-300 space-y-0.5">
            <div className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
              <span>Demo Preview Active</span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Currently viewing sample Class 11/12 Physics, Chemistry, and Math records. Reset to start with a fresh slate.
            </p>
          </div>
          <button
            onClick={() => purgeDemoData()}
            className="self-start sm:self-auto rounded-lg border border-amber-400/40 bg-white dark:bg-neutral-900 px-3 py-1.5 font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-neutral-800 transition-colors shadow-xs shrink-0"
          >
            Reset All Demo Data
          </button>
        </section>
      )}

      {/* 1. Dashboard Header */}
      <section className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              {greeting}, {state.settings.studentName || 'Aakash Panjiyar'}
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-xs transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-850 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              <Plus className="h-3.5 w-3.5 text-amber-500" />
              <span>Record Topic</span>
            </button>
          </div>
        </div>
      </section>

      {/* Daily Study Streak & 7-Day Consistency Tracker */}
      <StreakCard />

      {/* 2. Today's Focus Overview Metrics (No pills, clean tabular numbers) */}
      <section className="rounded-xl border border-neutral-200/90 bg-white p-4 sm:p-5 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216]">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Today's Focus
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200/60 dark:divide-neutral-800/60">
          {/* Reviews Due */}
          <div className="pt-2 sm:pt-0 sm:px-3 first:pl-0">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
                {String(todayReviewsDue.length).padStart(2, '0')}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Due</span>
            </div>
            <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Scheduled Revisions
            </div>
          </div>

          {/* New Topics Studied Today */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-neutral-900 dark:text-neutral-50">
                {String(newTopicsToday.length).padStart(2, '0')}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Logged</span>
            </div>
            <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              New Topics Today
            </div>
          </div>

          {/* Weekly Tests */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
                {String(weeklyTestsDue.length).padStart(2, '0')}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Day 7</span>
            </div>
            <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Weekly Tests Due
            </div>
          </div>

          {/* Overdue */}
          <div className="pt-2 sm:pt-0 sm:px-3">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-2xl sm:text-3xl font-semibold tabular-nums ${
                  overdueReviews.length > 0 ? 'text-rose-500' : 'text-neutral-400'
                }`}
              >
                {String(overdueReviews.length).padStart(2, '0')}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Overdue</span>
            </div>
            <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              Need Immediate Attention
            </div>
          </div>
        </div>
      </section>

      {/* 3. Primary Revision Queue */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Active Revision Queue
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Spaced repetitions ready for active recall today
            </p>
          </div>
          {todayReviewsDue.length > 0 && (
            <span className="text-xs text-neutral-400 font-mono tabular-nums">
              {todayReviewsDue.length} item{todayReviewsDue.length === 1 ? '' : 's'} waiting
            </span>
          )}
        </div>

        {todayReviewsDue.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-800">
            <CheckCircle2 className="mx-auto h-8 w-8 text-amber-500/80 mb-2" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Nothing is due today.
            </h3>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              Enjoy the head start, or log new chapters you studied today to expand your spaced repetition engine.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setIsAddTopicOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add New Topic</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {todayReviewsDue.map(({ topic, item }) => {
              const subject = subjectMap.get(topic.subjectId) || {
                name: 'General',
                color: '#d4af37',
              };
              const isOverdue = item.status === 'overdue';
              const reason = getDueReasonExplanation(item, topic.studiedDate, todayStr);

              return (
                <div
                  key={item.id}
                  className={`group rounded-xl border bg-white p-4 transition-all hover:border-neutral-400 dark:bg-[#111216] dark:hover:border-neutral-700 ${
                    isOverdue
                      ? 'border-rose-300 dark:border-rose-900/50'
                      : 'border-neutral-200/90 dark:border-neutral-800/90'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Metadata & Titles (Clean Zero-Pill Hierarchy) */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Quiet Unboxed Metadata Line with typographic separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                        <span
                          className="font-semibold uppercase tracking-wider text-[11px]"
                          style={{ color: subject.color }}
                        >
                          {subject.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{topic.chapterName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-neutral-400">
                          ~{topic.estimatedDurationMinutes} min
                        </span>
                        {isOverdue && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-rose-500 font-medium">Overdue</span>
                          </>
                        )}
                      </div>

                      {/* Topic Title */}
                      <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {topic.title}
                      </h3>

                      {/* Reason & Spaced Repetition Kicker */}
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {reason}
                      </p>
                    </div>

                    {/* Right: Step Indicator & CTA */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                          {item.stageName}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-mono">
                          Step {item.stepIndex + 1} of 7
                        </div>
                      </div>

                      <button
                        onClick={() => startReviewSession(topic.id, item.stepIndex)}
                        className="flex h-9 items-center gap-2 rounded-lg bg-neutral-900 px-3.5 text-xs font-semibold text-amber-300 shadow-sm transition-all hover:bg-neutral-800 active:scale-95 dark:bg-amber-400/15 dark:text-amber-300 dark:border dark:border-amber-400/30 dark:hover:bg-amber-400/25"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span className="whitespace-nowrap">Start Review</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Weekly Test Callout (if Day 7 test is due) */}
      {weeklyTestsDue.length > 0 && (
        <section className="rounded-xl border border-amber-300/40 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-950/10">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                <FileCheck2 className="h-4 w-4" />
                <span>Day 7 Weekly Testing Due</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                You have {weeklyTestsDue.length} topic{weeklyTestsDue.length === 1 ? '' : 's'} that reached the 7-day milestone. Complete a diagnostic test to measure retention before moving to bi-weekly reviews.
              </p>
            </div>
            <button
              onClick={() => setActiveView('tests')}
              className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
            >
              <span>Go to Tests</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* 5. Topics Needing Attention (Surfaced from error logs & low recall) */}
      {topicsNeedingAttention.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                Topics Needing Attention
              </h2>
            </div>
            <button
              onClick={() => setActiveView('errors')}
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300"
            >
              View Error Notebook
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {topicsNeedingAttention.slice(0, 4).map((topic) => {
              const subj = subjectMap.get(topic.subjectId);
              const badgeClass = getMasteryBadgeClass(topic.mastery);
              return (
                <div
                  key={topic.id}
                  onClick={() => startReviewSession(topic.id)}
                  className="group cursor-pointer rounded-xl border border-neutral-200/80 bg-white p-3.5 transition-all hover:border-neutral-400 dark:border-neutral-800/80 dark:bg-[#111216] dark:hover:border-neutral-700"
                >
                  <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    <span style={{ color: subj?.color }} className="font-semibold">
                      {subj?.name}
                    </span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${badgeClass}`}>
                      {topic.mastery.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {topic.title}
                  </h4>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{topic.chapterName}</span>
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                      Revise now <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 6. Completed Revisions Today */}
      {todayCompletedReviews.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
              Completed Today ({todayCompletedReviews.length})
            </h2>
          </div>

          <div className="divide-y divide-neutral-200/60 rounded-xl border border-neutral-200/80 bg-white dark:divide-neutral-800/60 dark:border-neutral-800/80 dark:bg-[#111216]">
            {todayCompletedReviews.map(({ topic, item }) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 text-xs"
              >
                <div className="truncate pr-4">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                    {topic.title}
                  </span>
                  <span className="text-neutral-400 ml-2">· {item.stageName}</span>
                </div>
                <div className="text-neutral-400 font-mono text-[11px] shrink-0">
                  Recall: {item.confidenceRating || 'Logged'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
