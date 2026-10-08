import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MistakeCategory, ErrorLogEntry } from '../../types';
import { getTodayDateString, formatDisplayDate } from '../../utils/scheduler';
import { fetchAIErrorDiagnosis } from '../../services/geminiService';
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Trash2,
  Sparkles,
  Search,
  Filter,
  Check,
  RotateCcw,
} from 'lucide-react';

const CATEGORY_LABELS: Record<MistakeCategory, string> = {
  forgot_concept: 'Forgot Concept',
  weak_recall: 'Weak Recall',
  formula_error: 'Formula Error',
  calculation_error: 'Calculation Error',
  misread_question: 'Misread Question',
  careless_mistake: 'Careless Mistake',
  conceptual_misunderstanding: 'Conceptual Misunderstanding',
  other: 'Other Pitfall',
};

export const ErrorLogView: React.FC = () => {
  const { state, addErrorLog, toggleErrorResolved, deleteErrorLog } = useApp();

  const todayStr = getTodayDateString();

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Error Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [problemText, setProblemText] = useState('');
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id || 'subj_physics');
  const [chapterName, setChapterName] = useState('');
  const [topicId, setTopicId] = useState<string>('');
  const [mistakeCategory, setMistakeCategory] = useState<MistakeCategory>('formula_error');
  const [mistakeDescription, setMistakeDescription] = useState('');
  const [correctMethod, setCorrectMethod] = useState('');

  // AI Diagnosis drawer
  const [activeDiagnosisId, setActiveDiagnosisId] = useState<string | null>(null);
  const [diagnosisText, setDiagnosisText] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  // Topics for selected subject in modal
  const topicsForModal = useMemo(() => {
    return state.topics.filter((t) => t.subjectId === subjectId);
  }, [state.topics, subjectId]);

  // Filtered error list
  const filteredErrors = useMemo(() => {
    return state.errorLogs.filter((err) => {
      if (selectedCategory !== 'all' && err.mistakeCategory !== selectedCategory) return false;
      if (selectedSubject !== 'all' && err.subjectId !== selectedSubject) return false;
      if (statusFilter === 'unresolved' && err.resolved) return false;
      if (statusFilter === 'resolved' && !err.resolved) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          err.questionOrProblem.toLowerCase().includes(q) ||
          err.mistakeDescription.toLowerCase().includes(q) ||
          err.correctMethod.toLowerCase().includes(q) ||
          err.topicTitle.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [state.errorLogs, selectedCategory, selectedSubject, statusFilter, searchQuery]);

  const handleDiagnose = async (entry: ErrorLogEntry) => {
    setActiveDiagnosisId(entry.id);
    setIsDiagnosing(true);
    const res = await fetchAIErrorDiagnosis(
      entry.questionOrProblem,
      entry.mistakeDescription,
      entry.correctMethod,
      entry.topicTitle
    );
    setDiagnosisText(res.analysis);
    setIsDiagnosing(false);
  };

  const handleSaveError = (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim() || !mistakeDescription.trim()) return;

    const chosenTopic = state.topics.find((t) => t.id === topicId);

    addErrorLog({
      questionOrProblem: problemText.trim(),
      subjectId,
      chapterName: chapterName.trim() || chosenTopic?.chapterName || 'General Chapter',
      topicId: topicId || undefined,
      topicTitle: chosenTopic ? chosenTopic.title : problemText.slice(0, 30),
      mistakeCategory,
      mistakeDescription: mistakeDescription.trim(),
      correctMethod: correctMethod.trim(),
      date: todayStr,
      resolved: false,
    });

    setIsModalOpen(false);
    setProblemText('');
    setMistakeDescription('');
    setCorrectMethod('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Error Notebook & Mistakes
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Deconstruct exam mistakes to prevent repeated cognitive missteps
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-xs hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Record New Mistake</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-neutral-200/90 bg-white p-3 dark:border-neutral-800/90 dark:bg-[#111216] text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search problems, mistake reasons, or correct methods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
            <option key={k} value={k}>
              {label}
            </option>
          ))}
        </select>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <option value="all">All Subjects</option>
          {state.subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <div className="flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700">
          {(['all', 'unresolved', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded px-2 py-1 text-[11px] font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Mistake Entries List */}
      <div className="space-y-3">
        {filteredErrors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-400 dark:border-neutral-800">
            Clean slate. No mistakes match your active filter.
          </div>
        ) : (
          filteredErrors.map((err) => {
            const subj = state.subjects.find((s) => s.id === err.subjectId);
            const isDiagnosingThis = isDiagnosing && activeDiagnosisId === err.id;
            const hasDiagnosis = activeDiagnosisId === err.id && diagnosisText;

            return (
              <div
                key={err.id}
                className={`rounded-xl border bg-white p-4 transition-all dark:bg-[#111216] space-y-3 ${
                  err.resolved
                    ? 'border-neutral-200/60 opacity-75 dark:border-neutral-800/60'
                    : 'border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                      <span className="font-semibold uppercase text-[11px]" style={{ color: subj?.color }}>
                        {subj?.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{err.chapterName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">
                        {CATEGORY_LABELS[err.mistakeCategory]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{formatDisplayDate(err.date, false)}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {err.questionOrProblem}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleErrorResolved(err.id)}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                        err.resolved
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                      <span>{err.resolved ? 'Resolved' : 'Mark Resolved'}</span>
                    </button>

                    <button
                      onClick={() => deleteErrorLog(err.id)}
                      className="p-1 text-neutral-400 hover:text-rose-500"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* What went wrong vs Correct Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg border border-rose-200/60 bg-rose-50/30 p-2.5 dark:border-rose-950/40 dark:bg-rose-950/10 space-y-1">
                    <div className="font-semibold text-rose-600 dark:text-rose-400 text-[11px]">
                      Mistake / Trap:
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-mono">
                      {err.mistakeDescription}
                    </p>
                  </div>

                  <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/30 p-2.5 dark:border-emerald-950/40 dark:bg-emerald-950/10 space-y-1">
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px]">
                      Correct Method / Rule:
                    </div>
                    <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-mono">
                      {err.correctMethod}
                    </p>
                  </div>
                </div>

                {/* AI Cognitive Diagnosis Trigger */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleDiagnose(err)}
                    disabled={isDiagnosingThis}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>
                      {isDiagnosingThis ? 'Diagnosing root cause...' : 'AI Cognitive Misconception Diagnosis'}
                    </span>
                  </button>
                </div>

                {hasDiagnosis && (
                  <div className="rounded-lg border border-amber-300/40 bg-amber-50/60 p-3 text-xs text-neutral-800 dark:border-amber-500/20 dark:bg-amber-950/20 dark:text-neutral-200 space-y-1 font-mono">
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      Cognitive Diagnosis:
                    </span>
                    <p>{diagnosisText}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Record Mistake Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#0e0f14] space-y-4 max-h-[92vh] overflow-y-auto">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Log Exam or Practice Problem Mistake
            </h2>

            <form onSubmit={handleSaveError} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  >
                    {state.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Link to Topic (Optional)
                  </label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  >
                    <option value="">No specific topic</option>
                    {topicsForModal.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Question or Problem Statement
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Find angular acceleration when rod is released from horizontal..."
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Mistake Classification
                </label>
                <select
                  value={mistakeCategory}
                  onChange={(e) => setMistakeCategory(e.target.value as MistakeCategory)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  What did you do wrong?
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Forgot to account for center of mass torque, calculated torque about center rather than pivot..."
                  value={mistakeDescription}
                  onChange={(e) => setMistakeDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Correct Method & Rule to Remember
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Torque about pivot is Mg * (L/2). Moment of inertia about end is ML^2 / 3. Angular acceleration = 3g / 2L."
                  value={correctMethod}
                  onChange={(e) => setCorrectMethod(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
                >
                  Save Mistake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
