import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString, formatDisplayDate } from '../../utils/scheduler';
import { fetchAIWeeklyTest, WeeklyTestQuestion } from '../../services/geminiService';
import {
  FileCheck2,
  Plus,
  Sparkles,
  Trash2,
  X,
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
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            Weekly Tests & Diagnostics
          </h1>
          <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
            Assess 7-day retention milestones and record examination scores
          </p>
        </div>

        <div className="flex items-center gap-2">
          {weeklyTestsDue.length > 0 && (
            <button
              onClick={handleGenerateAiTest}
              disabled={isAiGenerating}
              className="btn-glass-secondary flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#E6C27A]" />
              <span>{isAiGenerating ? 'Synthesizing Test...' : 'Generate 5-Q Practice Test'}</span>
            </button>
          )}

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="btn-gold-primary flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>Log Test Score</span>
          </button>
        </div>
      </div>

      {/* 1. Topics Due for Weekly Test Banner */}
      <div className="rounded-3xl glass-hero p-5 sm:p-7 space-y-4 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
              Milestone Queue (Day 7 Retention)
            </div>
            <h2 className="text-lg font-bold text-[#20232A] dark:text-[#F6F3EC]">
              {weeklyTestsDue.length > 0
                ? `${weeklyTestsDue.length} Topics Ready for Testing`
                : 'All 7-day milestone checkpoints current'}
            </h2>
          </div>

          {weeklyTestsDue.length > 0 && (
            <button
              onClick={() => {
                setSelectedTopicIds(weeklyTestsDue.map((t) => t.id));
                setIsLogModalOpen(true);
              }}
              className="btn-gold-primary self-start sm:self-auto rounded-xl px-4 py-2 text-xs font-semibold shadow-xs transition-all"
            >
              Start Diagnostic Test
            </button>
          )}
        </div>

        {topicsDueBySubject.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {topicsDueBySubject.map(({ subjectName, color, topics }) => (
              <div
                key={subjectName}
                className="rounded-2xl glass-subtle p-3.5 text-xs space-y-1.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold uppercase text-[11px]" style={{ color }}>
                    {subjectName}
                  </span>
                  <span className="font-mono text-[#858A93] dark:text-[#777F8C]">
                    {topics.length} topic{topics.length === 1 ? '' : 's'}
                  </span>
                </div>
                <ul className="text-[#686D77] dark:text-[#A7ABB5] space-y-0.5 truncate text-[11px]">
                  {topics.slice(0, 3).map((t) => (
                    <li key={t.id} className="truncate">
                      · {t.title}
                    </li>
                  ))}
                  {topics.length > 3 && (
                    <li className="text-[#858A93] dark:text-[#777F8C]">+{topics.length - 3} more</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
            Topics automatically enter this queue 6 days after their initial learning session.
          </p>
        )}
      </div>

      {/* 2. AI Generated 5-Question Test Drawer (if active) */}
      {isQuestionsDrawerOpen && aiGeneratedQuestions && (
        <div className="rounded-3xl glass-premium border border-[#E6C27A]/30 p-5 sm:p-6 space-y-4 transition-all">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#E6C27A]" />
              <h3 className="text-sm font-bold text-[#20232A] dark:text-[#F6F3EC]">
                Diagnostic Question Sheet (5 High-Yield Questions)
              </h3>
            </div>
            <button
              onClick={() => setIsQuestionsDrawerOpen(false)}
              className="text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
            >
              Close Sheet
            </button>
          </div>

          <div className="space-y-3">
            {aiGeneratedQuestions.map((q) => (
              <div
                key={q.questionNumber}
                className="rounded-2xl glass-subtle p-4 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-mono text-[11px] text-[#858A93] dark:text-[#777F8C]">
                  <span>Question #{q.questionNumber} · {q.topic}</span>
                  <span className="font-semibold text-[#A97B32] dark:text-[#E6C27A]">{q.marks} Marks</span>
                </div>
                <div className="font-medium text-[#20232A] dark:text-[#F6F3EC]">
                  {q.question}
                </div>
                <div className="text-[11px] text-[#858A93] dark:text-[#777F8C] pt-1.5 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <span className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">Answer Key: </span>
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
          <h2 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
            Test Performance History ({state.weeklyTests.length})
          </h2>
        </div>

        {state.weeklyTests.length === 0 ? (
          <div className="rounded-2xl glass-subtle border border-dashed border-black/[0.1] dark:border-white/[0.1] p-10 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
            No diagnostic tests recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {state.weeklyTests.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl glass-subtle p-4.5 space-y-2 transition-all hover:border-[#E6C27A]/30"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {t.title}
                    </h3>
                    <div className="text-[11px] text-[#858A93] dark:text-[#777F8C] font-mono">
                      Date: {formatDisplayDate(t.date, false)}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-mono text-lg font-bold tabular-nums text-[#20232A] dark:text-[#F6F3EC]">
                        {t.marksObtained} / {t.totalMarks}
                      </div>
                      <div className="text-[11px] font-semibold text-[#A97B32] dark:text-[#E6C27A]">
                        {t.percentage}%
                      </div>
                    </div>

                    <button
                      onClick={() => deleteWeeklyTest(t.id)}
                      className="p-1.5 text-[#858A93] hover:text-[#F87171] rounded-lg transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {t.mistakesNotes && (
                  <div className="rounded-xl glass-subtle p-2.5 text-xs text-[#686D77] dark:text-[#A7ABB5] border border-black/[0.04] dark:border-white/[0.04]">
                    <span className="font-semibold text-[#F87171]">Mistakes Noted: </span>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
        >
          <div className="relative w-full max-w-lg rounded-3xl glass-premium p-6 shadow-2xl space-y-4 border border-white/20 dark:border-white/10">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3 dark:border-white/[0.08]">
              <h2 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                Record Weekly Diagnostic Score
              </h2>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTest} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  Test Title
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    Test Date
                  </label>
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-2 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    Marks Obtained
                  </label>
                  <input
                    type="number"
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  Mistakes & Error Reflections
                </label>
                <textarea
                  rows={3}
                  placeholder="Which questions were missed and why? (Formula confusion, misread conditions, calculation error)..."
                  value={mistakesNotes}
                  onChange={(e) => setMistakesNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 p-2.5 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] dark:placeholder-[#777F8C]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="rounded-xl px-3 py-2 text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold-primary rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
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
