import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
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
  const { state, setActiveView, setIsAddTopicOpen } = useApp();

  const totalTopics = state.topics.length;

  // Calculate real metrics without fake data
  const metrics = useMemo(() => {
    let totalScheduledReviews = 0;
    let completedReviews = 0;
    let totalMinutesStudied = 0;

    state.topics.forEach((t) => {
      t.schedule.forEach((s) => {
        if (s.stepIndex === 0) return; // step 0 is Learn
        totalScheduledReviews++;
        if (s.status === 'completed') {
          completedReviews++;
          totalMinutesStudied += t.estimatedDurationMinutes || 20;
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
            state.weeklyTests.reduce((acc, t) => acc + t.percentage, 0) / testCount
          )
        : null;

    // Mastery levels distribution
    const masteryDist = {
      mastered: state.topics.filter((t) => t.mastery === 'mastered').length,
      strong: state.topics.filter((t) => t.mastery === 'strong').length,
      developing: state.topics.filter((t) => t.mastery === 'developing').length,
      learning: state.topics.filter((t) => t.mastery === 'learning').length,
      new: state.topics.filter((t) => t.mastery === 'new').length,
    };

    // Subject breakdown
    const subjectBreakdown = state.subjects.map((s) => {
      const topics = state.topics.filter((t) => t.subjectId === s.id);
      const avg =
        topics.length > 0
          ? Math.round(topics.reduce((acc, t) => acc + t.masteryScore, 0) / topics.length)
          : 0;
      return {
        subject: s,
        topicCount: topics.length,
        avgMastery: avg,
      };
    });

    // Weakest topics based on mastery score
    const weakTopics = [...state.topics]
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
  }, [state.topics, state.weeklyTests, state.subjects]);

  if (totalTopics === 0) {
    return (
      <div className="py-16 text-center space-y-4">
        <Target className="mx-auto h-12 w-12 text-neutral-300 dark:text-neutral-700" />
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Your analytics will appear as you build your revision history.
        </h2>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Log chapters and complete spaced reviews to unlock retention insights and exam readiness diagnostics.
        </p>
        <button
          onClick={() => setIsAddTopicOpen(true)}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
        >
          Add Your First Topic
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Performance & Mastery Analytics
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Transparent metrics derived from your completed spaced repetitions and diagnostic tests
        </p>
      </div>

      {/* Top 4 KPI Metrics (Tabular numerals, no pills) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Topics Learned */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Topics in Curriculum
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
              {totalTopics}
            </span>
            <span className="text-xs text-neutral-500">logged</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            Across {state.subjects.length} academic subjects
          </p>
        </div>

        {/* 2. Repetition Completion Rate */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Review Adherence
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
              {metrics.completionRate}%
            </span>
            <span className="text-xs text-neutral-500">adherence</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            {metrics.completedReviews} of {metrics.totalScheduledReviews} reviews completed
          </p>
        </div>

        {/* 3. Study Time */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Active Recall Time
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
              {metrics.totalHours}
            </span>
            <span className="text-xs text-neutral-500">hours</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            Dedicated spaced repetition training
          </p>
        </div>

        {/* 4. Diagnostic Average */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-4 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216]">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
            Diagnostic Test Avg
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
              {metrics.testAverage !== null ? `${metrics.testAverage}%` : 'N/A'}
            </span>
            <span className="text-xs text-neutral-500">score</span>
          </div>
          <p className="mt-1 text-[11px] text-neutral-400">
            {state.weeklyTests.length} tests logged
          </p>
        </div>
      </div>

      {/* Mastery Model Distribution & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Breakdown */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-800/90 dark:bg-[#111216] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Mastery Stage Distribution
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              {metrics.masteryDist.mastered} Mastered
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { label: 'Mastered (>= 90%)', count: metrics.masteryDist.mastered, color: 'bg-amber-400' },
              { label: 'Strong (70 - 89%)', count: metrics.masteryDist.strong, color: 'bg-emerald-400' },
              { label: 'Developing (40 - 69%)', count: metrics.masteryDist.developing, color: 'bg-sky-400' },
              { label: 'Learning (15 - 39%)', count: metrics.masteryDist.learning, color: 'bg-orange-400' },
              { label: 'New (< 15%)', count: metrics.masteryDist.new, color: 'bg-neutral-400' },
            ].map((row) => {
              const pct = totalTopics > 0 ? Math.round((row.count / totalTopics) * 100) : 0;
              return (
                <div key={row.label} className="space-y-1 text-xs">
                  <div className="flex justify-between text-neutral-700 dark:text-neutral-300">
                    <span>{row.label}</span>
                    <span className="font-mono text-neutral-400 tabular-nums">
                      {row.count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-neutral-400 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            Calculated transparently: 50% from interval completions, 35% from recall ratings, and 15% from error log stability.
          </p>
        </div>

        {/* Subject Progress */}
        <div className="rounded-xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-800/90 dark:bg-[#111216] space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
            Subject Relative Performance
          </h3>

          <div className="space-y-3">
            {metrics.subjectBreakdown.map(({ subject, topicCount, avgMastery }) => (
              <div key={subject.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {subject.name} ({topicCount} topics)
                  </span>
                  <span className="font-mono font-semibold tabular-nums" style={{ color: subject.color }}>
                    {avgMastery}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
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
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-800/90 dark:bg-[#111216] space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Lowest Retention Topics (Prioritize in Revision)
          </h3>
        </div>

        <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60 text-xs">
          {metrics.weakTopics.map((topic) => {
            const subj = state.subjects.find((s) => s.id === topic.subjectId);
            return (
              <div
                key={topic.id}
                className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1"
              >
                <div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {topic.title}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {subj?.name} · {topic.chapterName}
                  </div>
                </div>

                <div className="text-right font-mono text-amber-600 dark:text-amber-400 font-semibold tabular-nums">
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
