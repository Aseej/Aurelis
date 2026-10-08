import React, { useState } from 'react';
import { Topic } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatDisplayDate } from '../../utils/scheduler';
import { getMasteryBadgeClass } from '../../utils/mastery';
import { X, Calendar, Clock, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

interface TopicDetailModalProps {
  topic: Topic | null;
  onClose: () => void;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({ topic, onClose }) => {
  const { updateTopic, deleteTopic, startReviewSession, state } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(topic?.title || '');
  const [editedChapter, setEditedChapter] = useState(topic?.chapterName || '');
  const [editedStudiedDate, setEditedStudiedDate] = useState(topic?.studiedDate || '');
  const [editedDuration, setEditedDuration] = useState(topic?.estimatedDurationMinutes || 20);
  const [editedDifficulty, setEditedDifficulty] = useState(topic?.difficulty || 'moderate');
  const [editedNotes, setEditedNotes] = useState(topic?.notes || '');

  React.useEffect(() => {
    if (topic) {
      setIsEditing(false);
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

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${topic.title}" and its revision history?`)) {
      deleteTopic(topic.id);
      onClose();
    }
  };

  const badgeClass = getMasteryBadgeClass(topic.mastery);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200/90 bg-white shadow-2xl dark:border-neutral-800/90 dark:bg-[#0e0f14] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4 dark:border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span
              className="font-semibold uppercase tracking-wider text-[11px]"
              style={{ color: subject.color }}
            >
              {subject.name}
            </span>
            <span aria-hidden="true">·</span>
            <span className="text-neutral-500">{topic.chapterName}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Edit2 className="h-3 w-3" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="flex items-center gap-1 rounded-lg bg-neutral-900 px-3 py-1 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900"
              >
                <Check className="h-3 w-3" />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={handleDelete}
              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Delete Topic"
              aria-label="Delete Topic"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Topic Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Chapter
                </label>
                <input
                  type="text"
                  value={editedChapter}
                  onChange={(e) => setEditedChapter(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Studied Date
                  </label>
                  <input
                    type="date"
                    value={editedStudiedDate}
                    onChange={(e) => setEditedStudiedDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                  <p className="mt-1 text-[10px] text-neutral-400">
                    Recalculates future uncompleted review dates safely.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Est. Duration (min)
                  </label>
                  <input
                    type="number"
                    value={editedDuration}
                    onChange={(e) => setEditedDuration(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                  Notes
                </label>
                <textarea
                  rows={5}
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 p-3 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 font-mono"
                />
              </div>
            </div>
          ) : (
            <>
              {/* Display Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                    {topic.title}
                  </h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${badgeClass}`}>
                    {topic.mastery.toUpperCase()} ({topic.masteryScore}%)
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                  <span>Studied: {formatDisplayDate(topic.studiedDate, false)}</span>
                  <span aria-hidden="true">·</span>
                  <span>Est. Review: ~{topic.estimatedDurationMinutes} min</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{topic.difficulty} Difficulty</span>
                </div>
              </div>

              {/* Revision Schedule History & Progression */}
              <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/60 p-4 dark:border-neutral-800/90 dark:bg-neutral-900/40 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Spaced Repetition Milestones (7-Step Curve)
                </div>

                <div className="space-y-2">
                  {topic.schedule.map((item, idx) => {
                    const isDone = item.status === 'completed';
                    const isOverdue = item.status === 'overdue';

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-neutral-200/60 bg-white p-2.5 text-xs dark:border-neutral-800/60 dark:bg-[#121318]"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-neutral-400 text-[11px] w-5">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {item.stageName}
                            </div>
                            <div className="text-[11px] text-neutral-500">
                              Scheduled: {formatDisplayDate(item.scheduledDate, false)}
                              {item.completedDate && ` · Completed: ${formatDisplayDate(item.completedDate, false)}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <span className="text-emerald-500 font-medium text-[11px]">
                              Completed {item.confidenceRating && `(${item.confidenceRating})`}
                            </span>
                          ) : isOverdue ? (
                            <button
                              onClick={() => {
                                startReviewSession(topic.id, item.stepIndex);
                                onClose();
                              }}
                              className="rounded bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 text-[11px] font-semibold text-rose-500 hover:bg-rose-500/20"
                            >
                              Overdue · Revise
                            </button>
                          ) : (
                            <span className="text-neutral-400 text-[11px]">
                              Pending
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
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Concept Notes & Formulas
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 text-xs text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-200 whitespace-pre-wrap font-sans leading-relaxed">
                  {topic.notes || 'No notes saved.'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
