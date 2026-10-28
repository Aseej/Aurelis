import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Calendar,
  BookOpen,
  FileCheck2,
  AlertCircle,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  Play,
  Flame,
  GraduationCap,
  Target,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, theme, toggleTheme } = useApp();
  const { t } = useI18n();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStartJourney = () => {
    setActiveView('dashboard');
  };

  // FAQ Data dynamically resolved through i18n
  const faqItems = [
    {
      q: t(
        'landing.faq.q1',
        'What is AURELIS?'
      ),
      a: t(
        'landing.faq.a1',
        'AURELIS is a distraction-free study and revision planning platform designed for ambitious students. Grounded in the Ebbinghaus forgetting curve, it automatically schedules calibrated active-recall intervals across all your subjects so you spend less time guessing what to study and more time mastering complex concepts.'
      ),
    },
    {
      q: t(
        'landing.faq.q2',
        'How does the revision schedule work?'
      ),
      a: t(
        'landing.faq.a2',
        'When you record a topic you studied, AURELIS creates an automated 7-stage recall progression: Day 1 (First Study), Day 3 (Revision 1), Day 5 (Revision 2), Day 7 (Weekly Test milestone), Day 14 (Review 1), Day 21 (Review 2), and Day 28 (Permanent Mastery). Calculations use calendar-pure date arithmetic rather than fragile timestamps, preventing timezone and month rollover drift.'
      ),
    },
    {
      q: t(
        'landing.faq.q3',
        'Can I add or remove subjects?'
      ),
      a: t(
        'landing.faq.a3',
        'Yes. You have complete control over your syllabus. You can create custom subjects with personalized accent colors, chapters, and topics. When you no longer need a subject, you can archive it or permanently remove it directly from the Subject Overview page without affecting your other subjects.'
      ),
    },
    {
      q: t(
        'landing.faq.q4',
        'Can I use AURELIS for different study streams?'
      ),
      a: t(
        'landing.faq.a4',
        'Yes. AURELIS is completely curriculum-agnostic. Whether you are studying Engineering, Medical Sciences, Law, Humanities, High School curricula, or Language Acquisition, you can organize your subjects, units, and memory anchors to fit your syllabus.'
      ),
    },
    {
      q: t(
        'landing.faq.q5',
        'Will my study data remain saved?'
      ),
      a: t(
        'landing.faq.a5',
        'Yes. AURELIS persists all your subjects, topics, recall intervals, test scores, and error notes directly in your browser’s local storage. You can also export your full study data to a portable JSON backup file and restore it at any time from the Settings menu.'
      ),
    },
    {
      q: t(
        'landing.faq.q6',
        'Is AURELIS free to use?'
      ),
      a: t(
        'landing.faq.a6',
        'Yes. AURELIS is an open educational tool created for students worldwide. All core features — spaced repetition queues, calendar planning, weekly tests, analytics, and data backups — are available without paywalls, subscriptions, or intrusive advertisements.'
      ),
    },
    {
      q: t(
        'landing.faq.q7',
        'Can I use AURELIS on my phone?'
      ),
      a: t(
        'landing.faq.a7',
        'Yes. AURELIS is built with mobile-first responsive architecture and Progressive Web App (PWA) compliance. It adapts smoothly to any phone, tablet, or desktop screen, and can be installed directly to your device home screen for fast fullscreen access.'
      ),
    },
  ];

  const features = [
    {
      icon: Clock,
      title: t('landing.features.f1Title', 'Smart Revision Schedule'),
      desc: t('landing.features.f1Desc', 'See which topics are due for review based on calendar-pure date arithmetic that prevents timezone drift.'),
    },
    {
      icon: BookOpen,
      title: t('landing.features.f2Title', 'Subject & Topic Organization'),
      desc: t('landing.features.f2Desc', 'Keep your syllabus structured into subjects, chapters, and recall topics with difficulty benchmarks.'),
    },
    {
      icon: Calendar,
      title: t('landing.features.f3Title', 'Calendar View'),
      desc: t('landing.features.f3Desc', 'Understand your upcoming study and revision commitments across months and specific calendar dates.'),
    },
    {
      icon: FileCheck2,
      title: t('landing.features.f4Title', 'Weekly Tests'),
      desc: t('landing.features.f4Desc', 'Assess comprehension with weekly test milestones, marks tracking, and historical percentage trends.'),
    },
    {
      icon: AlertCircle,
      title: t('landing.features.f5Title', 'Error Notebook'),
      desc: t('landing.features.f5Desc', 'Keep track of mistakes, conceptual confusions, and formula slips to eliminate recurring examination errors.'),
    },
    {
      icon: BarChart3,
      title: t('landing.features.f6Title', 'Progress Analytics'),
      desc: t('landing.features.f6Desc', 'Review topic mastery scores, study days history, and syllabus completion velocity over time.'),
    },
    {
      icon: ShieldCheck,
      title: t('landing.features.f7Title', 'Data Persistence'),
      desc: t('landing.features.f7Desc', 'Return to your saved work anytime with automatic local storage and one-click JSON backup export/restore.'),
    },
    {
      icon: Sparkles,
      title: t('landing.features.f8Title', 'Flexible Study Setup'),
      desc: t('landing.features.f8Desc', 'Organize the subjects relevant to your study needs: add new subjects, archive completed courses, or remove them.'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#20232A] dark:bg-[#090B10] dark:text-[#F6F3EC] transition-colors selection:bg-[#E6C27A]/25 selection:text-[#B88A43] dark:selection:text-[#FFE6AD]">
      {/* =========================================================================
          SECTION A — NAVIGATION BAR
          Clean, elegant, public-facing navbar without language dropdown (language
          is strictly configured via SettingsModal per product architecture)
         ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-black/[0.06] bg-[#F4F1EA]/85 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#090B10]/85 transition-colors">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Wordmark */}
          <button
            onClick={() => scrollToSection('overview')}
            className="flex items-center gap-3 text-left focus:outline-none group"
            aria-label="AURELIS Overview"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E2430] to-[#0E1118] text-xs font-semibold tracking-wider text-[#E6C27A] shadow-xs border border-white/10 dark:from-[#1E2430] dark:to-[#090B10] dark:border-[#E6C27A]/30">
              <span className="font-serif text-sm">A</span>
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-xl" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-semibold tracking-wider text-[#20232A] group-hover:text-[#A97B32] dark:text-[#F6F3EC] dark:group-hover:text-[#E6C27A] transition-colors">
                AURELIS
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-[#858A93] dark:text-[#777F8C] -mt-0.5">
                {t('app.brandTagline', 'Remember what matters')}
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav
            className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide uppercase text-[#686D77] dark:text-[#A7ABB5]"
            aria-label="Public Navigation"
          >
            <button
              onClick={() => scrollToSection('overview')}
              className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
            >
              {t('landing.nav.overview', 'Overview')}
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
            >
              {t('landing.nav.howItWorks', 'How It Works')}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
            >
              {t('landing.nav.features', 'Features')}
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
            >
              {t('landing.nav.faq', 'FAQ')}
            </button>
          </nav>

          {/* Desktop Right Action Cluster: Theme Toggle, Primary CTA */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] text-[#686D77] hover:text-[#20232A] dark:border-white/[0.08] dark:text-[#A7ABB5] dark:hover:text-[#F6F3EC] transition-colors"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-[#E6C27A]" />
              ) : (
                <Moon className="h-4 w-4 text-[#A97B32]" />
              )}
            </button>

            {/* Primary CTA */}
            <button
              onClick={handleStartJourney}
              className="btn-gold-primary flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all active:scale-95"
            >
              <span>{t('landing.nav.startJourney', 'Start Your Journey')}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Actions */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] text-[#686D77] dark:border-white/[0.08] dark:text-[#A7ABB5]"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-[#E6C27A]" />
              ) : (
                <Moon className="h-4 w-4 text-[#A97B32]" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/[0.08] text-[#686D77] hover:text-[#20232A] dark:border-white/[0.08] dark:text-[#A7ABB5] dark:hover:text-[#F6F3EC]"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer Sheet */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-b border-black/[0.06] bg-[#F4F1EA] dark:border-white/[0.08] dark:bg-[#090B10] px-4 pt-3 pb-6 space-y-4 shadow-xl">
            <nav className="flex flex-col space-y-1 text-sm font-medium">
              <button
                onClick={() => scrollToSection('overview')}
                className="py-2.5 px-3 rounded-xl text-left text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                {t('landing.nav.overview', 'Overview')}
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="py-2.5 px-3 rounded-xl text-left text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                {t('landing.nav.howItWorks', 'How It Works')}
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="py-2.5 px-3 rounded-xl text-left text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                {t('landing.nav.features', 'Features')}
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="py-2.5 px-3 rounded-xl text-left text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                {t('landing.nav.faq', 'FAQ')}
              </button>
            </nav>

            {/* Mobile Primary CTA */}
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                onClick={handleStartJourney}
                className="w-full btn-gold-primary flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold shadow-md"
              >
                <span>{t('landing.nav.startJourney', 'Start Your Journey')}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION B — HERO
          Cinematic landscape with mountain imagery, clear overlays, and translated copy
         ========================================================================= */}
      <section
        id="overview"
        className="relative overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32 px-4 sm:px-6 lg:px-8 border-b border-black/[0.06] dark:border-white/[0.08]"
      >
        {/* Background Mountain Horizon Image with atmospheric overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/assets/aurelis_mountain_hero.jpg"
            alt="Majestic mountain peaks at dawn"
            className="h-full w-full object-cover object-center opacity-30 dark:opacity-40 filter saturate-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F4F1EA]/80 via-[#F4F1EA]/60 to-[#F4F1EA] dark:from-[#090B10]/75 dark:via-[#090B10]/60 dark:to-[#090B10]" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-[#F4F1EA]/90 dark:to-[#090B10]/95" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] font-medium text-[#A97B32] dark:text-[#E6C27A]">
            <span className="h-2 w-2 rounded-full bg-[#E6C27A] animate-pulse" />
            <span>{t('landing.hero.eyebrow', 'YOUR LEARNING, WITH A CLEARER DIRECTION')}</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC] leading-[1.1]">
            {t('landing.hero.title1', 'Learn with intention.')}
            <br />
            <span className="bg-gradient-to-r from-[#996E25] via-[#B88A43] to-[#E6C27A] dark:from-[#FFE6AD] dark:via-[#E6C27A] dark:to-[#B88A43] bg-clip-text text-transparent">
              {t('landing.hero.title2', 'Remember with confidence.')}
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#686D77] dark:text-[#C5CAD4] max-w-2xl mx-auto leading-relaxed">
            {t(
              'landing.hero.desc',
              'AURELIS helps you organize your subjects, plan your revisions, and build a consistent learning routine — so you can focus less on what to study next and more on understanding what you learn.'
            )}
          </p>

          {/* Action Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <button
              onClick={handleStartJourney}
              className="w-full sm:w-auto btn-gold-primary inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-3.5 text-sm font-semibold shadow-lg active:scale-95 transition-all"
            >
              <span>{t('landing.nav.startJourney', 'Start Your Journey')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl glass-subtle px-7 py-3.5 text-sm font-medium text-[#20232A] hover:bg-white/80 dark:text-[#F6F3EC] dark:hover:bg-white/[0.08] transition-all"
            >
              <span>{t('landing.nav.exploreHowItWorks', 'Explore How It Works')}</span>
            </button>
          </div>

          {/* Trust Statement */}
          <div className="pt-2">
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#8E95A3] font-mono tracking-wide">
              {t('landing.hero.trust', 'A clearer plan. A steadier routine. Progress you can build on.')}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C — PRODUCT PREVIEW
          Realistic preview of real AURELIS capabilities using translated terminology
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            {t('landing.preview.eyebrow', 'AUTHENTIC INTERFACE PREVIEW')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('landing.preview.title', 'A calm, structured workspace for serious study.')}
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            {t('landing.preview.subtitle', 'Everything you need to stay ahead of the forgetting curve, presented in Obsidian Glass.')}
          </p>
        </div>

        {/* Polished Realistic Interface Container */}
        <div className="relative rounded-3xl glass-premium p-4 sm:p-7 shadow-2xl border border-white/40 dark:border-white/10 overflow-hidden">
          {/* Mock Window Top Bar */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-400/80" />
              <span className="h-3 w-3 rounded-full bg-amber-400/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 font-mono text-[11px] text-[#858A93] dark:text-[#777F8C]">
                aurelis.app / workspace / today
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#858A93] dark:text-[#777F8C]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t('landing.preview.offline', 'Offline-ready & local-first')}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 Columns: Today's Focus & Active Recall Card */}
            <div className="lg:col-span-7 space-y-4">
              {/* Today's Focus KPI Row */}
              <div className="rounded-2xl glass-subtle p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
                      {t('landing.preview.todayFocus', "Today's Focus")}
                    </div>
                    <div className="text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {t('landing.preview.revisionsScheduled', '3 Revisions Scheduled')}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{t('landing.preview.onTrack', 'On Track')}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-black/[0.05] dark:border-white/[0.05]">
                  <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="text-xl font-mono font-bold text-[#20232A] dark:text-[#F6F3EC]">03</div>
                    <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase">
                      {t('landing.preview.dueToday', 'Due Today')}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="text-xl font-mono font-bold text-[#F87171]">00</div>
                    <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase">
                      {t('landing.preview.overdue', 'Overdue')}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">12</div>
                    <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase">
                      {t('landing.preview.mastered', 'Mastered')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample Spaced Repetition Queue Card */}
              <div className="rounded-2xl p-4 sm:p-5 glass-subtle border border-[#E6C27A]/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#686D77] dark:text-[#A7ABB5]">
                    <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-[#38bdf8]">
                      {t('landing.preview.sampleSubject', 'PHYSICS')}
                    </span>
                    <span>·</span>
                    <span>{t('landing.preview.sampleChapter', 'Rotational Dynamics')}</span>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#E6C27A]/20 text-[#8C6221] dark:text-[#FFE6AD]">
                    {t('landing.preview.dueToday', 'Due Today')}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    {t('landing.preview.sampleTopic', 'Moment of Inertia of Rigid Bodies')}
                  </h3>
                  <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
                    {t('landing.preview.sampleStageDesc', 'Stage 2: Reinforcing synaptic pathways 3 days after initial learning to halt rapid forgetting.')}
                  </p>
                </div>

                {/* 7-Stage Stepper */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#858A93] dark:text-[#777F8C] mb-1">
                    <span>{t('landing.preview.curveTitle', '7-Stage Recall Curve')}</span>
                    <span>{t('landing.preview.curveStep', 'Step 2 of 7')}</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    <div className="rounded p-1 bg-emerald-500/20 text-center text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ 1
                    </div>
                    <div className="rounded p-1 bg-[#E6C27A]/30 ring-1 ring-[#E6C27A] text-center text-[9px] font-bold text-[#8C6221] dark:text-[#FFE6AD]">
                      ● 2
                    </div>
                    <div className="rounded p-1 bg-black/[0.03] dark:bg-white/[0.03] text-center text-[9px] text-[#858A93]">
                      3
                    </div>
                    <div className="rounded p-1 bg-black/[0.03] dark:bg-white/[0.03] text-center text-[9px] text-[#858A93]">
                      4
                    </div>
                    <div className="rounded p-1 bg-black/[0.03] dark:bg-white/[0.03] text-center text-[9px] text-[#858A93]">
                      5
                    </div>
                    <div className="rounded p-1 bg-black/[0.03] dark:bg-white/[0.03] text-center text-[9px] text-[#858A93]">
                      6
                    </div>
                    <div className="rounded p-1 bg-black/[0.03] dark:bg-white/[0.03] text-center text-[9px] text-[#858A93]">
                      7
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono text-[#858A93] dark:text-[#777F8C]">
                    {t('landing.preview.estRecall', 'Est. 15 min recall')}
                  </span>
                  <button
                    onClick={handleStartJourney}
                    className="btn-gold-primary flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-xs"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>{t('landing.preview.startRecall', 'Start Active Recall')}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Subject Syllabi & Retention Streak */}
            <div className="lg:col-span-5 space-y-4">
              {/* Daily Streak & Consistency Strip */}
              <div className="rounded-2xl glass-subtle p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6C27A]/20 text-[#A97B32] dark:text-[#E6C27A]">
                      <Flame className="h-4 w-4 fill-current" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#20232A] dark:text-[#F6F3EC]">
                        {t('landing.preview.streakTitle', '14-Day Study Streak')}
                      </div>
                      <div className="text-[10px] text-[#858A93] dark:text-[#777F8C]">
                        {t('landing.preview.streakSub', 'Active consistency habit')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A97B32] dark:text-[#E6C27A]">
                    {t('landing.preview.weeklyStat', '100% Weekly')}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px]">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-[#858A93] text-[9px]">{day}</div>
                      <div className="h-6 rounded bg-[#E6C27A]/25 text-[#8C6221] dark:text-[#FFE6AD] flex items-center justify-center font-bold">
                        ✓
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Curriculum Subjects */}
              <div className="rounded-2xl glass-subtle p-4 space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                  {t('landing.preview.organizedSubjects', 'Organized Subjects')}
                </div>
                {[
                  { name: t('landing.preview.sampleSubject', 'Physics'), color: '#38bdf8', count: 24, mastery: '78%' },
                  { name: 'Chemistry', color: '#f43f5e', count: 18, mastery: '82%' },
                  { name: 'Mathematics', color: '#eab308', count: 20, mastery: '75%' },
                  { name: 'Biology', color: '#10b981', count: 16, mastery: '88%' },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="font-medium text-[#20232A] dark:text-[#F6F3EC]">{s.name}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-[#858A93] dark:text-[#777F8C]">
                      <span>
                        {t('landing.preview.topicsCount', '{count} topics', { count: s.count })}
                      </span>
                      <span className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">{s.mastery}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D — THE PROBLEM AURELIS SOLVES
          Clear cognitive challenges and intentional solutions
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            {t('landing.problem.eyebrow', 'INTENTIONAL STUDY SYSTEM')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('landing.problem.title', "Studying shouldn't mean constantly wondering what comes next.")}
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            {t(
              'landing.problem.subtitle',
              'Without a structured recall schedule, students waste cognitive energy deciding what to revise. AURELIS eliminates that hesitation.'
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Block 1 */}
          <div className="rounded-3xl glass-subtle p-6 space-y-3 border border-black/[0.06] dark:border-white/[0.08] transition-all hover:border-[#E6C27A]/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-[#A97B32] dark:text-[#E6C27A]">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.problem.card1Title', 'Too much to remember')}
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              {t(
                'landing.problem.card1Desc',
                'Keep your subjects and topics organized in one place without messy physical notebooks or scattered spreadsheets.'
              )}
            </p>
          </div>

          {/* Block 2 */}
          <div className="rounded-3xl glass-subtle p-6 space-y-3 border border-black/[0.06] dark:border-white/[0.08] transition-all hover:border-[#E6C27A]/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6C27A]/15 text-[#A97B32] dark:text-[#E6C27A]">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.problem.card2Title', 'Revision without a plan')}
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              {t(
                'landing.problem.card2Desc',
                'Know which topics need attention and when to revisit them. Let the algorithm present items exactly when memory begins to fade.'
              )}
            </p>
          </div>

          {/* Block 3 */}
          <div className="rounded-3xl glass-subtle p-6 space-y-3 border border-black/[0.06] dark:border-white/[0.08] transition-all hover:border-[#E6C27A]/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.problem.card3Title', 'Inconsistent study routines')}
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              {t(
                'landing.problem.card3Desc',
                "Build a repeatable schedule that helps you return to what you've learned, turning episodic cramming into steady academic habits."
              )}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E — HOW IT WORKS
          01 Organize, 02 Follow your revision plan, 03 Reflect and improve
         ========================================================================= */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-12"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            {t('landing.howItWorks.eyebrow', 'METHODOLOGY')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('landing.howItWorks.title', 'A simple system for more intentional learning.')}
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            {t('landing.howItWorks.subtitle', 'Three connected steps to transform short-term reading into lifelong retention.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 01 */}
          <div className="relative rounded-3xl glass-premium p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#A97B32] dark:text-[#E6C27A]">
              01
            </div>
            <h3 className="text-lg font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.howItWorks.step1Title', '01 — Organize')}
            </h3>
            <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
              {t(
                'landing.howItWorks.step1Desc',
                'Add your subjects and the topics you want to study. Attach key formula notes, difficulty levels, and syllabus units.'
              )}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#858A93] dark:text-[#777F8C]">
              {t('landing.howItWorks.step1Sub', 'Step 1: Sets baseline study date')}
            </div>
          </div>

          {/* Step 02 */}
          <div className="relative rounded-3xl glass-premium p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#A97B32] dark:text-[#E6C27A]">
              02
            </div>
            <h3 className="text-lg font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.howItWorks.step2Title', '02 — Follow your revision plan')}
            </h3>
            <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
              {t(
                'landing.howItWorks.step2Desc',
                'Use your scheduled reviews to revisit topics at the appropriate time across 7 calibrated intervals (Day 1, 3, 5, 7, 14, 21, 28).'
              )}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#858A93] dark:text-[#777F8C]">
              {t('landing.howItWorks.step2Sub', 'Step 2: Spaced repetition automation')}
            </div>
          </div>

          {/* Step 03 */}
          <div className="relative rounded-3xl glass-premium p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#A97B32] dark:text-[#E6C27A]">
              03
            </div>
            <h3 className="text-lg font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.howItWorks.step3Title', '03 — Reflect and improve')}
            </h3>
            <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
              {t(
                'landing.howItWorks.step3Desc',
                'Use the available tests, progress views, and error-tracking tools to identify what deserves more attention and measure mastery.'
              )}
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#858A93] dark:text-[#777F8C]">
              {t('landing.howItWorks.step3Sub', 'Step 3: Verification & error insights')}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION F — FEATURE SHOWCASE
          Verified real capabilities from the existing codebase
         ========================================================================= */}
      <section
        id="features"
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-12"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            {t('landing.features.eyebrow', 'CAPABILITIES')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('landing.features.title', 'Everything has a place. Every review has a purpose.')}
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            {t('landing.features.subtitle', 'Engineered exclusively with tools that genuinely exist and work in the platform today.')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div
                key={idx}
                className="rounded-3xl glass-subtle p-5 space-y-2.5 border border-black/[0.06] dark:border-white/[0.08] transition-all hover:border-[#E6C27A]/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6C27A]/15 text-[#A97B32] dark:text-[#E6C27A]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  {f.title}
                </h3>
                <p className="text-xs text-[#858A93] dark:text-[#777F8C] leading-relaxed">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION G — WHO AURELIS IS FOR
          Understated audience cards
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            {t('landing.audience.eyebrow', 'STUDY PROFILE')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('landing.audience.title', 'Designed for students who want a clearer way to study.')}
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            {t('landing.audience.subtitle', 'Built to provide structure and peace of mind across demanding academic phases.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-3xl glass-premium p-6 sm:p-7 space-y-3 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.audience.c1Title', 'School students')}
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              {t(
                'landing.audience.c1Desc',
                'Organize subjects and build a regular revision habit throughout the semester without waiting until final exam week.'
              )}
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl glass-premium p-6 sm:p-7 space-y-3 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-[#A97B32] dark:text-[#E6C27A]">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.audience.c2Title', 'Exam preparation')}
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              {t(
                'landing.audience.c2Desc',
                'Keep upcoming reviews visible while preparing for high-stakes assessments, board examinations, and entrance tests.'
              )}
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl glass-premium p-6 sm:p-7 space-y-3 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('landing.audience.c3Title', 'Independent learners')}
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              {t(
                'landing.audience.c3Desc',
                'Create a structured learning routine that suits your own pace, personal curiosity, and self-directed curriculum goals.'
              )}
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION H — FAQ ACCORDION
          Accessible, keyboard-friendly accordion answering 7 core questions
         ========================================================================= */}
      <section
        id="faq"
        className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-black/[0.06] dark:border-white/[0.08] space-y-10"
      >
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            {t('landing.faq.eyebrow', 'CLARITY & DETAILS')}
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('landing.faq.title', 'Frequently Asked Questions')}
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            {t(
              'landing.faq.subtitle',
              'Everything you need to know about AURELIS, its revision scheduling, and your study data.'
            )}
          </p>
        </div>

        <div className="space-y-3" role="region" aria-label="Frequently Asked Questions">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl glass-subtle border border-black/[0.06] dark:border-white/[0.08] transition-all overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${idx}`}
                  id={`faq-question-${idx}`}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC] focus:outline-none focus:ring-1 focus:ring-[#E6C27A] transition-colors"
                >
                  <span className="pr-4">{item.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[#858A93] dark:text-[#777F8C] transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#A97B32] dark:text-[#E6C27A]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div
                    id={`faq-answer-${idx}`}
                    role="region"
                    aria-labelledby={`faq-question-${idx}`}
                    className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5] leading-relaxed border-t border-black/[0.04] dark:border-white/[0.04] pt-3"
                  >
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION I — FINAL CTA
          Atmospheric mountain landscape with clear, restrained call to action
         ========================================================================= */}
      <section className="relative overflow-hidden py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-black/[0.06] dark:border-white/[0.08] text-center">
        {/* Mountain Backdrop */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="/assets/aurelis_mountain_hero.jpg"
            alt="Mountain silhouettes"
            className="h-full w-full object-cover object-bottom opacity-20 dark:opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#F4F1EA] via-[#F4F1EA]/80 to-transparent dark:from-[#090B10] dark:via-[#090B10]/85 dark:to-transparent" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-6">
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('landing.finalCta.title', 'Make your next study session count.')}
          </h2>
          <p className="text-sm sm:text-base text-[#686D77] dark:text-[#C5CAD4] leading-relaxed">
            {t('landing.finalCta.desc', 'Start with your subjects. Build your routine one review at a time.')}
          </p>
          <div className="pt-2">
            <button
              onClick={handleStartJourney}
              className="btn-gold-primary inline-flex items-center justify-center gap-2.5 rounded-2xl px-9 py-3.5 text-sm font-semibold shadow-lg active:scale-95 transition-all"
            >
              <span>{t('landing.finalCta.button', 'Start Your Journey')}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION J — FOOTER
          Product branding, description, navigation, privacy note, and copyright
         ========================================================================= */}
      <footer className="border-t border-black/[0.06] bg-[#EBE7DE]/40 dark:border-white/[0.08] dark:bg-[#0E1118]/60 py-12 px-4 sm:px-6 lg:px-8 transition-colors">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-black/[0.06] dark:border-white/[0.08]">
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E2430] to-[#0E1118] text-xs font-semibold text-[#E6C27A] border border-white/10 dark:border-[#E6C27A]/30">
                  <span className="font-serif">A</span>
                </div>
                <span className="font-serif text-base font-semibold tracking-wider text-[#20232A] dark:text-[#F6F3EC]">
                  AURELIS
                </span>
              </div>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C] leading-relaxed">
                {t(
                  'landing.footer.desc',
                  'A quiet, intelligent spaced-repetition revision platform designed to help students master demanding curricula with confidence.'
                )}
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#686D77] dark:text-[#A7ABB5]">
              <button
                onClick={() => scrollToSection('overview')}
                className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
              >
                {t('landing.nav.overview', 'Overview')}
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
              >
                {t('landing.nav.howItWorks', 'How It Works')}
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
              >
                {t('landing.nav.features', 'Features')}
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
              >
                {t('landing.nav.faq', 'FAQ')}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#858A93] dark:text-[#777F8C]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#A97B32] dark:text-[#E6C27A]" />
              <span>
                {t('landing.footer.privacy', 'Local-First & Private: All study data remains stored securely in your browser.')}
              </span>
            </div>
            <div>
              {t('landing.footer.copyright', '© 2026 AURELIS. Designed for intentional learners.')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
