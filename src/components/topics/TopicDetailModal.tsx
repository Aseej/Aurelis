import React, { useState } from 'react';
import { Topic } from '../../types';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { formatDisplayDate } from '../../utils/scheduler';
import { getMasteryBadgeClass } from '../../utils/mastery';
import { X, Calendar, Clock, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

interface TopicDetailModalProps {
  topic: Topic | null;
  onClose: () => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({ topic, onClose }) => {
  const { updateTopic, deleteTopic, startReviewSession, state } = useApp();
  const { t } = useI18n();

  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(topic?.title || '');
  const [editedChapter, setEditedChapter] = useState(topic?.chapterName || '');
  const [editedStudiedDate, setEditedStudiedDate] = useState(topic?.studiedDate || '');
  const [editedDuration, setEditedDuration] = useState(topic?.estimatedDurationMinutes || 20);
  const [editedDifficulty, setEditedDifficulty] = useState(topic?.difficulty || 'moderate');
  const [editedNotes, setEditedNotes] = useState(topic?.notes || '');

  React.useEffect(() => {
    if (topic) {
      setIsEditing(false);
      setIsConfirmDeleteOpen(false);
      setEditedTitle(topic.title);
      setEditedChapter(topic.chapterName);
      setEditedStudiedDate(topic.studiedDate);
      setEditedDuration(topic.estimatedDurationMinutes);
      setEditedDifficulty(topic.difficulty);
      setEditedNotes(topic.notes);
    }
  }, [topic?.id]);

  if (!topic) return null;

  const subject = state.subjects.find((s) => s.id === topic.subjectId) || {
    name: 'General',
    color: '#d4af37',
  };

  const handleSave = () => {
    updateTopic(topic.id, {
      title: editedTitle.trim(),
      chapterName: editedChapter.trim(),
      studiedDate: editedStudiedDate,
      estimatedDurationMinutes: Number(editedDuration) || 20,
      difficulty: editedDifficulty,
      notes: editedNotes.trim(),
    });
    setIsEditing(false);
  };

  const handleConfirmDelete = () => {
    deleteTopic(topic.id);
    setIsConfirmDeleteOpen(false);
    onClose();
  };

  const badgeClass = getMasteryBadgeClass(topic.mastery);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl glass-premium shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-white/20 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4 dark:border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className="font-semibold uppercase tracking-wider text-[11px]"
              style={{ color: subject.color }}
            >
              {subject.name}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-[#858A93] dark:text-[#777F8C]">{topic.chapterName}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="btn-glass-secondary flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs"
              >
                <Edit2 className="h-3 w-3" />
                <span>{t('topicDetailModal.edit', 'Edit Topic')}</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="btn-gold-primary flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold"
              >
                <Check className="h-3 w-3 stroke-[2.5]" />
                <span>{t('topicDetailModal.saveChanges', 'Save Changes')}</span>
              </button>
            )}

            <button
              onClick={() => setIsConfirmDeleteOpen(true)}
              className="rounded-xl p-1.5 text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
              title={t('topicDetailModal.delete', 'Delete Topic')}
              aria-label={t('topicDetailModal.delete', 'Delete Topic')}
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Delete Confirmation Box */}
        {isConfirmDeleteOpen && (
          <div className="p-4 mx-6 mt-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
            <span className="text-red-600 dark:text-red-400 font-medium">
              {t('topicDetailModal.confirmDelete', 'Are you sure you want to delete this topic and all its scheduled revisions?')}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="rounded-lg border border-black/[0.08] dark:border-white/[0.08] px-2.5 py-1 text-xs"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-lg bg-red-600 text-white px-2.5 py-1 text-xs font-semibold"
              >
                {t('common.delete', 'Delete')}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  {t('addTopicModal.topicLabel', 'Topic Title')}
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  {t('addTopicModal.chapterLabel', 'Chapter')}
                </label>
                <input
                  type="text"
                  value={editedChapter}
                  onChange={(e) => setEditedChapter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    {t('addTopicModal.dateStudied', 'Studied Date')}
                  </label>
                  <input
                    type="date"
                    value={editedStudiedDate}
                    onChange={(e) => setEditedStudiedDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    {t('addTopicModal.estimatedDuration', 'Est. Duration (min)')}
                  </label>
                  <input
                    type="number"
                    value={editedDuration}
                    onChange={(e) => setEditedDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  {t('addTopicModal.notesLabel', 'Notes')}
                </label>
                <textarea
                  rows={5}
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 p-3 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] font-mono"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Display Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                    {topic.title}
                  </h3>
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-md border ${badgeClass}`}>
                    {topic.mastery.toUpperCase()} ({topic.masteryScore}%)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#858A93] dark:text-[#777F8C]">
                  <span>{t('subjects.studiedDate', 'Studied: {date}', { date: formatDisplayDate(topic.studiedDate, false) })}</span>
                  <span aria-hidden="true">·</span>
                  <span>~{topic.estimatedDurationMinutes} min</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{topic.difficulty}</span>
                </div>
              </div>

              {/* Revision Schedule History & Progression */}
              <div className="rounded-2xl glass-subtle p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                  {t('topicDetailModal.spacedSchedule', '7-Stage Spaced Repetition Schedule')}
                </div>

                <div className="space-y-2">
                  {topic.schedule.map((item, idx) => {
                    const isDone = item.status === 'completed';
                    const isOverdue = item.status === 'overdue';

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl glass-subtle p-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[#858A93] dark:text-[#777F8C] text-[11px] w-5">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-medium text-[#20232A] dark:text-[#F6F3EC]">
                              {item.stageName}
                            </div>
                            <div className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                              {formatDisplayDate(item.scheduledDate, false)}
                              {item.completedDate && ` · ${t('status.completed', 'Completed')}: ${formatDisplayDate(item.completedDate, false)}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                              {t('status.completed', 'Completed')} {item.confidenceRating && `(${item.confidenceRating})`}
                            </span>
                          ) : isOverdue ? (
                            <button
                              onClick={() => {
                                startReviewSession(topic.id, item.stepIndex);
                                onClose();
                              }}
                              className="rounded-lg bg-[#F87171]/15 border border-[#F87171]/30 px-2.5 py-1 text-[11px] font-semibold text-[#F87171] hover:bg-[#F87171]/25"
                            >
                              {t('status.overdue', 'Overdue')} · {t('subjects.revise', 'Revise')}
                            </button>
                          ) : (
                            <span className="text-[#858A93] dark:text-[#777F8C] text-[11px]">
                              {t('status.scheduled', 'Scheduled')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                  {t('topicDetailModal.conceptNotes', 'Core Concept & Memory Notes')}
                </div>
                <div className="rounded-2xl glass-subtle p-4 text-xs text-[#20232A] dark:text-[#F6F3EC] whitespace-pre-wrap font-sans leading-relaxed">
                  {topic.notes || t('topicDetailModal.noNotes', 'No concept notes logged for this topic.')}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
