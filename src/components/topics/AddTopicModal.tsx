import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getTodayDateString,
  addCalendarDays,
  DEFAULT_REVISION_INTERVALS,
  STAGE_NAMES,
  formatDisplayDate,
} from '../../utils/scheduler';
import { X, Calendar, Clock, BookOpen, Layers, Check, Plus } from 'lucide-react';

export const AddTopicModal: React.FC = () => {
  const { isAddTopicOpen, setIsAddTopicOpen, addTopic, state, addSubject } = useApp();

  const [subjectId, setSubjectId] = useState<string>(
    state.subjects[0]?.id || 'subj_physics'
  );
  const [chapterName, setChapterName] = useState('');
  const [title, setTitle] = useState('');
  const [studiedDate, setStudiedDate] = useState(getTodayDateString());
  const [estimatedDurationMinutes, setEstimatedDurationMinutes] = useState(20);
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'difficult'>('moderate');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Quick subject creation mode
  const [isNewSubjectMode, setIsNewSubjectMode] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Existing chapter suggestions for the selected subject
  const chapterSuggestions = useMemo(() => {
    const chapters = new Set<string>();
    state.topics
      .filter((t) => t.subjectId === subjectId)
      .forEach((t) => {
        if (t.chapterName) chapters.add(t.chapterName);
      });
    return Array.from(chapters);
  }, [state.topics, subjectId]);

  // Live schedule preview calculation based on selected studiedDate
  const schedulePreview = useMemo(() => {
    const intervals = state.settings.revisionIntervals || DEFAULT_REVISION_INTERVALS;
    return intervals.map((offset, index) => {
      const scheduledDate = addCalendarDays(studiedDate, offset);
      return {
        stageName: STAGE_NAMES[index] || `Revision ${index}`,
        offset,
        scheduledDate,
      };
    });
  }, [studiedDate, state.settings.revisionIntervals]);

  if (!isAddTopicOpen) return null;

  const handleCreateNewSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    const colors = ['#f59e0b', '#06b6d4', '#8b5cf6', '#10b981', '#ec4899', '#f97316'];
    const randomColor = colors[state.subjects.length % colors.length];
    addSubject({
      name: newSubjectName.trim(),
      color: randomColor,
      iconName: 'Book',
    });
    setNewSubjectName('');
    setIsNewSubjectMode(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please enter a topic title.');
      return;
    }
    if (!chapterName.trim()) {
      setErrorMsg('Please enter a chapter or unit name.');
      return;
    }
    if (!studiedDate) {
      setErrorMsg('Please select a valid study date.');
      return;
    }

    addTopic({
      subjectId,
      chapterName: chapterName.trim(),
      title: title.trim(),
      studiedDate,
      estimatedDurationMinutes: Number(estimatedDurationMinutes) || 20,
      difficulty,
      notes: notes.trim(),
    });

    // Reset fields & close
    setTitle('');
    setNotes('');
    setIsAddTopicOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200/90 bg-white shadow-2xl dark:border-neutral-800/90 dark:bg-[#0e0f14] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4 dark:border-neutral-800/80">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Record What You Studied
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              AURELIS will automatically generate your personalized spaced repetition schedule.
            </p>
          </div>
          <button
            onClick={() => setIsAddTopicOpen(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-xs text-rose-500">
              {errorMsg}
            </div>
          )}

          {/* 1. Subject Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Subject
              </label>
              <button
                type="button"
                onClick={() => setIsNewSubjectMode(!isNewSubjectMode)}
                className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
              >
                {isNewSubjectMode ? 'Cancel' : '+ Add Subject'}
              </button>
            </div>

            {isNewSubjectMode ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Computer Science, English..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
                <button
                  type="button"
                  onClick={handleCreateNewSubject}
                  className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
                >
                  Save Subject
                </button>
              </div>
            ) : (
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800 focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
              >
                {state.subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 2. Chapter & Topic Title (Row) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Chapter / Unit
              </label>
              <input
                type="text"
                list="chapter-list"
                placeholder="e.g. Rotational Motion"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
              <datalist id="chapter-list">
                {chapterSuggestions.map((chap, idx) => (
                  <option key={idx} value={chap} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Topic Title
              </label>
              <input
                type="text"
                placeholder="e.g. Moment of Inertia & Theorems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* 3. Date Studied, Duration & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Date Studied
              </label>
              <input
                type="date"
                value={studiedDate}
                onChange={(e) => setStudiedDate(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Estimated Review Time
              </label>
              <select
                value={estimatedDurationMinutes}
                onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              >
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>60 minutes</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-lg border border-neutral-300 p-0.5 dark:border-neutral-700">
                {(['easy', 'moderate', 'difficult'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`rounded py-1 text-[11px] font-medium capitalize transition-colors ${
                      difficulty === level
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Notes & Core Formulas */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Key Notes, Formulas & Concepts
              </label>
              <span className="text-[11px] text-neutral-400">Used during recall review</span>
            </div>
            <textarea
              rows={4}
              placeholder="Record the governing equations, definitions, derivations, or problem-solving traps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder-neutral-500 font-mono"
            />
          </div>

          {/* 5. Live Generated Spaced-Repetition Schedule Preview */}
          <div className="rounded-xl border border-neutral-200/90 bg-neutral-50/70 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <span>Automatic Spaced Repetition Timeline</span>
              <span className="text-[11px] font-mono">7 Milestones</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {schedulePreview.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-neutral-200/60 bg-white p-2 dark:border-neutral-800/60 dark:bg-[#121318]"
                >
                  <div className="text-[10px] font-medium text-neutral-400 truncate">
                    {item.stageName} (Day {item.offset + 1})
                  </div>
                  <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 font-mono">
                    {formatDisplayDate(item.scheduledDate, false)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-neutral-200/60 dark:border-neutral-800/60">
            <button
              type="button"
              onClick={() => setIsAddTopicOpen(false)}
              className="rounded-lg px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-neutral-900 px-5 py-2 text-xs font-semibold text-amber-300 shadow-sm transition-all hover:bg-neutral-800 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Confirm & Build Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
