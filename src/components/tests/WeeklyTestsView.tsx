import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, formatDisplayDate } from '../../utils/scheduler';
import { fetchAIWeeklyTest, WeeklyTestQuestion } from '../../services/geminiService';
import {
  FileCheck2,
  Plus,
  Sparkles,
  CheckCircle,
  Clock,
  TrendingUp,
  Trash2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const WeeklyTestsView: React.FC = () => {
  const { state, weeklyTestsDue, addWeeklyTest, deleteWeeklyTest } = useApp();

  const todayStr = getTodayDateString();

  // Test Logging Form Modal
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [testTitle, setTestTitle] = useState('Diagnostic Milestone Test');
  const [testDate, setTestDate] = useState(todayStr);
  const [totalMarks, setTotalMarks] = useState(50);
  const [marksObtained, setMarksObtained] = useState(42);
  const [mistakesNotes, setMistakesNotes] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>(
    weeklyTestsDue.map((t) => t.id)
  );

  // AI Test Generation State
  const [aiGeneratedQuestions, setAiGeneratedQuestions] = useState<WeeklyTestQuestion[] | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isQuestionsDrawerOpen, setIsQuestionsDrawerOpen] = useState(false);

  // Group weekly tests due by subject
  const topicsDueBySubject = useMemo(() => {
    const map = new Map<string, { subjectName: string; color: string; topics: typeof state.topics }>();
    state.subjects.forEach((s) => {
      map.set(s.id, { subjectName: s.name, color: s.color, topics: [] });
    });

    weeklyTestsDue.forEach((topic) => {
      const entry = map.get(topic.subjectId);
      if (entry) {
        entry.topics.push(topic);
      }
    });

    return Array.from(map.values()).filter((e) => e.topics.length > 0);
  }, [weeklyTestsDue, state.subjects]);

  const handleGenerateAiTest = async () => {
    if (weeklyTestsDue.length === 0) return;
    setIsAiGenerating(true);
    setIsQuestionsDrawerOpen(true);
    const topicTitles = weeklyTestsDue.map((t) => `${t.chapterName}: ${t.title}`);
    const res = await fetchAIWeeklyTest(topicTitles);
    setAiGeneratedQuestions(res.testQuestions);
    setIsAiGenerating(false);
  };

  const handleSaveTest = (e: React.FormEvent) => {
    e.preventDefault();
    const tot = Number(totalMarks) || 50;
    const obt = Number(marksObtained) || 0;
    const pct = Math.round((obt / tot) * 100);

    addWeeklyTest({
      title: testTitle.trim() || 'Weekly Milestone Test',
      date: testDate,
      subjectId: 'all',
      topicIds: selectedTopicIds,
      totalMarks: tot,
      marksObtained: obt,
      percentage: pct,
      mistakesNotes: mistakesNotes.trim(),
      generalNotes: generalNotes.trim(),
    });

    setIsLogModalOpen(false);
    setMistakesNotes('');
    setGeneralNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Weekly Tests & Diagnostics
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Measure 7-day retention milestones and record examination scores
          </p>
        </div>

        <div className="flex items-center gap-2">
          {weeklyTestsDue.length > 0 && (
            <button
              onClick={handleGenerateAiTest}
              disabled={isAiGenerating}
              className="flex items-center gap-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-600 hover:bg-amber-500/20 dark:text-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isAiGenerating ? 'Synthesizing Test...' : 'Generate 5-Q Practice Test'}</span>
            </button>
          )}

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-amber-300 shadow-xs hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Log Test Score</span>
          </button>
        </div>
      </div>

      {/* 1. Topics Due for Weekly Test Banner */}
      <div className="rounded-xl border border-neutral-200/90 bg-white p-5 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Milestone Queue (Day 7 Retention)
            </div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              {weeklyTestsDue.length > 0
                ? `${weeklyTestsDue.length} Topics Ready for Testing`
                : 'All 7-day milestones current'}
            </h2>
          </div>

          {weeklyTestsDue.length > 0 && (
            <button
              onClick={() => {
                setSelectedTopicIds(weeklyTestsDue.map((t) => t.id));
                setIsLogModalOpen(true);
              }}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-amber-300 dark:bg-neutral-800"
            >
              Start Diagnostic Test
            </button>
          )}
        </div>

        {topicsDueBySubject.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {topicsDueBySubject.map(({ subjectName, color, topics }) => (
              <div
                key={subjectName}
                className="rounded-lg border border-neutral-200/60 bg-neutral-50/50 p-3 text-xs dark:border-neutral-800/60 dark:bg-neutral-900/30 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-[11px]" style={{ color }}>
                    {subjectName}
                  </span>
                  <span className="font-mono text-neutral-400">
                    {topics.length} topic{topics.length === 1 ? '' : 's'}
                  </span>
                </div>
                <ul className="text-neutral-600 dark:text-neutral-300 space-y-0.5 truncate text-[11px]">
                  {topics.slice(0, 3).map((t) => (
                    <li key={t.id} className="truncate">
                      · {t.title}
                    </li>
                  ))}
                  {topics.length > 3 && (
                    <li className="text-neutral-400">+{topics.length - 3} more</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Topics automatically enter this queue 6 days after their initial learning session.
          </p>
        )}
      </div>

      {/* 2. AI Generated 5-Question Test Drawer (if active) */}
      {isQuestionsDrawerOpen && aiGeneratedQuestions && (
        <div className="rounded-xl border border-amber-300/40 bg-amber-50/40 p-5 dark:border-amber-400/20 dark:bg-amber-950/20 space-y-4">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3 dark:border-amber-900/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                AI Diagnostic Question Sheet (5 High-Yield Questions)
              </h3>
            </div>
            <button
              onClick={() => setIsQuestionsDrawerOpen(false)}
              className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              Close Sheet
            </button>
          </div>

          <div className="space-y-3">
            {aiGeneratedQuestions.map((q) => (
              <div
                key={q.questionNumber}
                className="rounded-lg border border-amber-200/60 bg-white p-3 text-xs dark:border-amber-900/40 dark:bg-[#121318] space-y-1"
              >
                <div className="flex items-center justify-between font-mono text-[11px] text-neutral-400">
                  <span>Question #{q.questionNumber} · {q.topic}</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{q.marks} Marks</span>
                </div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {q.question}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-700 dark:text-neutral-300">Answer Key: </span>
                  {q.answerOutline}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Historical Test Records */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Test Performance History ({state.weeklyTests.length})
          </h2>
        </div>

        {state.weeklyTests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-400 dark:border-neutral-800">
            No diagnostic tests recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {state.weeklyTests.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-neutral-200/90 bg-white p-4 dark:border-neutral-800/90 dark:bg-[#111216] space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {t.title}
                    </h3>
                    <div className="text-[11px] text-neutral-500 font-mono">
                      Date: {formatDisplayDate(t.date, false)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold tabular-nums text-neutral-900 dark:text-neutral-100">
                        {t.marksObtained} / {t.totalMarks}
                      </div>
                      <div className="text-[11px] font-semibold text-amber-500">
                        {t.percentage}%
                      </div>
                    </div>

                    <button
                      onClick={() => deleteWeeklyTest(t.id)}
                      className="p-1 text-neutral-400 hover:text-rose-500"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {t.mistakesNotes && (
                  <div className="rounded-lg bg-neutral-50 p-2 text-xs text-neutral-600 dark:bg-neutral-900/60 dark:text-neutral-300">
                    <span className="font-semibold text-rose-500">Mistakes Noted: </span>
                    {t.mistakesNotes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Test Score Modal */}
      {isLogModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-[#0e0f14] space-y-4">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Record Weekly Diagnostic Score
            </h2>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Test Title
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-2 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                    Marks Obtained
                  </label>
                  <input
                    type="number"
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Mistakes & Error Reflections
                </label>
                <textarea
                  rows={3}
                  placeholder="Which questions were missed and why? (Formula confusion, misread conditions, calculation error)..."
                  value={mistakesNotes}
                  onChange={(e) => setMistakesNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 p-2.5 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
                >
                  Save Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
