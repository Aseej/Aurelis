import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { Topic, Subject } from '../../types';
import { formatDisplayDate } from '../../utils/scheduler';
import { getMasteryBadgeClass } from '../../utils/mastery';
import { TopicDetailModal } from '../topics/TopicDetailModal';
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  AlertTriangle,
  RotateCcw,
  X,
  BookOpen,
  Archive,
  CheckCircle2,
} from 'lucide-react';

export const SubjectsView: React.FC = () => {
  const {
    state,
    activeSubjects,
    archivedSubjects,
    archiveSubject,
    restoreSubject,
    deleteSubject,
    selectedSubjectId,
    setSelectedSubjectId,
    setIsAddTopicOpen,
    setIsAddSubjectOpen,
    startReviewSession,
  } = useApp();

  const { t, isRTL } = useI18n();

  const [activeTopicForModal, setActiveTopicForModal] = useState<Topic | null>(null);
  const [isConfirmRemovalOpen, setIsConfirmRemovalOpen] = useState(false);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<Subject | null>(null);
  const [undoBanner, setUndoBanner] = useState<{ id: string; name: string } | null>(null);

  // Group active topics by active subjects
  const subjectStats = useMemo(() => {
    return activeSubjects.map((subj) => {
      const topics = state.topics.filter((t) => !t.isArchived && t.subjectId === subj.id);
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
  }, [activeSubjects, state.topics, state.errorLogs]);

  // Selected subject drill-down (checks active subjects first, or archived if viewing)
  const selectedStats = useMemo(() => {
    if (!selectedSubjectId) return null;
    return subjectStats.find((s) => s.subject.id === selectedSubjectId) || null;
  }, [subjectStats, selectedSubjectId]);

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

  // Handle subject removal confirmation
  const handleConfirmRemoval = () => {
    if (!selectedStats) return;
    const removedId = selectedStats.subject.id;
    const removedName = selectedStats.subject.name;

    archiveSubject(removedId);
    setIsConfirmRemovalOpen(false);
    setSelectedSubjectId(null);

    // Show temporary undo snackbar
    setUndoBanner({ id: removedId, name: removedName });
  };

  const handleUndoRemoval = () => {
    if (!undoBanner) return;
    restoreSubject(undoBanner.id);
    setUndoBanner(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Undo Notification Banner */}
      {/* Undo Notification Banner */}
      {undoBanner && (
        <div className="rounded-2xl glass-premium border border-[#E6C27A]/40 p-4 flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 text-[#20232A] dark:text-[#F6F3EC]">
            <CheckCircle2 className="h-4 w-4 text-[#A97B32] dark:text-[#E6C27A]" />
            <span>
              {t('subjects.undoBanner', '“{name}” removed from active study plan.', { name: undoBanner.name })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndoRemoval}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#E6C27A]/20 px-3 py-1.5 font-semibold text-[#8C6221] dark:text-[#FFE6AD] hover:bg-[#E6C27A]/30 transition-all active:scale-95"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{t('subjects.undo', 'Undo')}</span>
            </button>
            <button
              onClick={() => setUndoBanner(null)}
              className="p-1 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
              aria-label={t('common.close', 'Dismiss')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* If drilling into a specific subject */}
      {selectedStats ? (
        <div className="space-y-6">
          {/* Back button & Subject Title */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedSubjectId(null)}
              className="inline-flex items-center gap-1.5 text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
            >
              <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              <span>{t('subjects.filterBySubject', 'All Subjects')}</span>
            </button>

            <button
              onClick={() => setIsAddTopicOpen(true)}
              className="btn-gold-primary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>{t('subjects.addTopic', 'Add Topic')}</span>
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
                  {t('subjects.curriculumOverview', 'Subject Curriculum Overview')}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                  {selectedStats.subject.name}
                </h1>
                <p className="mt-1 text-xs text-[#858A93] dark:text-[#777F8C]">
                  {selectedStats.subject.description || t('subjects.subtitle', 'Core academic examination syllabus and spaced repetitions')}
                </p>
              </div>

              {/* Big Mastery Figure */}
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
                  {selectedStats.avgScore}%
                </span>
                <span className="text-xs text-[#858A93] dark:text-[#777F8C]">{t('subjects.mastery', 'Mastery')}</span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-black/[0.06] pt-4 dark:border-white/[0.08] text-xs">
              <div>
                <span className="text-[#858A93] dark:text-[#777F8C]">{t('subjects.totalTopics', 'Total Topics')}</span>
                <div className="font-mono text-lg font-semibold text-[#20232A] dark:text-[#F6F3EC] tabular-nums">
                  {selectedStats.total}
                </div>
              </div>
              <div>
                <span className="text-[#858A93] dark:text-[#777F8C]">{t('subjects.mastered', 'Mastered')}</span>
                <div className="font-mono text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {selectedStats.mastered}
                </div>
              </div>
              <div>
                <span className="text-[#858A93] dark:text-[#777F8C]">{t('subjects.inProgress', 'In Progress')}</span>
                <div className="font-mono text-lg font-semibold text-[#60A5FA] tabular-nums">
                  {selectedStats.inProgress}
                </div>
              </div>
              <div>
                <span className="text-[#858A93] dark:text-[#777F8C]">{t('subjects.needsAttention', 'Needs Attention')}</span>
                <div className="font-mono text-lg font-semibold text-[#A97B32] dark:text-[#E6C27A] tabular-nums">
                  {selectedStats.needsAttention}
                </div>
              </div>
            </div>
          </div>

          {/* Chapters & Topics List */}
          <div className="space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              {t('subjects.chaptersCount', 'Chapters & Topics ({count} Chapters)', { count: chaptersInSelected.length })}
            </h2>

            {chaptersInSelected.length === 0 ? (
              <div className="rounded-2xl glass-subtle border border-dashed border-black/[0.1] dark:border-white/[0.1] p-8 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
                {t('subjects.noTopicsLogged', 'No topics logged in {name} yet.', { name: selectedStats.subject.name })}
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
                        {topics.length} {t('common.topics', 'topics')}
                      </span>
                    </div>

                    <div className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                      {topics.map((tItem) => {
                        const badgeClass = getMasteryBadgeClass(tItem.mastery);
                        const nextReview = tItem.schedule.find(
                          (s) => s.status === 'scheduled' || s.status === 'overdue'
                        );
                        const lastCompleted = [...tItem.schedule]
                          .reverse()
                          .find((s) => s.status === 'completed');

                        return (
                          <div
                            key={tItem.id}
                            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 first:pt-1 last:pb-1 text-xs"
                          >
                            <div
                              onClick={() => setActiveTopicForModal(tItem)}
                              className="cursor-pointer space-y-1 flex-1 min-w-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-[#20232A] group-hover:text-[#A97B32] dark:text-[#F6F3EC] dark:group-hover:text-[#E6C27A] truncate">
                                  {tItem.title}
                                </span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border ${badgeClass}`}>
                                  {tItem.mastery.toUpperCase()}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-[11px] text-[#858A93] dark:text-[#777F8C] font-mono">
                                <span>{t('subjects.studiedDate', 'Studied: {date}', { date: formatDisplayDate(tItem.studiedDate, false) })}</span>
                                <span aria-hidden="true">·</span>
                                <span>
                                  {t('subjects.nextReview', 'Next: {date}', {
                                    date: nextReview
                                      ? formatDisplayDate(nextReview.scheduledDate)
                                      : t('subjects.completedCurve', 'Completed Curve'),
                                  })}
                                </span>
                                {lastCompleted?.confidenceRating && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span>{t('subjects.lastRecall', 'Last Recall: {rating}', { rating: lastCompleted.confidenceRating })}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                              <button
                                onClick={() => startReviewSession(tItem.id)}
                                className="btn-glass-secondary flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all"
                              >
                                <Play className="h-3 w-3 fill-current text-[#A97B32] dark:text-[#E6C27A]" />
                                <span>{t('subjects.revise', 'Revise')}</span>
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

          {/* Danger Zone: Subject Removal at the very bottom below all content */}
          <div className="mt-14 pt-6 border-t border-black/[0.06] dark:border-white/[0.08]">
            <div className="rounded-3xl glass-subtle border border-red-500/20 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600/90 dark:text-red-400/90 flex items-center gap-1.5">
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t('subjects.removeSubject', 'Subject Removal')}</span>
                </h3>
                <p className="text-xs text-[#858A93] dark:text-[#777F8C] max-w-lg">
                  {t('subjects.removeDesc', 'Remove {name} from your active study curriculum. All review history and topics are safely archived and can be restored anytime.', { name: selectedStats.subject.name })}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsConfirmRemovalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-500/15 hover:border-red-500/50 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-all shrink-0 active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t('subjects.removeBtn', 'Remove This Subject')}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* All Subjects Overview Grid */
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                {t('subjects.title', 'Subjects & Mastery')}
              </h1>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
                {t('subjects.subtitle', 'Track retention and spaced repetition coverage across your academic disciplines')}
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="btn-glass-secondary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{t('subjects.addSubject', 'Add Subject')}</span>
              </button>

              <button
                onClick={() => setIsAddTopicOpen(true)}
                className="btn-gold-primary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{t('subjects.addTopic', 'Record Topic')}</span>
              </button>
            </div>
          </div>

          {/* Active Subjects Grid or Polished Empty State */}
          {activeSubjects.length === 0 ? (
            <div className="py-16 text-center space-y-4 rounded-3xl glass-premium p-8 max-w-lg mx-auto border border-black/[0.06] dark:border-white/[0.08]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6C27A]/15 text-[#A97B32] dark:text-[#E6C27A] border border-[#E6C27A]/30 shadow-inner">
                <BookOpen className="h-7 w-7" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                {t('subjects.emptyTitle', 'Your subjects, your way')}
              </h2>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C] max-w-sm mx-auto leading-relaxed">
                {t('subjects.emptyDesc', 'Add the subjects you are studying to build your personal revision plan.')}
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsAddSubjectOpen(true)}
                  className="btn-gold-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md active:scale-95 transition-all"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>{t('subjects.addSubject', 'Add Subject')}</span>
                </button>
              </div>
            </div>
          ) : (
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
                          {subject.description || t('subjects.curriculumOverview', 'Core Curriculum')}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-2xl font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
                          {avgScore}%
                        </div>
                        <div className="text-[11px] text-[#858A93] dark:text-[#777F8C]">{t('subjects.mastery', 'Mastery')}</div>
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
                        {t('subjects.topics', 'Topics')}
                      </div>
                      <div>
                        <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {mastered}
                        </span>{' '}
                        {t('subjects.mastered', 'Mastered')}
                      </div>
                      <div>
                        <span className="font-mono font-semibold text-[#A97B32] dark:text-[#E6C27A] tabular-nums">
                          {needsAttention}
                        </span>{' '}
                        {t('subjects.attention', 'Attention')}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* Archived Subjects Section (Allows genuine restoration of removed subjects) */}
          {archivedSubjects.length > 0 && (
            <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.08] space-y-3">
              <div className="flex items-center gap-2">
                <Archive className="h-4 w-4 text-[#858A93] dark:text-[#777F8C]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                  {t('subjects.archivedCount', 'Archived Subjects ({count})', { count: archivedSubjects.length })}
                </h3>
              </div>
              <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                {t('subjects.archivedDesc', 'These subjects and their associated study records are preserved. You can restore them to your active plan at any time.')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {archivedSubjects.map((s) => {
                  const topicCount = state.topics.filter((t) => t.subjectId === s.id).length;
                  return (
                    <div
                      key={s.id}
                      className="rounded-2xl glass-subtle p-3.5 flex items-center justify-between gap-3 border border-black/[0.04] dark:border-white/[0.06]"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          <h4 className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC] truncate">
                            {s.name}
                          </h4>
                        </div>
                        <p className="text-[10px] text-[#858A93] dark:text-[#777F8C] pl-4 font-mono">
                          {t('subjects.archivedTopics', '{count} topic(s) archived', { count: topicCount })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => restoreSubject(s.id)}
                          className="btn-glass-secondary inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-[#8C6221] dark:text-[#FFE6AD] hover:bg-[#E6C27A]/20 transition-all active:scale-95"
                          title={t('subjects.restore', 'Restore to active study plan')}
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>{t('subjects.restore', 'Restore')}</span>
                        </button>

                        <button
                          onClick={() => setPermanentDeleteTarget(s)}
                          className="inline-flex items-center justify-center p-1.5 rounded-xl border border-red-500/25 bg-red-500/5 text-red-500 hover:bg-red-500/15 hover:border-red-500/40 dark:text-red-400 dark:bg-red-500/10 dark:hover:bg-red-500/20 transition-all active:scale-95"
                          title={t('subjects.deletePermanently', 'Permanently remove from archives')}
                          aria-label={t('subjects.deletePermanently', 'Permanently remove from archives')}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog for Subject Removal (Archiving) */}
      {isConfirmRemovalOpen && selectedStats && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
        >
          <div className="relative w-full max-w-md rounded-3xl glass-premium shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5 dark:border-white/[0.08]">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <h2>{t('subjects.confirmRemoveTitle', 'Remove this subject?')}</h2>
              </div>
              <button
                onClick={() => setIsConfirmRemovalOpen(false)}
                className="rounded-xl p-1 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
                aria-label={t('common.cancel', 'Cancel')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
              {t('subjects.confirmRemoveMsg', 'Are you sure you want to remove “{name}” from your active subjects? Its associated topics, scheduled revisions, and progress may be affected.', { name: selectedStats.subject.name })}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmRemovalOpen(false)}
                className="rounded-xl border border-black/[0.08] bg-white/60 px-4 py-2 text-xs font-semibold text-[#20232A] hover:bg-black/[0.04] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC] dark:hover:bg-white/[0.08] transition-all"
              >
                {t('common.cancel', 'Cancel')}
              </button>

              <button
                type="button"
                onClick={handleConfirmRemoval}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-md transition-all active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t('subjects.confirmRemoveBtn', 'Confirm Removal')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Permanent Deletion from Archives */}
      {permanentDeleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
        >
          <div className="relative w-full max-w-md rounded-3xl glass-premium shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5 dark:border-white/[0.08]">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <h2>{t('subjects.confirmDeleteTitle', 'Permanently delete subject?')}</h2>
              </div>
              <button
                onClick={() => setPermanentDeleteTarget(null)}
                className="rounded-xl p-1 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
                aria-label={t('common.cancel', 'Cancel')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
              {t('subjects.confirmDeleteMsg', 'Are you sure you want to permanently delete “{name}” from the archives? All of its associated topics, notes, and revision schedules will be permanently purged. This action cannot be undone.', { name: permanentDeleteTarget.name })}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                className="rounded-xl border border-black/[0.08] bg-white/60 px-4 py-2 text-xs font-semibold text-[#20232A] hover:bg-black/[0.04] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC] dark:hover:bg-white/[0.08] transition-all"
              >
                {t('common.cancel', 'Cancel')}
              </button>

              <button
                type="button"
                onClick={() => {
                  deleteSubject(permanentDeleteTarget.id);
                  setPermanentDeleteTarget(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 shadow-md transition-all active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t('subjects.confirmDeleteBtn', 'Delete Permanently')}</span>
              </button>
            </div>
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
