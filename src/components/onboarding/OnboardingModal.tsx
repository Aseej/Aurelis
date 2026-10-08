import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_REVISION_INTERVALS } from '../../utils/scheduler';
import { Check, ArrowRight, ArrowLeft, Sparkles, BookOpen, Clock, Target } from 'lucide-react';

export const OnboardingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { updateSettings, state, addSubject } = useApp();

  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
  ]);
  const [customSubject, setCustomSubject] = useState('');
  const [dailyTarget, setDailyTarget] = useState(3);

  if (!isOpen) return null;

  const subjectOptions = [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
    'English',
    'Computer Science',
    'Economics',
    'History',
  ];

  const toggleSubject = (s: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((item) => item !== s) : [...prev, s]
    );
  };

  const handleFinish = () => {
    updateSettings({
      onboarded: true,
      targetDailyTopics: dailyTarget,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-8 shadow-2xl dark:border-neutral-800/90 dark:bg-[#0e0f14] flex flex-col space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs text-neutral-400">
          <span className="font-serif tracking-widest text-neutral-900 dark:text-neutral-100 font-semibold">
            AURELIS
          </span>
          <span className="font-mono">Step {step} of 5</span>
        </div>

        {/* Step 1: Welcome & Vision */}
        {step === 1 && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-amber-400/10 text-amber-500 ring-1 ring-amber-400/30">
              <span className="font-serif text-xl font-bold">A</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                Remember what matters.
              </h1>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Turn what you study today into what you remember months from now. Spaced repetition engineered for demanding academic examinations.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-xs font-semibold text-amber-300 shadow-md hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <span>Begin Setup</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: What do you study? */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                What do you study?
              </h2>
              <p className="text-xs text-neutral-500">
                Select your academic subjects. You can add or rename them anytime.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {subjectOptions.map((subj) => {
                const isSelected = selectedSubjects.includes(subj);
                return (
                  <button
                    key={subj}
                    type="button"
                    onClick={() => toggleSubject(subj)}
                    className={`flex items-center justify-between rounded-lg border p-2.5 transition-all text-left ${
                      isSelected
                        ? 'border-amber-500/80 bg-amber-500/10 text-neutral-900 dark:text-neutral-100 font-medium'
                        : 'border-neutral-200 text-neutral-600 hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-400'
                    }`}
                  >
                    <span>{subj}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-amber-500" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Daily Target */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                How much do you study?
              </h2>
              <p className="text-xs text-neutral-500">
                How many new topics do you usually study in a day?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDailyTarget(num)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                    dailyTarget === num
                      ? 'border-amber-500 bg-amber-500/10 text-neutral-950 dark:text-neutral-50 font-bold'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-800 dark:text-neutral-400'
                  }`}
                >
                  <span className="font-mono text-xl tabular-nums">{num}</span>
                  <span className="text-[10px] text-neutral-400">topic{num > 1 ? 's' : ''}/day</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-neutral-400 text-center">
              A target of 3 topics/day yields ~18 high-retention revisions/week.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Revision Rhythm */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-50">
                Your Spaced Repetition Rhythm
              </h2>
              <p className="text-xs text-neutral-500">
                AURELIS uses an evidence-based 7-stage consolidation rhythm:
              </p>
            </div>

            <div className="rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/40 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                <span>Day 1 — Learn</span>
                <span className="text-[11px] text-neutral-400">Initial Encoding</span>
              </div>
              <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                <span>Day 3 — Revision 1</span>
                <span className="text-[11px] text-neutral-400">Interrupt early drop</span>
              </div>
              <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                <span>Day 5 — Revision 2</span>
                <span className="text-[11px] text-neutral-400">Reinforce recall</span>
              </div>
              <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-semibold">
                <span>Day 7 — Weekly Test</span>
                <span className="text-[11px]">Diagnostic milestone</span>
              </div>
              <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                <span>Day 14 — Review 1</span>
                <span className="text-[11px] text-neutral-400">Bi-weekly consolidation</span>
              </div>
              <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                <span>Day 21 — Review 2</span>
                <span className="text-[11px] text-neutral-400">Deep storage</span>
              </div>
              <div className="flex justify-between items-center text-neutral-700 dark:text-neutral-300">
                <span>Day 28 — Review 3</span>
                <span className="text-[11px] text-neutral-400">Permanent memory</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setStep(3)}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
              >
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: You're Ready */}
        {step === 5 && (
          <div className="space-y-5 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <Check className="h-6 w-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-50">
                You're ready.
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                Log what you study today. Open AURELIS tomorrow to see exactly what needs your attention.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-semibold text-amber-300 shadow-md hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
              >
                Enter AURELIS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
