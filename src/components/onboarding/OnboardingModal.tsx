import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';

export const OnboardingModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { updateSettings } = useApp();

  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Physics',
    'Chemistry',
    'Mathematics',
    'Biology',
  ]);
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
      <div className="relative w-full max-w-lg rounded-3xl glass-premium p-6 sm:p-8 shadow-2xl flex flex-col space-y-6 border border-white/20 dark:border-white/10">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs text-[#858A93] dark:text-[#777F8C]">
          <span className="font-serif tracking-widest text-[#20232A] dark:text-[#F6F3EC] font-semibold">
            AURELIS
          </span>
          <span className="font-mono">Step {step} of 5</span>
        </div>

        {/* Step 1: Welcome & Vision */}
        {step === 1 && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1E2430] to-[#0E1118] text-[#E6C27A] border border-[#E6C27A]/30 shadow-md">
              <span className="font-serif text-2xl font-bold">A</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                Remember what matters.
              </h1>
              <p className="text-xs text-[#686D77] dark:text-[#A7ABB5] max-w-sm mx-auto leading-relaxed">
                Turn what you study today into what you remember months from now. Spaced repetition engineered for demanding academic examinations.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setStep(2)}
                className="w-full btn-gold-primary py-3 rounded-xl text-xs font-semibold shadow-md inline-flex items-center justify-center gap-2"
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
              <h2 className="text-lg font-bold text-[#20232A] dark:text-[#F6F3EC]">
                What do you study?
              </h2>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                Select your academic subjects. You can customize or add more anytime.
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
                    className={`flex items-center justify-between rounded-xl border p-2.5 transition-all text-left ${
                      isSelected
                        ? 'border-[#E6C27A]/60 bg-[#E6C27A]/15 text-[#20232A] dark:text-[#FFE6AD] font-semibold'
                        : 'border-black/[0.08] text-[#686D77] hover:border-[#E6C27A]/40 dark:border-white/[0.08] dark:text-[#A7ABB5]'
                    }`}
                  >
                    <span>{subj}</span>
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-gold-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
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
              <h2 className="text-lg font-bold text-[#20232A] dark:text-[#F6F3EC]">
                Daily Study Target
              </h2>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                How many new topics do you plan to study each day?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setDailyTarget(num)}
                  className={`flex flex-col items-center justify-center rounded-2xl border p-3 transition-all ${
                    dailyTarget === num
                      ? 'border-[#E6C27A] bg-[#E6C27A]/15 text-[#20232A] dark:text-[#FFE6AD] font-bold shadow-xs'
                      : 'border-black/[0.08] text-[#686D77] hover:border-[#E6C27A]/30 dark:border-white/[0.08] dark:text-[#A7ABB5]'
                  }`}
                >
                  <span className="font-mono text-xl tabular-nums">{num}</span>
                  <span className="text-[10px] text-[#858A93] dark:text-[#777F8C]">topic{num > 1 ? 's' : ''}/day</span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-[#858A93] dark:text-[#777F8C] text-center">
              A target of 3 topics/day yields ~18 high-retention active recall sessions per week.
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                onClick={() => setStep(2)}
                className="text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="btn-gold-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
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
              <h2 className="text-lg font-bold text-[#20232A] dark:text-[#F6F3EC]">
                Your Spaced Repetition Rhythm
              </h2>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                AURELIS uses an evidence-based 7-stage consolidation rhythm:
              </p>
            </div>

            <div className="rounded-2xl glass-subtle p-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-[#20232A] dark:text-[#F6F3EC]">
                <span>Day 1 — Learn</span>
                <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">Initial Encoding</span>
              </div>
              <div className="flex justify-between items-center text-[#20232A] dark:text-[#F6F3EC]">
                <span>Day 3 — Revision 1</span>
                <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">Interrupt early drop</span>
              </div>
              <div className="flex justify-between items-center text-[#20232A] dark:text-[#F6F3EC]">
                <span>Day 5 — Revision 2</span>
                <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">Reinforce recall</span>
              </div>
              <div className="flex justify-between items-center text-[#A97B32] dark:text-[#E6C27A] font-semibold">
                <span>Day 7 — Weekly Test</span>
                <span className="text-[11px]">Diagnostic milestone</span>
              </div>
              <div className="flex justify-between items-center text-[#20232A] dark:text-[#F6F3EC]">
                <span>Day 14 — Review 1</span>
                <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">Bi-weekly consolidation</span>
              </div>
              <div className="flex justify-between items-center text-[#20232A] dark:text-[#F6F3EC]">
                <span>Day 21 — Review 2</span>
                <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">Deep storage</span>
              </div>
              <div className="flex justify-between items-center text-[#20232A] dark:text-[#F6F3EC]">
                <span>Day 28 — Review 3</span>
                <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">Permanent memory</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                onClick={() => setStep(3)}
                className="text-xs text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="btn-gold-primary inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
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
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
              <Check className="h-7 w-7 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#20232A] dark:text-[#F6F3EC]">
                You're ready.
              </h2>
              <p className="text-xs text-[#686D77] dark:text-[#A7ABB5] max-w-sm mx-auto leading-relaxed">
                Log what you study today. Open AURELIS tomorrow to see exactly what needs your attention.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="w-full btn-gold-primary py-3 rounded-xl text-xs font-semibold shadow-md"
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
