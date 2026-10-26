import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  getTodayDateString,
  getDueReasonExplanation,
} from '../../utils/scheduler';
import { getMasteryBadgeClass } from '../../utils/mastery';
import { StreakCard } from './StreakCard';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookOpen,
  Plus,
  FileCheck2,
  Sparkles,
  Calendar,
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

  const { t, formatDate } = useI18n();

  const todayStr = getTodayDateString();

  // Dynamic greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greetingMorning', 'Good morning');
    if (hour < 17) return t('dashboard.greetingAfternoon', 'Good afternoon');
    return t('dashboard.greetingEvening', 'Good evening');
  }, [t]);

  // Today's topics logged (studied today)
  const newTopicsToday = useMemo(() => {
    return state.topics.filter((t) => t.studiedDate === todayStr);
  }, [state.topics, todayStr]);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    state.subjects.forEach((s) => map.set(s.id, { name: s.name, color: s.color }));
    return map;
  }, [state.subjects]);

  const nextFeaturedReview = todayReviewsDue.length > 0 ? todayReviewsDue[0] : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Demo Data Reset Banner */}
      {state.isDemoData && (
        <section className="rounded-2xl glass-subtle border border-[#E6C27A]/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-[#686D77] dark:text-[#A7ABB5] space-y-0.5">
            <div className="font-semibold text-[#8C6221] dark:text-[#FFE6AD] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#E6C27A]" />
              <span>Demo Preview Active</span>
            </div>
            <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
              Currently displaying sample academic syllabus records. Reset to start with a pristine personal study schedule.
            </p>
          </div>
          <button
            onClick={() => purgeDemoData()}
            className="self-start sm:self-auto rounded-xl border border-[#E6C27A]/40 bg-white/70 dark:bg-black/40 px-3.5 py-1.5 font-semibold text-[#8C6221] dark:text-[#FFE6AD] hover:bg-[#E6C27A]/20 transition-all shadow-xs shrink-0"
          >
            {t('nav.resetDemo', 'Reset All Demo Data')}
          </button>
        </section>
      )}

      {/* 1. Dashboard Header */}
      <section className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
              {greeting}, {state.settings.studentName || 'Aakash Panjiyar'}
            </h1>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C] font-mono mt-0.5">
              {formatDate(new Date(), {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="btn-glass-secondary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium shadow-xs transition-all"
            >
              <Plus className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A]" />
              <span>{t('dashboard.addNewTopic', 'Record New Topic')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Daily Study Streak & 7-Day Consistency Tracker */}
      <StreakCard />

      {/* 2. Today's Study Plan (Level 3 Hero Glass focal point) */}
      <section className="rounded-3xl glass-hero p-5 sm:p-7 relative overflow-hidden transition-all">
        {/* Subtle champagne radial illumination behind counts */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#E6C27A]/10 blur-3xl" aria-hidden="true" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A] flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              <span>{t('dashboard.todayRecallSchedule', "Today's Study Plan")}</span>
            </div>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
              {t('queue.subtitle', 'Spaced repetition agenda computed for maximum long-term retention')}
            </p>
          </div>

          {todayReviewsDue.length > 0 && (
            <button
              onClick={() => setActiveView('review')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#A97B32] dark:text-[#FFE6AD] hover:underline self-start sm:self-auto"
            >
              <span>{t('queue.allDue', 'View Full Queue')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* 4 Metric Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-5">
          {/* Reviews Due */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-semibold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
                {String(todayReviewsDue.length).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-[#858A93] dark:text-[#777F8C]">{t('common.due', 'Due')}</span>
            </div>
            <div className="text-xs text-[#686D77] dark:text-[#A7ABB5]">
              {t('calendar.reviewsOnDate', 'Scheduled Revisions')}
            </div>
          </div>

          {/* New Topics Logged */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-semibold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
                {String(newTopicsToday.length).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-[#858A93] dark:text-[#777F8C]">{t('common.today', 'Logged')}</span>
            </div>
            <div className="text-xs text-[#686D77] dark:text-[#A7ABB5]">
              {t('common.topics', 'New Topics Today')}
            </div>
          </div>

          {/* Weekly Tests */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-semibold tabular-nums text-[#A97B32] dark:text-[#E6C27A]">
                {String(weeklyTestsDue.length).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-[#858A93] dark:text-[#777F8C]">{t('nav.tests', 'Milestone')}</span>
            </div>
            <div className="text-xs text-[#686D77] dark:text-[#A7ABB5]">
              {t('stage.test', 'Day 7 Tests Due')}
            </div>
          </div>

          {/* Overdue */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-mono text-3xl sm:text-4xl font-semibold tabular-nums ${
                  overdueReviews.length > 0 ? 'text-[#F87171]' : 'text-[#858A93] dark:text-[#777F8C]'
                }`}
              >
                {String(overdueReviews.length).padStart(2, '0')}
              </span>
              <span className="text-xs font-medium text-[#858A93] dark:text-[#777F8C]">{t('common.overdue', 'Overdue')}</span>
            </div>
            <div className="text-xs text-[#686D77] dark:text-[#A7ABB5]">
              {t('dashboard.attentionNeeded', 'Need Immediate Attention')}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Continue Review Card (when a review is due) */}
      {nextFeaturedReview && (
        <section className="rounded-3xl glass-premium p-5 sm:p-6 border border-[#E6C27A]/30 relative overflow-hidden transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#686D77] dark:text-[#A7ABB5]">
                <span className="h-2 w-2 rounded-full bg-[#E6C27A]" />
                <span className="font-semibold uppercase tracking-wider text-[11px] text-[#A97B32] dark:text-[#E6C27A]">
                  {t('common.recommended', 'Next Recommended Review')}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#858A93] dark:text-[#777F8C]">
                  ~{nextFeaturedReview.topic.estimatedDurationMinutes} min
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-[#858A93] dark:text-[#777F8C]">
                  {nextFeaturedReview.item.stageName} (Step {nextFeaturedReview.item.stepIndex + 1} of 7)
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-[#20232A] dark:text-[#F6F3EC] truncate">
                {nextFeaturedReview.topic.title}
              </h2>

              <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                {subjectMap.get(nextFeaturedReview.topic.subjectId)?.name || 'General'} · {nextFeaturedReview.topic.chapterName} · {getDueReasonExplanation(nextFeaturedReview.item, nextFeaturedReview.topic.studiedDate, todayStr)}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => startReviewSession(nextFeaturedReview.topic.id, nextFeaturedReview.item.stepIndex)}
                className="btn-gold-primary flex h-11 items-center gap-2.5 rounded-xl px-5 text-xs font-semibold shadow-md active:scale-95 transition-all"
              >
                <Play className="h-4 w-4 fill-current" />
                <span className="tracking-wide">{t('dashboard.startSession', 'Start Review')}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. Active Revision Queue (Next Up) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
              Active Revision Queue
            </h2>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
              Spaced repetitions ready for active recall today
            </p>
          </div>
          {todayReviewsDue.length > 0 && (
            <span className="text-xs text-[#858A93] dark:text-[#777F8C] font-mono tabular-nums">
              {todayReviewsDue.length} waiting
            </span>
          )}
        </div>

        {todayReviewsDue.length === 0 ? (
          <div className="rounded-2xl glass-subtle border border-dashed border-black/[0.1] dark:border-white/[0.1] p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-[#A97B32] dark:text-[#E6C27A] mb-2" />
            <h3 className="text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              All caught up for today!
            </h3>
            <p className="mt-1 text-xs text-[#858A93] dark:text-[#777F8C] max-w-sm mx-auto">
              Nothing is currently due. You can record newly studied chapters or inspect upcoming reviews in the calendar.
            </p>
            <div className="mt-4">
              <button
                onClick={() => setIsAddTopicOpen(true)}
                className="btn-gold-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
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
                  className={`group rounded-2xl p-4 transition-all ${
                    isOverdue
                      ? 'glass-premium border border-[#F87171]/40'
                      : 'glass-subtle hover:border-[#E6C27A]/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Metadata & Titles (Clean Zero-Pill Hierarchy) */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Quiet Unboxed Metadata Line with typographic separators */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#686D77] dark:text-[#A7ABB5]">
                        <span
                          className="font-semibold uppercase tracking-wider text-[11px]"
                          style={{ color: subject.color }}
                        >
                          {subject.name}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{topic.chapterName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[#858A93] dark:text-[#777F8C]">
                          ~{topic.estimatedDurationMinutes} min
                        </span>
                        {isOverdue && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#F87171] font-medium">Overdue</span>
                          </>
                        )}
                      </div>

                      {/* Topic Title */}
                      <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC] truncate">
                        {topic.title}
                      </h3>

                      {/* Reason & Spaced Repetition Kicker */}
                      <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                        {reason}
                      </p>
                    </div>

                    {/* Right: Step Indicator & CTA */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      <div className="text-right hidden sm:block">
                        <div className="text-xs font-medium text-[#20232A] dark:text-[#F6F3EC]">
                          {item.stageName}
                        </div>
                        <div className="text-[11px] text-[#858A93] dark:text-[#777F8C] font-mono">
                          Step {item.stepIndex + 1} of 7
                        </div>
                      </div>

                      <button
                        onClick={() => startReviewSession(topic.id, item.stepIndex)}
                        className="btn-gold-primary flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all active:scale-95"
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

      {/* 5. Weekly Test Callout (if Day 7 test is due) */}
      {weeklyTestsDue.length > 0 && (
        <section className="rounded-2xl glass-premium border border-[#E6C27A]/30 p-4.5 transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
                <FileCheck2 className="h-4 w-4" />
                <span>Day 7 Weekly Testing Milestone Due</span>
              </div>
              <p className="text-xs text-[#686D77] dark:text-[#A7ABB5]">
                You have {weeklyTestsDue.length} topic{weeklyTestsDue.length === 1 ? '' : 's'} that reached the 7-day retention checkpoint. Complete a quick test to measure mastery before moving to bi-weekly reviews.
              </p>
            </div>
            <button
              onClick={() => setActiveView('tests')}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#A97B32] dark:text-[#FFE6AD] hover:underline"
            >
              <span>Go to Tests</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>
      )}

      {/* 6. Topics Needing Attention (Surfaced from error logs & low recall) */}
      {topicsNeedingAttention.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#E6C27A]" />
              <h2 className="text-sm font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                Topics Needing Attention
              </h2>
            </div>
            <button
              onClick={() => setActiveView('errors')}
              className="text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
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
                  className="group cursor-pointer rounded-2xl glass-subtle p-4 transition-all hover:border-[#E6C27A]/30"
                >
                  <div className="flex items-center justify-between text-xs text-[#686D77] dark:text-[#A7ABB5] mb-1">
                    <span style={{ color: subj?.color }} className="font-semibold">
                      {subj?.name}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${badgeClass}`}>
                      {topic.mastery.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC] truncate group-hover:text-[#A97B32] dark:group-hover:text-[#E6C27A]">
                    {topic.title}
                  </h4>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#858A93] dark:text-[#777F8C]">
                    <span>{topic.chapterName}</span>
                    <span className="flex items-center gap-1 text-[#A97B32] dark:text-[#E6C27A] font-medium">
                      Revise now <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. Completed Revisions Today */}
      {todayCompletedReviews.length > 0 && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
              Completed Today ({todayCompletedReviews.length})
            </h2>
          </div>

          <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] rounded-2xl glass-subtle">
            {todayCompletedReviews.map(({ topic, item }) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 text-xs"
              >
                <div className="truncate pr-4">
                  <span className="font-medium text-[#20232A] dark:text-[#F6F3EC] truncate">
                    {topic.title}
                  </span>
                  <span className="text-[#858A93] dark:text-[#777F8C] ml-2">· {item.stageName}</span>
                </div>
                <div className="text-[#858A93] dark:text-[#777F8C] font-mono text-[11px] shrink-0">
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
