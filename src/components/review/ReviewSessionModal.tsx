import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  fetchAIPracticeQuestions,
  fetchAIConceptExplanation,
} from '../../services/geminiService';
import { Topic } from '../../types';
import {
  X,
  Eye,
  Sparkles,
  HelpCircle,
  Brain,
} from 'lucide-react';

interface ReviewSessionDialogProps {
  reviewingTopic: {
    topic: Topic;
    stepIndex: number;
  };
}

const ReviewSessionDialog: React.FC<ReviewSessionDialogProps> = ({ reviewingTopic }) => {
  const { closeReviewSession, completeReview, state } = useApp();

  const [recallNotes, setRecallNotes] = useState('');
  const [isNotesRevealed, setIsNotesRevealed] = useState(false);

  // Optional AI drawers
  const [aiQuestions, setAiQuestions] = useState<string[] | null>(null);
  const [isAiLoadingQuestions, setIsAiLoadingQuestions] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoadingExplanation, setIsAiLoadingExplanation] = useState(false);

  const { topic, stepIndex } = reviewingTopic;
  const currentStep = topic.schedule[stepIndex] || topic.schedule[0];

  const subject = state.subjects.find((s) => s.id === topic.subjectId) || {
    name: 'General',
    color: '#d4af37',
  };

  const handleGenerateQuestions = async () => {
    setIsAiLoadingQuestions(true);
    const res = await fetchAIPracticeQuestions(
      subject.name,
      topic.chapterName,
      topic.title,
      topic.notes
    );
    setAiQuestions(res.questions);
    setIsAiLoadingQuestions(false);
  };

  const handleExplain = async () => {
    setIsAiLoadingExplanation(true);
    const res = await fetchAIConceptExplanation(
      subject.name,
      topic.chapterName,
      topic.title,
      'exam_tips'
    );
    setAiExplanation(res.explanation);
    setIsAiLoadingExplanation(false);
  };

  const handleFinalSubmit = (rating: 'hard' | 'okay' | 'easy') => {
    completeReview(topic.id, stepIndex, rating, recallNotes);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200/90 bg-white shadow-2xl dark:border-neutral-800/90 dark:bg-[#0d0e12] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-3.5 dark:border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span
              className="font-semibold uppercase tracking-wider text-[11px]"
              style={{ color: subject.color }}
            >
              {subject.name}
            </span>
            <span aria-hidden="true">·</span>
            <span>{topic.chapterName}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {currentStep?.stageName || `Revision ${stepIndex}`} (Step {stepIndex + 1}/7)
            </span>
            <button
              onClick={closeReviewSession}
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              aria-label="Close review"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Topic Title Header */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
              {topic.title}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Estimated recall time: ~{topic.estimatedDurationMinutes} minutes · Focus on principles before details.
            </p>
          </div>

          {/* Active Recall Stage 1: Active Recall Before Viewing Notes */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="recall-prompt"
                className="text-xs font-semibold tracking-wide uppercase text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5"
              >
                <Brain className="h-3.5 w-3.5 text-amber-500" />
                <span>Recall Before Reviewing</span>
              </label>
              <span className="text-[11px] text-neutral-400">What can you remember?</span>
            </div>

            <textarea
              id="recall-prompt"
              rows={3}
              value={recallNotes}
              onChange={(e) => setRecallNotes(e.target.value)}
              placeholder="Write formulas, definitions, key cases or derivations from memory..."
              className="w-full rounded-lg border border-neutral-200 bg-white p-3 text-xs text-neutral-900 placeholder-neutral-400 focus:border-amber-500 focus:outline-none dark:border-neutral-700 dark:bg-[#121318] dark:text-neutral-100 dark:placeholder-neutral-500"
            />
          </div>

          {/* Optional AI Recall Helper Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={handleGenerateQuestions}
              disabled={isAiLoadingQuestions}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>{isAiLoadingQuestions ? 'Generating...' : 'AI Practice Prompts'}</span>
            </button>

            <button
              onClick={handleExplain}
              disabled={isAiLoadingExplanation}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-700 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-neutral-700"
            >
              <HelpCircle className="h-3.5 w-3.5 text-sky-500" />
              <span>{isAiLoadingExplanation ? 'Consulting...' : 'AI Concept Insight'}</span>
            </button>
          </div>

          {/* Display Generated AI Questions if active */}
          {aiQuestions && (
            <div className="rounded-xl border border-amber-300/40 bg-amber-50/50 p-4 dark:border-amber-400/20 dark:bg-amber-950/20 space-y-2">
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wide">
                Targeted Recall Questions:
              </div>
              <ul className="list-decimal list-inside space-y-1.5 text-xs text-neutral-800 dark:text-neutral-200">
                {aiQuestions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Display Generated AI Explanation if active */}
          {aiExplanation && (
            <div className="rounded-xl border border-sky-300/40 bg-sky-50/50 p-4 dark:border-sky-400/20 dark:bg-sky-950/20 space-y-1 text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line font-mono">
              {aiExplanation}
            </div>
          )}

          {/* Reveal Notes Action */}
          {!isNotesRevealed ? (
            <div className="pt-2 text-center">
              <button
                onClick={() => setIsNotesRevealed(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-5 py-2.5 text-xs font-semibold text-amber-300 shadow-sm transition-all hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-750"
              >
                <Eye className="h-4 w-4" />
                <span>Reveal Study Notes & Formulas</span>
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <span>Reference Notes</span>
                <span className="text-[11px] font-mono">Verified Concept</span>
              </div>
              <div className="prose prose-xs dark:prose-invert max-w-none text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans">
                {topic.notes || 'No reference notes provided when this topic was logged.'}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Active Recall Rating (Hard, Okay, Easy) */}
        <div className="border-t border-neutral-200/80 bg-neutral-50/90 p-4 sm:px-6 dark:border-neutral-800/80 dark:bg-[#0c0d10] space-y-3">
          <div className="text-center text-xs font-medium text-neutral-700 dark:text-neutral-300">
            How well did you remember?
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Hard */}
            <button
              onClick={() => handleFinalSubmit('hard')}
              className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-white py-2.5 px-2 text-center transition-all hover:border-rose-400 hover:bg-rose-50/50 dark:border-rose-900/50 dark:bg-neutral-900 dark:hover:bg-rose-950/20 active:scale-95"
            >
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Hard
              </span>
              <span className="text-[10px] text-neutral-400">Struggled / Gaps</span>
            </button>

            {/* Okay */}
            <button
              onClick={() => handleFinalSubmit('okay')}
              className="flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-white py-2.5 px-2 text-center transition-all hover:border-amber-400 hover:bg-amber-50/50 dark:border-amber-900/50 dark:bg-neutral-900 dark:hover:bg-amber-950/20 active:scale-95"
            >
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                Okay
              </span>
              <span className="text-[10px] text-neutral-400">Recalled with effort</span>
            </button>

            {/* Easy */}
            <button
              onClick={() => handleFinalSubmit('easy')}
              className="flex flex-col items-center justify-center rounded-xl border border-emerald-200 bg-white py-2.5 px-2 text-center transition-all hover:border-emerald-400 hover:bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-neutral-900 dark:hover:bg-emerald-950/20 active:scale-95"
            >
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Easy
              </span>
              <span className="text-[10px] text-neutral-400">Instant recall</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ReviewSessionModal: React.FC = () => {
  const { reviewingTopic } = useApp();

  if (!reviewingTopic) {
    return null;
  }

  return (
    <ReviewSessionDialog
      key={`${reviewingTopic.topic.id}-${reviewingTopic.stepIndex}`}
      reviewingTopic={reviewingTopic}
    />
  );
};
