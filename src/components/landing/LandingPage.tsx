import React from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView } = useApp();
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#20232A] dark:bg-[#090B10] dark:text-[#F6F3EC] transition-colors pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden px-4 pt-16 pb-16 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-1.5 text-xs text-[#686D77] dark:text-[#A7ABB5]">
          <span className="h-2 w-2 rounded-full bg-[#E6C27A]" />
          <span>{t('landing.badge', 'The Liquid Glass Study Environment')}</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC] max-w-3xl mx-auto leading-tight">
          {t('landing.heroTitle', 'Remember what matters.')}
        </h1>

        <p className="text-base sm:text-lg text-[#686D77] dark:text-[#A7ABB5] max-w-2xl mx-auto leading-relaxed">
          {t('landing.heroSubtitle', 'A quiet, intelligent spaced-repetition study environment designed to help ambitious students master complex curricula without cognitive overwhelm.')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setActiveView('dashboard')}
            className="w-full sm:w-auto btn-gold-primary inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold shadow-md"
          >
            <span>{t('landing.getStarted', 'Enter Study Space')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto btn-glass-secondary inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-medium"
          >
            <span>{t('landing.learnMore', 'Explore Methodology')}</span>
          </a>
        </div>
      </section>

      {/* 2. The Problem Statement */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08]">
        <div className="rounded-3xl glass-premium p-6 sm:p-10 space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            {t('landing.methodSubtitle', 'Cognitive Retention Principles')}
          </span>
          <blockquote className="font-serif text-xl sm:text-2xl text-[#20232A] dark:text-[#F6F3EC] italic">
            {t('landing.quote', '“Without systematic recall, 70% of new knowledge vanishes within 24 hours. AURELIS transforms forgetting into permanent academic mastery.”')}
          </blockquote>
        </div>
      </section>

      {/* 3. How AURELIS Works (Workflow) */}
      <section id="how-it-works" className="px-4 py-14 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            {t('landing.methodSubtitle', 'Frictionless Daily Habit')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('landing.methodTitle', 'The Ebbinghaus 7-Stage Retention Engine')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            {
              step: '01',
              title: t('landing.step1Title', '1. First Study'),
              desc: t('landing.step1Desc', 'Log what you studied today with key equations and memory anchors.'),
            },
            {
              step: '02',
              title: t('landing.step2Title', '2. 24h Reinforcement'),
              desc: t('landing.step2Desc', 'First micro-recall session halts immediate post-study memory drop.'),
            },
            {
              step: '03',
              title: t('landing.step3Title', '3. Day 7 Diagnostic'),
              desc: t('landing.step3Desc', 'Objective weekly testing milestone evaluates genuine conceptual recall.'),
            },
            {
              step: '04',
              title: t('landing.step4Title', '4. Permanent Mastery'),
              desc: t('landing.step4Desc', 'Bi-weekly and monthly reviews solidify neural retention indefinitely.'),
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
            {t('settings.tabSchedule', 'Revision Rhythm')}
          </span>
          <h2 className="text-2xl font-bold text-[#20232A] dark:text-[#F6F3EC]">
            {t('settings.scheduleTitle', 'Spaced Repetition Schedule')}
          </h2>
        </div>

        <div className="rounded-3xl glass-premium p-6 divide-y divide-black/[0.06] dark:divide-white/[0.08] text-xs">
          {[
            { day: 'Day 1', label: t('topicDetailModal.firstStudied', 'Learn') },
            { day: 'Day 3', label: t('subjects.revise', 'Revision 1') },
            { day: 'Day 5', label: t('subjects.revise', 'Revision 2') },
            { day: 'Day 7', label: t('nav.tests', 'Weekly Test') },
            { day: 'Day 14', label: t('subjects.revise', 'Review 1') },
            { day: 'Day 21', label: t('subjects.revise', 'Review 2') },
            { day: 'Day 28', label: t('subjects.mastered', 'Permanent Mastery') },
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
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section className="px-4 py-14 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-6">
        <h2 className="text-2xl font-bold text-center text-[#20232A] dark:text-[#F6F3EC]">
          {t('landing.faqTitle', 'Frequently Asked Questions')}
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

      {/* 6. Final Launch CTA */}
      <section className="px-4 py-16 text-center space-y-4 border-t border-black/[0.06] dark:border-white/[0.08]">
        <h2 className="font-serif text-3xl font-bold text-[#20232A] dark:text-[#F6F3EC]">
          {t('landing.ctaTitle', 'Ready to master your curriculum?')}
        </h2>
        <p className="text-xs text-[#858A93] dark:text-[#777F8C] max-w-md mx-auto">
          {t('landing.ctaSubtitle', 'Zero clutter. Local-first privacy. Engineered for peak academic focus.')}
        </p>
        <button
          onClick={() => setActiveView('dashboard')}
          className="btn-gold-primary inline-flex items-center gap-2 rounded-xl px-7 py-3 text-xs font-semibold shadow-md"
        >
          <span>{t('landing.getStarted', 'Launch AURELIS App')}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
};
