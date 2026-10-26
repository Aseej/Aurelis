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
    const colors = ['#E6C27A', '#60A5FA', '#A78BFA', '#34D399', '#F472B6', '#FB923C'];
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl glass-premium shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-white/20 dark:border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4 dark:border-white/[0.08]">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
              Record What You Studied
            </h2>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
              AURELIS will automatically calculate and schedule your 7-step spaced revision curve.
            </p>
          </div>
          <button
            onClick={() => setIsAddTopicOpen(false)}
            className="rounded-xl p-1.5 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-500">
              {errorMsg}
            </div>
          )}

          {/* 1. Subject Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Subject
              </label>
              <button
                type="button"
                onClick={() => setIsNewSubjectMode(!isNewSubjectMode)}
                className="text-xs text-[#A97B32] hover:underline dark:text-[#E6C27A]"
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
                  className="flex-1 rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                />
                <button
                  type="button"
                  onClick={handleCreateNewSubject}
                  className="btn-gold-primary rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  Save Subject
                </button>
              </div>
            ) : (
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs font-medium text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
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
              <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Chapter / Unit
              </label>
              <input
                type="text"
                list="chapter-list"
                placeholder="e.g. Rotational Motion"
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                className="w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] dark:placeholder-[#777F8C]"
              />
              <datalist id="chapter-list">
                {chapterSuggestions.map((chap, idx) => (
                  <option key={idx} value={chap} />
                ))}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Topic Title
              </label>
              <input
                type="text"
                placeholder="e.g. Moment of Inertia & Parallel Axis Theorem"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] dark:placeholder-[#777F8C]"
              />
            </div>
          </div>

          {/* 3. Date Studied, Duration & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Date Studied
              </label>
              <input
                type="date"
                value={studiedDate}
                onChange={(e) => setStudiedDate(e.target.value)}
                className="w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Estimated Review Time
              </label>
              <select
                value={estimatedDurationMinutes}
                onChange={(e) => setEstimatedDurationMinutes(Number(e.target.value))}
                className="w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
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
              <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-black/[0.08] bg-black/[0.03] p-0.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
                {(['easy', 'moderate', 'difficult'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`rounded-lg py-1.5 text-[11px] font-medium capitalize transition-all ${
                      difficulty === level
                        ? 'bg-white text-[#20232A] shadow-xs dark:bg-white/[0.12] dark:text-[#FFE6AD] font-semibold'
                        : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
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
              <label className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Key Notes, Formulas & Concepts
              </label>
              <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">Shown during recall verification</span>
            </div>
            <textarea
              rows={4}
              placeholder="Record the governing equations, definitions, derivations, or problem-solving traps..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/70 p-3 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] dark:placeholder-[#777F8C] font-mono"
            />
          </div>

          {/* 5. Live Generated Spaced-Repetition Schedule Preview */}
          <div className="rounded-2xl glass-subtle p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              <span>Automatic Spaced Repetition Timeline</span>
              <span className="text-[11px] font-mono text-[#A97B32] dark:text-[#E6C27A]">7 Milestones</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {schedulePreview.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl glass-subtle p-2.5 space-y-0.5"
                >
                  <div className="text-[10px] font-medium text-[#858A93] dark:text-[#777F8C] truncate">
                    {item.stageName} (Day {item.offset + 1})
                  </div>
                  <div className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC] font-mono">
                    {formatDisplayDate(item.scheduledDate, false)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsAddTopicOpen(false)}
              className="rounded-xl px-4 py-2 text-xs font-medium text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold-primary rounded-xl px-5 py-2.5 text-xs font-semibold shadow-xs"
            >
              Confirm & Build Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
