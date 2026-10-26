import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Topic } from '../../types';
import { formatDisplayDate } from '../../utils/scheduler';
import { getMasteryBadgeClass } from '../../utils/mastery';
import { TopicDetailModal } from '../topics/TopicDetailModal';
import {
  ArrowLeft,
  Play,
  Plus,
} from 'lucide-react';

export const SubjectsView: React.FC = () => {
  const {
    state,
    selectedSubjectId,
    setSelectedSubjectId,
    setIsAddTopicOpen,
    startReviewSession,
  } = useApp();

  const [activeTopicForModal, setActiveTopicForModal] = useState<Topic | null>(null);

  // Group topics by subject
  const subjectStats = useMemo(() => {
    return state.subjects.map((subj) => {
      const topics = state.topics.filter((t) => t.subjectId === subj.id);
      const total = topics.length;

      const mastered = topics.filter((t) => t.mastery === 'mastered').length;
      const strong = topics.filter((t) => t.mastery === 'strong').length;
      const developing = topics.filter((t) => t.mastery === 'developing').length;
      const learning = topics.filter((t) => t.mastery === 'learning').length;
      const newCount = topics.filter((t) => t.mastery === 'new').length;

      // Needs attention: topics with recent 'hard' or linked unresolved error logs
      const needsAttention = topics.filter((t) => {
        const hasUnresolvedErr = state.errorLogs.some(
          (e) => e.topicId === t.id && !e.resolved
        );
        return hasUnresolvedErr || t.masteryScore < 30;
      }).length;

      const inProgress = total - mastered;

      const avgScore =
        total > 0
          ? Math.round(topics.reduce((acc, t) => acc + t.masteryScore, 0) / total)
          : 0;

      return {
        subject: subj,
        topics,
        total,
        mastered,
        strong,
        developing,
        learning,
        newCount,
        inProgress,
        needsAttention,
        avgScore,
      };
    });
  }, [state.subjects, state.topics, state.errorLogs]);

  // Selected subject drill-down
  const selectedStats = subjectStats.find((s) => s.subject.id === selectedSubjectId);

  // Chapters in selected subject
  const chaptersInSelected = useMemo(() => {
    if (!selectedStats) return [];
    const map = new Map<string, Topic[]>();
    selectedStats.topics.forEach((t) => {
      const arr = map.get(t.chapterName) || [];
      arr.push(t);
      map.set(t.chapterName, arr);
    });
    return Array.from(map.entries()).map(([chapterName, topics]) => ({
      chapterName,
      topics,
    }));
  }, [selectedStats]);

  return (
    <div className="space-y-6 pb-12">
      {/* If drilling into a specific subject */}
      {selectedStats ? (
        <div className="space-y-6">
          {/* Back button & Subject Title */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className="inline-flex items-center gap-1.5 text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Subjects</span>
            </button>

            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="btn-gold-primary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Add Topic to {selectedStats.subject.name}</span>
            </button>
          </div>

          {/* Subject Master Card */}
          <div className="rounded-3xl glass-hero p-5 sm:p-7 space-y-5 transition-all">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: selectedStats.subject.color }}
                >
                  Subject Curriculum Overview
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                  {selectedStats.subject.name}
                </h1>
                <p className="mt-1 text-xs text-[#858A93] dark:text-[#777F8C]">
                  {selectedStats.subject.description || 'Core academic examination syllabus and spaced repetitions'}
                </p>
              </div>

              {/* Big Mastery Figure */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
                  {selectedStats.avgScore}%
                </span>
                <span className="text-xs text-[#858A93] dark:text-[#777F8C]">Mastery</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-black/[0.06] pt-4 dark:border-white/[0.08] text-xs">
              <div>
                <span className="text-[#858A93] dark:text-[#777F8C]">Total Topics</span>
                <div className="font-mono text-lg font-semibold text-[#20232A] dark:text-[#F6F3EC] tabular-nums">
                  {selectedStats.total}
                </div>
              </div>
              <div>
                <span className="text-[#858A93] dark:text-[#777F8C]">Mastered</span>
                <div className="font-mono text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {selectedStats.mastered}
                </div>
              </div>
              <div>
                <span className="text-[#858A93] dark:text-[#777F8C]">In Progress</span>
                <div className="font-mono text-lg font-semibold text-[#60A5FA] tabular-nums">
                  {selectedStats.inProgress}
                </div>
              </div>
              <div>
                <span className="text-[#858A93] dark:text-[#777F8C]">Needs Attention</span>
                <div className="font-mono text-lg font-semibold text-[#A97B32] dark:text-[#E6C27A] tabular-nums">
                  {selectedStats.needsAttention}
                </div>
              </div>
            </div>
          </div>

          {/* Chapters & Topics List */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              Chapters & Topics ({chaptersInSelected.length} Chapters)
            </h2>

            {chaptersInSelected.length === 0 ? (
              <div className="rounded-2xl glass-subtle border border-dashed border-black/[0.1] dark:border-white/[0.1] p-8 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
                No topics logged in {selectedStats.subject.name} yet.
              </div>
            ) : (
              <div className="space-y-4">
                {chaptersInSelected.map(({ chapterName, topics }) => (
                  <div
                    key={chapterName}
                    className="rounded-3xl glass-subtle p-5 space-y-3.5 transition-all"
                  >
                    <div className="flex items-center justify-between border-b border-black/[0.06] pb-2.5 dark:border-white/[0.08]">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#20232A] dark:text-[#F6F3EC]">
                        {chapterName}
                      </h3>
                      <span className="text-[11px] text-[#858A93] dark:text-[#777F8C] font-mono">
                        {topics.length} topic{topics.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                      {topics.map((t) => {
                        const badgeClass = getMasteryBadgeClass(t.mastery);
                        const nextReview = t.schedule.find(
                          (s) => s.status === 'scheduled' || s.status === 'overdue'
                        );
                        const lastCompleted = [...t.schedule]
                          .reverse()
                          .find((s) => s.status === 'completed');

                        return (
                          <div
                            key={t.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 first:pt-1 last:pb-1 text-xs"
                          >
                            <div
                              onClick={() => setActiveTopicForModal(t)}
                              className="cursor-pointer space-y-1 flex-1 min-w-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#20232A] group-hover:text-[#A97B32] dark:text-[#F6F3EC] dark:group-hover:text-[#E6C27A] truncate">
                                  {t.title}
                                </span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${badgeClass}`}>
                                  {t.mastery.toUpperCase()}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-[#858A93] dark:text-[#777F8C] font-mono">
                                <span>Studied: {formatDisplayDate(t.studiedDate, false)}</span>
                                <span aria-hidden="true">·</span>
                                <span>
                                  Next:{' '}
                                  {nextReview
                                    ? formatDisplayDate(nextReview.scheduledDate)
                                    : 'Completed Curve'}
                                </span>
                                {lastCompleted?.confidenceRating && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>Last Recall: {lastCompleted.confidenceRating}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => startReviewSession(t.id)}
                                className="btn-glass-secondary flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all"
                              >
                                <Play className="h-3 w-3 fill-current text-[#A97B32] dark:text-[#E6C27A]" />
                                <span>Revise</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* All Subjects Overview Grid */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                Subjects & Mastery
              </h1>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
                Track retention and spaced repetition coverage across your academic disciplines
              </p>
            </div>

            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="btn-gold-primary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Record Topic</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectStats.map(
              ({
                subject,
                total,
                mastered,
                inProgress,
                needsAttention,
                avgScore,
              }) => (
                <div
                  key={subject.id}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className="group cursor-pointer rounded-3xl glass-premium p-5 transition-all hover:border-[#E6C27A]/40 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: subject.color }}
                      >
                        {subject.name}
                      </span>
                      <h3 className="text-lg font-bold text-[#20232A] group-hover:text-[#A97B32] dark:text-[#F6F3EC] dark:group-hover:text-[#E6C27A]">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-[#858A93] dark:text-[#777F8C] line-clamp-1">
                        {subject.description || 'Core Curriculum'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-2xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
                        {avgScore}%
                      </div>
                      <div className="text-[11px] text-[#858A93] dark:text-[#777F8C]">Mastery</div>
                    </div>
                  </div>

                  {/* Sleek champagne gold progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-black/[0.08] dark:bg-white/[0.08] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#B88A43] to-[#E6C27A] transition-all duration-500"
                      style={{ width: `${avgScore}%` }}
                    />
                  </div>

                  {/* Stat Counters */}
                  <div className="grid grid-cols-3 border-t border-black/[0.06] pt-3 dark:border-white/[0.08] text-xs text-[#686D77] dark:text-[#A7ABB5]">
                    <div>
                      <span className="font-mono font-semibold text-[#20232A] dark:text-[#F6F3EC] tabular-nums">
                        {total}
                      </span>{' '}
                      Topics
                    </div>
                    <div>
                      <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {mastered}
                      </span>{' '}
                      Mastered
                    </div>
                    <div>
                      <span className="font-mono font-semibold text-[#A97B32] dark:text-[#E6C27A] tabular-nums">
                        {needsAttention}
                      </span>{' '}
                      Attention
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Modal for topic detail inspection if clicked */}
      <TopicDetailModal
        topic={activeTopicForModal}
        onClose={() => setActiveTopicForModal(null)}
      />
    </div>
  );
};
