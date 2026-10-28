import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
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
  CheckCircle,
} from 'lucide-react';

interface ReviewSessionDialogProps {
  reviewingTopic: {
    topic: Topic;
    stepIndex: number;
  };
}

const ReviewSessionDialog: React.FC<ReviewSessionDialogProps> = ({ reviewingTopic }) => {
  const { closeReviewSession, completeReview, state } = useApp();
  const { t } = useI18n();

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-3xl glass-premium shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-white/20 dark:border-white/10">
        {/* Top Bar with specular edge */}
        <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4 dark:border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-mono text-[#858A93] dark:text-[#777F8C]">
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
            <span className="text-xs font-semibold text-[#A97B32] dark:text-[#E6C27A]">
              {currentStep?.stageName || `Revision ${stepIndex}`} ({t('queue.stageBadge', 'Step')} {stepIndex + 1}/7)
            </span>
            <button
              onClick={closeReviewSession}
              className="rounded-xl p-1.5 text-[#858A93] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC] transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Topic Title Header */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
              {topic.title}
            </h2>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
              {t('session.title', 'Active Recall Session')} · ~{topic.estimatedDurationMinutes} min · {t('session.subtitle', 'Retrieve key formulas, principles, and concepts from memory before rating.')}
            </p>
          </div>

          {/* Active Recall Stage 1: Active Recall Before Viewing Notes */}
          <div className="rounded-2xl glass-subtle p-4 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="recall-prompt"
                className="text-xs font-semibold tracking-wide uppercase text-[#686D77] dark:text-[#A7ABB5] flex items-center gap-1.5"
              >
                <Brain className="h-3.5 w-3.5 text-[#E6C27A]" />
                <span>{t('session.recallNotes', 'Memory Reflections & Anchor Notes (Optional)')}</span>
              </label>
              <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">{t('session.subtitle', 'Retrieve before checking')}</span>
            </div>

            <textarea
              id="recall-prompt"
              rows={3}
              value={recallNotes}
              onChange={(e) => setRecallNotes(e.target.value)}
              placeholder={t('session.recallNotesPlaceholder', 'Write formulas, definitions, key cases or derivations from memory...')}
              className="w-full rounded-xl border border-black/[0.08] bg-white/70 p-3 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC] dark:placeholder-[#777F8C]"
            />
          </div>

          {/* Optional AI Recall Helper Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={handleGenerateQuestions}
              disabled={isAiLoadingQuestions}
              className="btn-glass-secondary inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#E6C27A]" />
              <span>{isAiLoadingQuestions ? t('common.loading', 'Loading...') : 'AI Practice Prompts'}</span>
            </button>

            <button
              onClick={handleExplain}
              disabled={isAiLoadingExplanation}
              className="btn-glass-secondary inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all"
            >
              <HelpCircle className="h-3.5 w-3.5 text-[#60A5FA]" />
              <span>{isAiLoadingExplanation ? t('common.loading', 'Loading...') : 'AI Exam Insights'}</span>
            </button>
          </div>

          {/* Display Generated AI Questions if active */}
          {aiQuestions && (
            <div className="rounded-2xl glass-subtle border border-[#E6C27A]/30 p-4 space-y-2">
              <div className="text-xs font-semibold text-[#8C6221] dark:text-[#FFE6AD] uppercase tracking-wide">
                Targeted Recall Questions:
              </div>
              <ul className="list-decimal list-inside space-y-1.5 text-xs text-[#20232A] dark:text-[#F6F3EC]">
                {aiQuestions.map((q, idx) => (
                  <li key={idx}>{q}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Display Generated AI Explanation if active */}
          {aiExplanation && (
            <div className="rounded-2xl glass-subtle border border-[#60A5FA]/30 p-4 space-y-1 text-xs text-[#20232A] dark:text-[#F6F3EC] whitespace-pre-line font-mono">
              {aiExplanation}
            </div>
          )}

          {/* Reveal Notes Action */}
          {!isNotesRevealed ? (
            <div className="pt-2 text-center">
              <button
                onClick={() => setIsNotesRevealed(true)}
                className="btn-gold-primary inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold transition-all active:scale-95"
              >
                <Eye className="h-4 w-4" />
                <span>{t('topicDetailModal.conceptNotes', 'Reveal Study Notes & Verification')}</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl glass-subtle p-4 space-y-2 border border-black/[0.08] dark:border-white/[0.08]">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                <span>{t('topicDetailModal.conceptNotes', 'Reference Notes')}</span>
                <span className="text-[11px] font-mono text-[#A97B32] dark:text-[#E6C27A]">Verified Concept</span>
              </div>
              <div className="prose prose-xs dark:prose-invert max-w-none text-xs text-[#20232A] dark:text-[#F6F3EC] leading-relaxed whitespace-pre-wrap font-sans">
                {topic.notes || t('topicDetailModal.noNotes', 'No reference notes provided when this topic was logged.')}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Active Recall Rating (Hard, Okay, Easy) */}
        <div className="border-t border-black/[0.06] bg-black/[0.02] p-4 sm:px-6 dark:border-white/[0.08] dark:bg-black/40 space-y-3">
          <div className="text-center text-xs font-medium text-[#686D77] dark:text-[#A7ABB5]">
            {t('session.howEasilyRecalled', 'How easily did you recall this concept?')}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Hard */}
            <button
              onClick={() => handleFinalSubmit('hard')}
              className="flex flex-col items-center justify-center rounded-2xl border border-[#F87171]/30 bg-white/60 py-3 px-2 text-center transition-all hover:bg-[#F87171]/10 dark:bg-black/30 dark:hover:bg-[#F87171]/15 active:scale-95"
            >
              <span className="text-xs font-semibold text-[#F87171]">
                {t('session.ratingHard', 'Hard')}
              </span>
              <span className="text-[10px] text-[#858A93] dark:text-[#777F8C]">
                {t('session.ratingHardSub', 'Struggled / Gaps')}
              </span>
            </button>

            {/* Okay */}
            <button
              onClick={() => handleFinalSubmit('okay')}
              className="flex flex-col items-center justify-center rounded-2xl border border-[#E6C27A]/30 bg-white/60 py-3 px-2 text-center transition-all hover:bg-[#E6C27A]/10 dark:bg-black/30 dark:hover:bg-[#E6C27A]/15 active:scale-95"
            >
              <span className="text-xs font-semibold text-[#A97B32] dark:text-[#FFE6AD]">
                {t('session.ratingOkay', 'Okay')}
              </span>
              <span className="text-[10px] text-[#858A93] dark:text-[#777F8C]">
                {t('session.ratingOkaySub', 'Recalled with effort')}
              </span>
            </button>

            {/* Easy */}
            <button
              onClick={() => handleFinalSubmit('easy')}
              className="flex flex-col items-center justify-center rounded-2xl border border-[#34D399]/30 bg-white/60 py-3 px-2 text-center transition-all hover:bg-[#34D399]/10 dark:bg-black/30 dark:hover:bg-[#34D399]/15 active:scale-95"
            >
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {t('session.ratingEasy', 'Easy')}
              </span>
              <span className="text-[10px] text-[#858A93] dark:text-[#777F8C]">
                {t('session.ratingEasySub', 'Instant recall')}
              </span>
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
