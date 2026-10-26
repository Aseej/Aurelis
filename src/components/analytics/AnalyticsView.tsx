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
      <div className="py-20 text-center space-y-4">
        <Target className="mx-auto h-12 w-12 text-[#858A93] dark:text-[#777F8C]" />
        <h2 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
          Your analytics will appear as you build your revision history.
        </h2>
        <p className="text-xs text-[#858A93] dark:text-[#777F8C] max-w-sm mx-auto">
          Record topics and complete active spaced reviews to unlock retention insights and exam readiness diagnostics.
        </p>
        <button
          onClick={() => setIsAddTopicOpen(true)}
          className="btn-gold-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold"
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
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
          Performance & Mastery Analytics
        </h1>
        <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
          Auditable metrics computed from your spaced repetition schedule and diagnostic test logs
        </p>
      </div>

      {/* Top 4 KPI Metrics (Tabular numerals, no pills) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Topics Learned */}
        <div className="rounded-3xl glass-premium p-5 transition-all">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Curriculum Topics
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
              {totalTopics}
            </span>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C]">logged</span>
          </div>
          <p className="mt-1 text-[11px] text-[#858A93] dark:text-[#777F8C]">
            Across {state.subjects.length} academic subjects
          </p>
        </div>

        {/* 2. Repetition Completion Rate */}
        <div className="rounded-3xl glass-premium p-5 transition-all">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Review Adherence
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-[#A97B32] dark:text-[#E6C27A]">
              {metrics.completionRate}%
            </span>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C]">adherence</span>
          </div>
          <p className="mt-1 text-[11px] text-[#858A93] dark:text-[#777F8C]">
            {metrics.completedReviews} of {metrics.totalScheduledReviews} reviews completed
          </p>
        </div>

        {/* 3. Study Time */}
        <div className="rounded-3xl glass-premium p-5 transition-all">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Active Recall Time
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
              {metrics.totalHours}
            </span>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C]">hours</span>
          </div>
          <p className="mt-1 text-[11px] text-[#858A93] dark:text-[#777F8C]">
            Spaced repetition retrieval
          </p>
        </div>

        {/* 4. Diagnostic Average */}
        <div className="rounded-3xl glass-premium p-5 transition-all">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Diagnostic Test Avg
          </div>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
              {metrics.testAverage !== null ? `${metrics.testAverage}%` : 'N/A'}
            </span>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C]">score</span>
          </div>
          <p className="mt-1 text-[11px] text-[#858A93] dark:text-[#777F8C]">
            {state.weeklyTests.length} tests logged
          </p>
        </div>
      </div>

      {/* Mastery Model Distribution & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mastery Breakdown */}
        <div className="rounded-3xl glass-subtle p-5 sm:p-6 space-y-4 transition-all">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              Mastery Stage Distribution
            </h3>
            <span className="text-xs text-[#858A93] dark:text-[#777F8C] font-mono">
              {metrics.masteryDist.mastered} Mastered
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Mastered (>= 90%)', count: metrics.masteryDist.mastered, color: 'bg-[#E6C27A]' },
              { label: 'Strong (70 - 89%)', count: metrics.masteryDist.strong, color: 'bg-emerald-400' },
              { label: 'Developing (40 - 69%)', count: metrics.masteryDist.developing, color: 'bg-[#60A5FA]' },
              { label: 'Learning (15 - 39%)', count: metrics.masteryDist.learning, color: 'bg-orange-400' },
              { label: 'New (< 15%)', count: metrics.masteryDist.new, color: 'bg-[#858A93]' },
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
            Multi-factor model: 50% interval completions, 35% recall ratings, and 15% error notebook stability.
          </p>
        </div>

        {/* Subject Progress */}
        <div className="rounded-3xl glass-subtle p-5 sm:p-6 space-y-4 transition-all">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Subject Relative Performance
          </h3>

          <div className="space-y-3.5">
            {metrics.subjectBreakdown.map(({ subject, topicCount, avgMastery }) => (
              <div key={subject.id} className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#20232A] dark:text-[#F6F3EC]">
                    {subject.name} ({topicCount} topics)
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
            Lowest Retention Topics (Prioritize in Upcoming Revisions)
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
