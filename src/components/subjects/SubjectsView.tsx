import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Topic, Subject } from '../../types';
import { formatDisplayDate } from '../../utils/scheduler';
import { getMasteryBadgeClass } from '../../utils/mastery';
import { TopicDetailModal } from '../topics/TopicDetailModal';
import {
  BookOpen,
  ChevronRight,
  Layers,
  ArrowLeft,
  Play,
  Plus,
  AlertTriangle,
  CheckCircle,
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
              className="inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Subjects</span>
            </button>

            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Topic to {selectedStats.subject.name}</span>
            </button>
          </div>

          {/* Subject Master Card */}
          <div className="rounded-xl border border-neutral-200/90 bg-white p-5 sm:p-6 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216]">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
              <div>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: selectedStats.subject.color }}
                >
                  Subject Mastery Overview
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                  {selectedStats.subject.name}
                </h1>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {selectedStats.subject.description || 'Core examination curriculum syllabus'}
                </p>
              </div>

              {/* Big Mastery Figure */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-neutral-900 dark:text-neutral-50">
                  {selectedStats.avgScore}%
                </span>
                <span className="text-xs text-neutral-500">Mastery</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-neutral-200/60 pt-4 dark:border-neutral-800/60 text-xs">
              <div>
                <span className="text-neutral-400">Total Topics</span>
                <div className="font-mono text-lg font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                  {selectedStats.total}
                </div>
              </div>
              <div>
                <span className="text-neutral-400">Mastered</span>
                <div className="font-mono text-lg font-semibold text-emerald-500 tabular-nums">
                  {selectedStats.mastered}
                </div>
              </div>
              <div>
                <span className="text-neutral-400">In Progress</span>
                <div className="font-mono text-lg font-semibold text-sky-500 tabular-nums">
                  {selectedStats.inProgress}
                </div>
              </div>
              <div>
                <span className="text-neutral-400">Needs Attention</span>
                <div className="font-mono text-lg font-semibold text-amber-500 tabular-nums">
                  {selectedStats.needsAttention}
                </div>
              </div>
            </div>
          </div>

          {/* Chapters & Topics List */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
              Chapters & Topics ({chaptersInSelected.length} Chapters)
            </h2>

            {chaptersInSelected.length === 0 ? (
              <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-400 dark:border-neutral-800">
                No topics logged in {selectedStats.subject.name} yet.
              </div>
            ) : (
              <div className="space-y-4">
                {chaptersInSelected.map(({ chapterName, topics }) => (
                  <div
                    key={chapterName}
                    className="rounded-xl border border-neutral-200/90 bg-white p-4 dark:border-neutral-800/90 dark:bg-[#111216] space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-neutral-200/60 pb-2 dark:border-neutral-800/60">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                        {chapterName}
                      </h3>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {topics.length} topic{topics.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800/60">
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
                                <span className="font-semibold text-neutral-900 group-hover:text-amber-600 dark:text-neutral-100 dark:group-hover:text-amber-400 truncate">
                                  {t.title}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${badgeClass}`}>
                                  {t.mastery.toUpperCase()}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-neutral-400 font-mono">
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
                                className="flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                              >
                                <Play className="h-3 w-3 fill-current text-amber-500" />
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
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
                Subjects & Mastery
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Track retention and spaced repetition coverage across your academic disciplines
              </p>
            </div>

            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
            >
              <Plus className="h-3.5 w-3.5" />
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
                  className="group cursor-pointer rounded-xl border border-neutral-200/90 bg-white p-5 transition-all hover:border-neutral-400 dark:border-neutral-800/90 dark:bg-[#111216] dark:hover:border-neutral-700 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: subject.color }}
                      >
                        {subject.name}
                      </span>
                      <h3 className="text-lg font-bold text-neutral-900 group-hover:text-amber-600 dark:text-neutral-100 dark:group-hover:text-amber-400">
                        {subject.name}
                      </h3>
                      <p className="text-xs text-neutral-400 line-clamp-1">
                        {subject.description || 'Core Curriculum'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-mono text-2xl font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                        {avgScore}%
                      </div>
                      <div className="text-[11px] text-neutral-400">Mastery</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all duration-500"
                      style={{ width: `${avgScore}%` }}
                    />
                  </div>

                  {/* Stat Counters */}
                  <div className="grid grid-cols-3 border-t border-neutral-100 pt-3 dark:border-neutral-800/60 text-xs text-neutral-500">
                    <div>
                      <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {total}
                      </span>{' '}
                      Topics
                    </div>
                    <div>
                      <span className="font-mono font-semibold text-emerald-500 tabular-nums">
                        {mastered}
                      </span>{' '}
                      Mastered
                    </div>
                    <div>
                      <span className="font-mono font-semibold text-amber-500 tabular-nums">
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
