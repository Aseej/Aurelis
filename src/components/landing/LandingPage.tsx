import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#20232A] dark:bg-[#090B10] dark:text-[#F6F3EC] transition-colors pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-1.5 text-xs text-[#686D77] dark:text-[#A7ABB5]">
          <span className="h-2 w-2 rounded-full bg-[#E6C27A]" />
          <span>Engineered for Demanding Academic Examinations</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC] max-w-3xl mx-auto leading-tight">
          Remember what matters.
        </h1>

        <p className="text-base sm:text-lg text-[#686D77] dark:text-[#A7ABB5] max-w-2xl mx-auto leading-relaxed">
          Your personal revision system for studying today and remembering tomorrow.
          Never manually calculate what you need to revise again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full sm:w-auto btn-gold-primary inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold shadow-md"
          >
            <span>Enter AURELIS Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto btn-glass-secondary inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-medium"
          >
            <span>See How It Works</span>
          </a>
        </div>
      </section>

      {/* 2. The Problem Statement */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="rounded-3xl glass-premium p-6 sm:p-10 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            The Fundamental Study Dilemma
          </span>
          <blockquote className="font-serif text-xl sm:text-2xl text-[#20232A] dark:text-[#F6F3EC] italic">
            «"I studied many things, but I don't know what I should revise today."»
          </blockquote>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
            Human memory decays rapidly along Ebbinghaus's forgetting curve. Students spend enormous mental energy trying to maintain spreadsheets, sticky notes, or guessing what to review, only to forget critical formulas weeks later. AURELIS removes the calculation burden entirely.
          </p>
        </div>
      </section>

      {/* 3. How AURELIS Works (Workflow) */}
      <section id="how-it-works" className="px-4 py-14 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Frictionless Daily Habit
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            How AURELIS Works
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: 'Study Something',
              desc: 'Learn your daily lectures, formulas, or textbook chapters as normal.',
            },
            {
              step: '02',
              title: 'Record in 10 Seconds',
              desc: 'Tell AURELIS what you studied, the subject, chapter, and key formulas.',
            },
            {
              step: '03',
              title: 'Autonomous Rhythm',
              desc: 'AURELIS builds an independent 7-step spaced repetition curve.',
            },
            {
              step: '04',
              title: 'Active Recall',
              desc: 'Open the app daily to see exactly what is due. Rate recall to lock in mastery.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-3xl glass-subtle p-5 space-y-2 transition-all hover:border-[#E6C27A]/30"
            >
              <div className="font-mono text-xs font-semibold text-[#A97B32] dark:text-[#E6C27A]">
                {item.step}
              </div>
              <h3 className="text-sm font-bold text-[#20232A] dark:text-[#F6F3EC]">
                {item.title}
              </h3>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C] leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Spaced Repetition Timeline */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Calendar-Deterministic Intervals
          </span>
          <h2 className="text-2xl font-bold text-[#20232A] dark:text-[#F6F3EC]">
            The Evidence-Based 7-Step Schedule
          </h2>
        </div>

        <div className="rounded-3xl glass-premium p-6 divide-y divide-black/[0.06] dark:divide-white/[0.08] text-xs">
          {[
            { day: 'Day 1', label: 'Learn', role: 'Initial neural encoding of core theorems.' },
            { day: 'Day 3', label: 'Revision 1', role: 'Interrupt the steepest 48-hour forgetting drop.' },
            { day: 'Day 5', label: 'Revision 2', role: 'Reconstruct memory without looking at notes.' },
            { day: 'Day 7', label: 'Weekly Test', role: 'Timed diagnostic application under exam rigor.' },
            { day: 'Day 14', label: 'Review 1', role: 'Bi-weekly retention validation.' },
            { day: 'Day 21', label: 'Review 2', role: 'Consolidate into long-term declarative storage.' },
            { day: 'Day 28', label: 'Review 3', role: 'Permanent cognitive anchor.' },
          ].map((row) => (
            <div key={row.day} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-[#20232A] dark:text-[#F6F3EC] w-16">
                  {row.day}
                </span>
                <span className="font-semibold text-[#A97B32] dark:text-[#E6C27A]">
                  {row.label}
                </span>
              </div>
              <span className="text-[#858A93] dark:text-[#777F8C] text-right">{row.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Core Architectural Pillars */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Built for Academic Mastery
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#20232A] dark:text-[#F6F3EC]">
            Four Pillars of Long-Term Retention
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-3xl glass-subtle p-6 space-y-2">
            <h3 className="text-base font-bold text-[#20232A] dark:text-[#F6F3EC] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#E6C27A] shrink-0" />
              <span>Autonomous Spaced Scheduling</span>
            </h3>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Record what you study in seconds. AURELIS builds an independent 7-step spaced repetition schedule for every topic, handling calendar month rollovers and leap years automatically.
            </p>
          </div>

          <div className="rounded-3xl glass-subtle p-6 space-y-2">
            <h3 className="text-base font-bold text-[#20232A] dark:text-[#F6F3EC] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#E6C27A] shrink-0" />
              <span>Distraction-Free Active Recall</span>
            </h3>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Prompts active memory retrieval before revealing study notes. Rate recall confidence to adaptively guide review intervals.
            </p>
          </div>

          <div className="rounded-3xl glass-subtle p-6 space-y-2">
            <h3 className="text-base font-bold text-[#20232A] dark:text-[#F6F3EC] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#E6C27A] shrink-0" />
              <span>Day 7 Diagnostic Milestones</span>
            </h3>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Topics reaching their 7-day milestone are automatically grouped for timed testing to validate recall retention under real examination conditions.
            </p>
          </div>

          <div className="rounded-3xl glass-subtle p-6 space-y-2">
            <h3 className="text-base font-bold text-[#20232A] dark:text-[#F6F3EC] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#E6C27A] shrink-0" />
              <span>Error Notebook & Mistake Analysis</span>
            </h3>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Deconstruct problem slips into clear categories (formula errors, calculation slips, conceptual misunderstandings) to prevent repeat mistakes.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#20232A] dark:text-[#F6F3EC]">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3.5 text-xs">
          {[
            {
              q: 'Can I study multiple topics or chapters on the same day?',
              a: 'Yes. Each topic you record receives its own independent 7-stage schedule. You can study Physics, Chemistry, and Math on the same day without schedules colliding.',
            },
            {
              q: 'How does AURELIS handle leap years, month boundaries, and local timezones?',
              a: 'The engine uses pure calendar date arithmetic rather than fragile millisecond timestamps. Rollovers across 28/29/30/31-day months and leap years are strictly preserved.',
            },
            {
              q: 'What if I miss a scheduled revision day?',
              a: 'Items become marked as Overdue and are surfaced at the very top of your queue so you can quickly catch up without losing your recall momentum.',
            },
          ].map(({ q, a }, idx) => (
            <div
              key={idx}
              className="rounded-2xl glass-subtle p-4 space-y-1.5"
            >
              <h3 className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">{q}</h3>
              <p className="text-[#858A93] dark:text-[#777F8C] leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final Launch CTA */}
      <section className="px-4 py-16 text-center space-y-4 border-t border-black/[0.06] dark:border-white/[0.08]">
        <h2 className="font-serif text-3xl font-bold text-[#20232A] dark:text-[#F6F3EC]">
          Begin your revision system today.
        </h2>
        <p className="text-xs text-[#858A93] dark:text-[#777F8C] max-w-md mx-auto">
          Start recording your chapters and lock in long-term mastery.
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="btn-gold-primary inline-flex items-center gap-2 rounded-xl px-7 py-3 text-xs font-semibold shadow-md"
        >
          <span>Launch AURELIS App</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
};
