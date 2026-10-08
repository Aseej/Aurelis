import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Calendar,
  CheckCircle2,
  FileCheck2,
  Shield,
  HelpCircle,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView } = useApp();

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 dark:bg-[#0a0b0e] dark:text-neutral-100 transition-colors">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300/80 bg-white/70 px-3 py-1 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>Engineered for Class 11/12 & Academic Entrance Aspirants</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50 max-w-3xl mx-auto leading-tight">
          Remember what matters.
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Your personal revision system for learning today and remembering tomorrow.
          Never manually calculate what you need to revise again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-sm font-semibold text-amber-300 shadow-md transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <span>Enter AURELIS Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-white px-6 py-3 text-sm font-medium text-neutral-800 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <span>See How It Works</span>
          </a>
        </div>
      </section>

      {/* 2. The Problem Statement */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-neutral-200/80 dark:border-neutral-800/80">
        <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 sm:p-10 shadow-xs dark:border-neutral-800/90 dark:bg-[#111216] space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            The Fundamental Problem
          </span>
          <blockquote className="font-serif text-xl sm:text-2xl text-neutral-900 dark:text-neutral-100 italic">
            «"I studied many things, but I don't know what I should revise today."»
          </blockquote>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
            Human memory decays rapidly along Ebbinghaus's forgetting curve. Students spend enormous mental energy trying to maintain spreadsheets, sticky notes, or guessing what to review, only to forget critical formulas weeks later. AURELIS removes the calculation burden entirely.
          </p>
        </div>
      </section>

      {/* 3. How AURELIS Works (Workflow) */}
      <section id="how-it-works" className="px-4 py-16 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Frictionless Daily Habit
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-neutral-50">
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
              className="rounded-xl border border-neutral-200/90 bg-white p-5 dark:border-neutral-800/90 dark:bg-[#111216] space-y-2"
            >
              <div className="font-mono text-xs font-semibold text-amber-600 dark:text-amber-400">
                {item.step}
              </div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                {item.title}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Spaced Repetition Timeline */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Calendar-Deterministic Intervals
          </span>
          <h2 className="text-2xl font-bold text-neutral-950 dark:text-neutral-50">
            The Evidence-Based 7-Step Schedule
          </h2>
        </div>

        <div className="rounded-xl border border-neutral-200/90 bg-white p-6 dark:border-neutral-800/90 dark:bg-[#111216] divide-y divide-neutral-100 dark:divide-neutral-800/60 text-xs">
          {[
            { day: 'Day 1', label: 'Learn', role: 'Initial neural encoding of core theorems.' },
            { day: 'Day 3', label: 'Revision 1', role: 'Interrupt the steepest 48-hour forgetting drop.' },
            { day: 'Day 5', label: 'Revision 2', role: 'Reconstruct memory without looking at notes.' },
            { day: 'Day 7', label: 'Weekly Test', role: 'Timed diagnostic application under exam rigor.' },
            { day: 'Day 14', label: 'Review 1', role: 'Bi-weekly retention validation.' },
            { day: 'Day 21', label: 'Review 2', role: 'Consolidate into long-term declarative storage.' },
            { day: 'Day 28', label: 'Review 3', role: 'Permanent cognitive anchor.' },
          ].map((row) => (
            <div key={row.day} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100 w-16">
                  {row.day}
                </span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {row.label}
                </span>
              </div>
              <span className="text-neutral-500 text-right">{row.role}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Core Architectural Pillars */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Built for Academic Mastery
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 dark:text-neutral-50">
            Four Pillars of Long-Term Retention
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 dark:border-neutral-800/90 dark:bg-[#111216] space-y-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Autonomous Spaced Scheduling</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Record what you study in seconds. AURELIS builds an independent 7-step spaced repetition schedule for every topic, handling month rollovers and leap years automatically.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 dark:border-neutral-800/90 dark:bg-[#111216] space-y-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Distraction-Free Active Recall</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Prompts active memory retrieval before revealing study notes. Rate recall confidence to adaptively guide review intervals.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 dark:border-neutral-800/90 dark:bg-[#111216] space-y-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Day 7 Diagnostic Milestones</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Topics reaching their 7-day milestone are automatically grouped for timed testing to validate recall retention under real examination conditions.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200/90 bg-white p-6 dark:border-neutral-800/90 dark:bg-[#111216] space-y-2">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Error Notebook & Mistake Analysis</span>
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Deconstruct problem slips into clear categories (formula errors, calculation slips, conceptual misunderstandings) to prevent repeat mistakes.
            </p>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-neutral-200/80 dark:border-neutral-800/80 space-y-6">
        <h2 className="text-2xl font-bold text-center text-neutral-950 dark:text-neutral-50">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4 text-xs">
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
            {
              q: 'Does AURELIS require an internet connection?',
              a: 'No. The entire core application is built with a local-first architecture. All records persist on your device.',
            },
          ].map(({ q, a }, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-neutral-200/90 bg-white p-4 dark:border-neutral-800/90 dark:bg-[#111216] space-y-1.5"
            >
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{q}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Final Launch CTA */}
      <section className="px-4 py-20 text-center space-y-4 border-t border-neutral-200/80 dark:border-neutral-800/80 bg-neutral-100/50 dark:bg-[#0c0d11]">
        <h2 className="font-serif text-3xl font-bold text-neutral-950 dark:text-neutral-50">
          Begin your revision system today.
        </h2>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          Start recording your chapters and lock in long-term mastery.
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-6 py-3 text-xs font-semibold text-amber-300 shadow-md hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-950"
        >
          <span>Launch AURELIS App</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
};
