import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MistakeCategory, ErrorLogEntry } from '../../types';
import { getTodayDateString, formatDisplayDate } from '../../utils/scheduler';
import { fetchAIErrorDiagnosis } from '../../services/geminiService';
import {
  AlertCircle,
  Plus,
  Check,
  Trash2,
  Sparkles,
  Search,
  X,
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
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            Error Notebook & Mistakes
          </h1>
          <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
            Analyze exam pitfalls and record conceptual corrections to eliminate repeat errors
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-gold-primary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
          <span>Record New Mistake</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-2xl glass-subtle p-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#858A93] dark:text-[#777F8C]" />
          <input
            type="text"
            placeholder="Search problems, mistake reasons, or correct methods..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-white/70 pl-8.5 pr-3 py-1.5 text-xs text-[#20232A] focus:outline-none focus:border-[#E6C27A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC] dark:focus:border-[#E6C27A]"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-black/[0.08] bg-white/70 px-3 py-1.5 text-[#20232A] focus:outline-none focus:border-[#E6C27A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC]"
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
          className="rounded-xl border border-black/[0.08] bg-white/70 px-3 py-1.5 text-[#20232A] focus:outline-none focus:border-[#E6C27A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC]"
        >
          <option value="all">All Subjects</option>
          {state.subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <div className="flex rounded-xl border border-black/[0.08] bg-black/[0.03] p-0.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
          {(['all', 'unresolved', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-[#20232A] shadow-xs dark:bg-white/[0.12] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Mistake Entries List */}
      <div className="space-y-3.5">
        {filteredErrors.length === 0 ? (
          <div className="rounded-2xl glass-subtle border border-dashed border-black/[0.1] dark:border-white/[0.1] p-10 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
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
                className={`rounded-3xl p-5 transition-all space-y-3.5 ${
                  err.resolved
                    ? 'glass-subtle opacity-75'
                    : 'glass-premium hover:border-[#E6C27A]/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#858A93] dark:text-[#777F8C]">
                      <span className="font-semibold uppercase text-[11px]" style={{ color: subj?.color }}>
                        {subj?.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{err.chapterName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#A97B32] dark:text-[#E6C27A] font-medium">
                        {CATEGORY_LABELS[err.mistakeCategory]}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{formatDisplayDate(err.date, false)}</span>
                    </div>

                    <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {err.questionOrProblem}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleErrorResolved(err.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-semibold transition-all ${
                        err.resolved
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'btn-glass-secondary'
                      }`}
                    >
                      <Check className="h-3 w-3 stroke-[2.5]" />
                      <span>{err.resolved ? 'Resolved' : 'Mark Resolved'}</span>
                    </button>

                    <button
                      onClick={() => deleteErrorLog(err.id)}
                      className="p-1.5 text-[#858A93] hover:text-[#F87171] rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* What went wrong vs Correct Method */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-2xl glass-subtle border border-[#F87171]/25 p-3.5 space-y-1">
                    <div className="font-semibold text-[#F87171] text-[11px] uppercase tracking-wide">
                      Mistake / Trap:
                    </div>
                    <p className="text-[#20232A] dark:text-[#F6F3EC] leading-relaxed font-mono">
                      {err.mistakeDescription}
                    </p>
                  </div>

                  <div className="rounded-2xl glass-subtle border border-[#34D399]/25 p-3.5 space-y-1">
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-[11px] uppercase tracking-wide">
                      Correct Method / Rule:
                    </div>
                    <p className="text-[#20232A] dark:text-[#F6F3EC] leading-relaxed font-mono">
                      {err.correctMethod}
                    </p>
                  </div>
                </div>

                {/* AI Cognitive Diagnosis Trigger */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleDiagnose(err)}
                    disabled={isDiagnosingThis}
                    className="inline-flex items-center gap-1.5 text-xs text-[#A97B32] dark:text-[#FFE6AD] font-medium hover:underline"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#E6C27A]" />
                    <span>
                      {isDiagnosingThis ? 'Diagnosing root cause...' : 'AI Cognitive Misconception Diagnosis'}
                    </span>
                  </button>
                </div>

                {hasDiagnosis && (
                  <div className="rounded-2xl glass-subtle border border-[#E6C27A]/30 p-3.5 text-xs text-[#20232A] dark:text-[#F6F3EC] space-y-1 font-mono">
                    <span className="font-semibold text-[#A97B32] dark:text-[#E6C27A]">
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-3xl glass-premium p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto border border-white/20 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 dark:border-white/[0.08]">
              <h2 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Log Exam or Practice Problem Mistake
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveError} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    Subject
                  </label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                  >
                    {state.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    Link to Topic (Optional)
                  </label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
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
                <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  Question or Problem Statement
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Find angular acceleration when rod is released from horizontal..."
                  value={problemText}
                  onChange={(e) => setProblemText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 p-2.5 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] dark:placeholder-[#777F8C]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  Mistake Classification
                </label>
                <select
                  value={mistakeCategory}
                  onChange={(e) => setMistakeCategory(e.target.value as MistakeCategory)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                >
                  {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
                    <option key={k} value={k}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  What did you do wrong?
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Forgot to account for center of mass torque, calculated torque about center rather than pivot..."
                  value={mistakeDescription}
                  onChange={(e) => setMistakeDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 p-2.5 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] dark:placeholder-[#777F8C] font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  Correct Method & Rule to Remember
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Torque about pivot is Mg * (L/2). Moment of inertia about end is ML^2 / 3. Angular acceleration = 3g / 2L."
                  value={correctMethod}
                  onChange={(e) => setCorrectMethod(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 p-2.5 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] dark:placeholder-[#777F8C] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-3 py-2 text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold-primary rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
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
