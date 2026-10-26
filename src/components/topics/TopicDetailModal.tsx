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
                <span>Edit</span>
              </button>
            ) : (
              <button
                onClick={handleSave}
                className="btn-gold-primary flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-semibold"
              >
                <Check className="h-3 w-3 stroke-[2.5]" />
                <span>Save</span>
              </button>
            )}

            <button
              onClick={handleDelete}
              className="rounded-xl p-1.5 text-[#F87171] hover:bg-[#F87171]/10 transition-colors"
              title="Delete Topic"
              aria-label="Delete Topic"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  Topic Title
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
                  Chapter
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
                    Studied Date
                  </label>
                  <input
                    type="date"
                    value={editedStudiedDate}
                    onChange={(e) => setEditedStudiedDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                  />
                  <p className="mt-1 text-[10px] text-[#858A93] dark:text-[#777F8C]">
                    Safely shifts future uncompleted repetitions.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    Est. Duration (min)
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
                  Notes
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
                  <span>Studied: {formatDisplayDate(topic.studiedDate, false)}</span>
                  <span aria-hidden="true">·</span>
                  <span>Est. Review: ~{topic.estimatedDurationMinutes} min</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{topic.difficulty} Difficulty</span>
                </div>
              </div>

              {/* Revision Schedule History & Progression */}
              <div className="rounded-2xl glass-subtle p-4 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                  Spaced Repetition Milestones (7-Step Curve)
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
                              Scheduled: {formatDisplayDate(item.scheduledDate, false)}
                              {item.completedDate && ` · Completed: ${formatDisplayDate(item.completedDate, false)}`}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isDone ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                              Completed {item.confidenceRating && `(${item.confidenceRating})`}
                            </span>
                          ) : isOverdue ? (
                            <button
                              onClick={() => {
                                startReviewSession(topic.id, item.stepIndex);
                                onClose();
                              }}
                              className="rounded-lg bg-[#F87171]/15 border border-[#F87171]/30 px-2.5 py-1 text-[11px] font-semibold text-[#F87171] hover:bg-[#F87171]/25"
                            >
                              Overdue · Revise
                            </button>
                          ) : (
                            <span className="text-[#858A93] dark:text-[#777F8C] text-[11px]">
                              Scheduled
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
                  Concept Notes & Formulas
                </div>
                <div className="rounded-2xl glass-subtle p-4 text-xs text-[#20232A] dark:text-[#F6F3EC] whitespace-pre-wrap font-sans leading-relaxed">
                  {topic.notes || 'No reference notes saved.'}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
