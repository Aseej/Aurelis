import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Flame,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { state, activeSubjects, setActiveView, setIsAddTopicOpen } = useApp();
  const { t, formatNumber } = useI18n();

  const activeSubjectIds = useMemo(() => new Set(activeSubjects.map((s) => s.id)), [activeSubjects]);
  const activeTopics = useMemo(
    () => state.topics.filter((t) => !t.isArchived && activeSubjectIds.has(t.subjectId)),
    [state.topics, activeSubjectIds]
  );

  const totalTopics = activeTopics.length;

  // Calculate real metrics without fake data
  const metrics = useMemo(() => {
    let totalScheduledReviews = 0;
    let completedReviews = 0;
    let totalMinutesStudied = 0;

    activeTopics.forEach((topic) => {
      topic.schedule.forEach((s) => {
        if (s.stepIndex === 0) return; // step 0 is Learn
        totalScheduledReviews++;
        if (s.status === 'completed') {
          completedReviews++;
          totalMinutesStudied += topic.estimatedDurationMinutes || 20;
        }
      });
    });

    const completionRate =
      totalScheduledReviews > 0
        ? Math.round((completedReviews / totalScheduledReviews) * 100)
        : 0;

    // Test Average
    const testCount = state.weeklyTests.length;
    const testAverage =
      testCount > 0
        ? Math.round(
            state.weeklyTests.reduce((acc, test) => acc + test.percentage, 0) / testCount
          )
        : null;

    // Mastery levels distribution
    const masteryDist = {
      mastered: activeTopics.filter((topic) => topic.mastery === 'mastered').length,
      strong: activeTopics.filter((topic) => topic.mastery === 'strong').length,
      developing: activeTopics.filter((topic) => topic.mastery === 'developing').length,
      learning: activeTopics.filter((topic) => topic.mastery === 'learning').length,
      new: activeTopics.filter((topic) => topic.mastery === 'new').length,
    };

    // Subject breakdown
    const subjectBreakdown = activeSubjects.map((s) => {
      const topics = activeTopics.filter((topic) => topic.subjectId === s.id);
      const avg =
        topics.length > 0
          ? Math.round(topics.reduce((acc, topic) => acc + topic.masteryScore, 0) / topics.length)
          : 0;
      return {
        subject: s,
        topicCount: topics.length,
        avgMastery: avg,
      };
    });

    // Weakest topics based on mastery score
    const weakTopics = [...activeTopics]
      .sort((a, b) => a.masteryScore - b.masteryScore)
      .slice(0, 5);

    return {
      completedReviews,
      totalScheduledReviews,
      completionRate,
      totalHours: (totalMinutesStudied / 60).toFixed(1),
      testAverage,
      masteryDist,
      subjectBreakdown,
      weakTopics,
    };
  }, [activeTopics, state.weeklyTests, activeSubjects]);

  if (totalTopics === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <Target className="mx-auto h-12 w-12 text-[#858A93] dark:text-[#777F8C]" />
        <h2 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
          {t('analytics.overviewTitle', 'Your analytics will appear as you build your revision history.')}
        </h2>
        <p className="text-xs text-[#858A93] dark:text-[#777F8C] max-w-sm mx-auto">
          {t('analytics.overviewSubtitle', 'Record topics and complete active spaced reviews to unlock retention insights and exam readiness diagnostics.')}
        </p>
        <button
          onClick={() => setIsAddTopicOpen(true)}
          className="btn-gold-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
        >
          {t('subjects.addTopic', 'Add Topic')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
          {t('analytics.overviewTitle', 'Memory & Retention Analytics')}
        </h1>
        <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
          {t('analytics.overviewSubtitle', 'Real-time metrics on spaced repetition adherence, retention rates, and recall discipline')}
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Topics Learned */}
        <div className="rounded-3xl glass-premium p-5 transition-all">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            {t('analytics.topicsLearned', 'Topics Logged')}
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
              {formatNumber(totalTopics)}
            </span>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C]">{t('common.topics', 'topics')}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#858A93] dark:text-[#777F8C]">
            {activeSubjects.length} {t('common.subjects', 'subjects')}
          </p>
        </div>

        {/* 2. Repetition Completion Rate */}
        <div className="rounded-3xl glass-premium p-5 transition-all">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            {t('analytics.reviewAdherence', 'Schedule Adherence')}
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-[#A97B32] dark:text-[#E6C27A]">
              {metrics.completionRate}%
            </span>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C]">{t('analytics.completionRate', 'rate')}</span>
          </div>
          <p className="mt-1 text-[11px] text-[#858A93] dark:text-[#777F8C]">
            {metrics.completedReviews} / {metrics.totalScheduledReviews}
          </p>
        </div>

        {/* 3. Study Time */}
        <div className="rounded-3xl glass-premium p-5 transition-all">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            {t('analytics.activeRecallTime', 'Active Recall Time')}
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
              {metrics.totalHours}
            </span>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C]">h</span>
          </div>
          <p className="mt-1 text-[11px] text-[#858A93] dark:text-[#777F8C]">
            {t('streak.activeConsistency', 'Active Consistency')}
          </p>
        </div>

        {/* 4. Diagnostic Average */}
        <div className="rounded-3xl glass-premium p-5 transition-all">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            {t('analytics.diagnosticTestAvg', 'Day 7 Test Average')}
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
              {metrics.testAverage !== null ? `${metrics.testAverage}%` : 'N/A'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#858A93] dark:text-[#777F8C]">
            {state.weeklyTests.length} {t('nav.tests', 'tests')}
          </p>
        </div>
      </div>

      {/* Mastery Model Distribution & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Breakdown */}
        <div className="rounded-3xl glass-subtle p-5 sm:p-6 space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              {t('analytics.masteryDistributionTitle', 'Curriculum Retention Mastery')}
            </h3>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C] font-mono">
              {metrics.masteryDist.mastered} {t('subjects.mastered', 'Mastered')}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: `${t('subjects.mastered', 'Mastered')} (>= 90%)`, count: metrics.masteryDist.mastered, color: 'bg-[#E6C27A]' },
              { label: `${t('status.strong', 'Strong')} (70 - 89%)`, count: metrics.masteryDist.strong, color: 'bg-emerald-400' },
              { label: `${t('status.developing', 'Developing')} (40 - 69%)`, count: metrics.masteryDist.developing, color: 'bg-[#60A5FA]' },
              { label: `${t('status.learning', 'Learning')} (15 - 39%)`, count: metrics.masteryDist.learning, color: 'bg-orange-400' },
              { label: `${t('status.new', 'New')} (< 15%)`, count: metrics.masteryDist.new, color: 'bg-[#858A93]' },
            ].map((row) => {
              const pct = totalTopics > 0 ? Math.round((row.count / totalTopics) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#20232A] dark:text-[#F6F3EC]">
                    <span>{row.label}</span>
                    <span className="font-mono text-[#858A93] dark:text-[#777F8C] tabular-nums">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/[0.08] dark:bg-white/[0.08] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-[#858A93] dark:text-[#777F8C] border-t border-black/[0.06] pt-3 dark:border-white/[0.08]">
            50% intervals · 35% recall · 15% errors
          </p>
        </div>

        {/* Subject Progress */}
        <div className="rounded-3xl glass-subtle p-5 sm:p-6 space-y-4 transition-all">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            {t('analytics.subjectPerformanceTitle', 'Subject Performance Breakdown')}
          </h3>

          <div className="space-y-3.5">
            {metrics.subjectBreakdown.map(({ subject, topicCount, avgMastery }) => (
              <div key={subject.id} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#20232A] dark:text-[#F6F3EC]">
                    {subject.name} ({topicCount} {t('common.topics', 'topics')})
                  </span>
                  <span className="font-mono font-semibold tabular-nums" style={{ color: subject.color }}>
                    {avgMastery}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-black/[0.08] dark:bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${avgMastery}%`, backgroundColor: subject.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weakest Topics List */}
      <div className="rounded-3xl glass-subtle p-5 sm:p-6 space-y-3 transition-all">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-[#E6C27A]" />
          <h3 className="text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC]">
            {t('analytics.lowestRetentionTitle', 'Topics Needing Attention')}
          </h3>
        </div>

        <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08] text-xs">
          {metrics.weakTopics.map((topic) => {
            const subj = state.subjects.find((s) => s.id === topic.subjectId);
            return (
              <div
                key={topic.id}
                className="flex items-center justify-between py-3 first:pt-1 last:pb-1"
              >
                <div>
                  <div className="font-medium text-[#20232A] dark:text-[#F6F3EC]">
                    {topic.title}
                  </div>
                  <div className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                    {subj?.name} · {topic.chapterName}
                  </div>
                </div>

                <div className="text-right font-mono text-[#A97B32] dark:text-[#E6C27A] font-semibold tabular-nums">
                  {topic.masteryScore}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
