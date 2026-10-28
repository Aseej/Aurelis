import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  ArrowRight,
  Check,
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
  Globe,
  Play,
  Flame,
  Layers,
  GraduationCap,
  Target,
  Compass,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveView, theme, toggleTheme, state } = useApp();
  const { language, setLanguage, catalog, t } = useI18n();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

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

  const currentLangItem = catalog.find((l) => l.code === language) || catalog[0];

  // FAQ Data tailored accurately to current codebase capabilities
  const faqItems = [
    {
      q: 'What is AURELIS?',
      a: 'AURELIS is a distraction-free study and revision planning platform designed for ambitious students. Grounded in the Ebbinghaus forgetting curve, it automatically schedules calibrated active-recall intervals across all your subjects so you spend less time guessing what to study and more time mastering complex concepts.',
    },
    {
      q: 'How does the revision schedule work?',
      a: 'When you record a topic you studied, AURELIS creates an automated 7-stage recall progression: Day 1 (First Study), Day 3 (Revision 1), Day 5 (Revision 2), Day 7 (Weekly Test milestone), Day 14 (Review 1), Day 21 (Review 2), and Day 28 (Permanent Mastery). Calculations use calendar-pure date arithmetic rather than fragile timestamps, preventing timezone and month rollover drift.',
    },
    {
      q: 'Can I add or remove subjects?',
      a: 'Yes. You have complete control over your syllabus. You can create custom subjects with personalized accent colors, chapters, and topics. When you no longer need a subject, you can archive it or permanently remove it directly from the Subject Overview page without affecting your other subjects.',
    },
    {
      q: 'Can I use AURELIS for different study streams?',
      a: 'Yes. AURELIS is completely curriculum-agnostic. Whether you are studying Engineering, Medical Sciences, Law, Humanities, High School curricula, or Language Acquisition, you can organize your subjects, units, and memory anchors to fit your syllabus.',
    },
    {
      q: 'Will my study data remain saved?',
      a: 'Yes. AURELIS persists all your subjects, topics, recall intervals, test scores, and error notes directly in your browser’s local storage. You can also export your full study data to a portable JSON backup file and restore it at any time from the Settings menu.',
    },
    {
      q: 'Is AURELIS free to use?',
      a: 'Yes. AURELIS is an open educational tool created for students worldwide. All core features — spaced repetition queues, calendar planning, weekly tests, analytics, and data backups — are available without paywalls, subscriptions, or intrusive advertisements.',
    },
    {
      q: 'Can I use AURELIS on my phone?',
      a: 'Yes. AURELIS is built with mobile-first responsive architecture and Progressive Web App (PWA) compliance. It adapts smoothly to any phone, tablet, or desktop screen, and can be installed directly to your device home screen for fast fullscreen access.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#20232A] dark:bg-[#090B10] dark:text-[#F6F3EC] transition-colors selection:bg-[#E6C27A]/25 selection:text-[#B88A43] dark:selection:text-[#FFE6AD]">
      {/* =========================================================================
          SECTION A — NAVIGATION BAR
          Clean, elegant, public-facing navbar with working smooth scroll links
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
                Remember what matters
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
              Overview
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
            >
              FAQ
            </button>
          </nav>

          {/* Desktop Right Action Cluster */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white/70 px-3 text-xs text-[#686D77] hover:text-[#20232A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#A7ABB5] dark:hover:text-[#F6F3EC] transition-all"
                aria-label="Select language"
              >
                <Globe className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A]" />
                <span className="font-medium">{currentLangItem.nativeName}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              {isLangDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-2xl glass-premium shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-1.5 z-50 max-h-72 overflow-y-auto no-scrollbar"
                  onClick={() => setIsLangDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                    Choose Language
                  </div>
                  {catalog.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs text-left transition-colors ${
                        language === lang.code
                          ? 'bg-[#E6C27A]/20 text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                          : 'text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-[10px] font-mono text-[#858A93] dark:text-[#777F8C]">
                        {lang.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

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
              <span>Start Your Journey</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
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
                Overview
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="py-2.5 px-3 rounded-xl text-left text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="py-2.5 px-3 rounded-xl text-left text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="py-2.5 px-3 rounded-xl text-left text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                FAQ
              </button>
            </nav>

            {/* Mobile Language Selector */}
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#858A93] dark:text-[#777F8C]">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-[#E6C27A]" />
                  Language
                </span>
                <span className="font-mono">{currentLangItem.nativeName}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto">
                {catalog.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs text-left ${
                      language === lang.code
                        ? 'bg-[#E6C27A]/20 text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                        : 'text-[#686D77] dark:text-[#A7ABB5] bg-black/[0.03] dark:bg-white/[0.04]'
                    }`}
                  >
                    {lang.nativeName}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Primary CTA */}
            <button
              onClick={handleStartJourney}
              className="w-full btn-gold-primary flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold shadow-md"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </header>

      {/* =========================================================================
          SECTION B — HERO
          Cinematic landscape with mountain imagery, clear overlays, and copy
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
          {/* Gradient scrims for pristine text contrast across themes */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#F4F1EA]/80 via-[#F4F1EA]/60 to-[#F4F1EA] dark:from-[#090B10]/75 dark:via-[#090B10]/60 dark:to-[#090B10]" />
          <div className="absolute inset-0 bg-radial-at-c from-transparent via-transparent to-[#F4F1EA]/90 dark:to-[#090B10]/95" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full glass-subtle px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] font-medium text-[#A97B32] dark:text-[#E6C27A]">
            <span className="h-2 w-2 rounded-full bg-[#E6C27A] animate-pulse" />
            <span>YOUR LEARNING, WITH A CLEARER DIRECTION</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC] leading-[1.1]">
            Learn with intention.
            <br />
            <span className="bg-gradient-to-r from-[#996E25] via-[#B88A43] to-[#E6C27A] dark:from-[#FFE6AD] dark:via-[#E6C27A] dark:to-[#B88A43] bg-clip-text text-transparent">
              Remember with confidence.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="text-base sm:text-lg text-[#686D77] dark:text-[#C5CAD4] max-w-2xl mx-auto leading-relaxed">
            AURELIS helps you organize your subjects, plan your revisions, and build a consistent learning routine — so you can focus less on what to study next and more on understanding what you learn.
          </p>

          {/* Action Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <button
              onClick={handleStartJourney}
              className="w-full sm:w-auto btn-gold-primary inline-flex items-center justify-center gap-2.5 rounded-2xl px-8 py-3.5 text-sm font-semibold shadow-lg active:scale-95 transition-all"
            >
              <span>Start Your Journey</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl glass-subtle px-7 py-3.5 text-sm font-medium text-[#20232A] hover:bg-white/80 dark:text-[#F6F3EC] dark:hover:bg-white/[0.08] transition-all"
            >
              <span>Explore How It Works</span>
            </button>
          </div>

          {/* Trust Statement */}
          <div className="pt-2">
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#8E95A3] font-mono tracking-wide">
              A clearer plan. A steadier routine. Progress you can build on.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C — PRODUCT PREVIEW
          Realistic preview of real AURELIS capabilities using sample syllabus
         ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#A97B32] dark:text-[#E6C27A]">
            AUTHENTIC INTERFACE PREVIEW
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            A calm, structured workspace for serious study.
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            Everything you need to stay ahead of the forgetting curve, presented in Obsidian Glass.
          </p>
        </div>

        {/* Polished Realistic Mock Interface Container */}
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
              <span>Offline-ready & local-first</span>
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
                      Today&apos;s Focus
                    </div>
                    <div className="text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      3 Revisions Scheduled
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>On Track</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-black/[0.05] dark:border-white/[0.05]">
                  <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="text-xl font-mono font-bold text-[#20232A] dark:text-[#F6F3EC]">03</div>
                    <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase">Due Today</div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="text-xl font-mono font-bold text-[#F87171]">00</div>
                    <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase">Overdue</div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.03]">
                    <div className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">12</div>
                    <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase">Mastered</div>
                  </div>
                </div>
              </div>

              {/* Sample Spaced Repetition Queue Card */}
              <div className="rounded-2xl p-4 sm:p-5 glass-subtle border border-[#E6C27A]/30 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-[#686D77] dark:text-[#A7ABB5]">
                    <span className="h-2 w-2 rounded-full bg-[#38bdf8]" />
                    <span className="font-semibold uppercase tracking-wider text-[11px] text-[#38bdf8]">
                      PHYSICS
                    </span>
                    <span>·</span>
                    <span>Rotational Dynamics</span>
                  </div>
                  <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-[#E6C27A]/20 text-[#8C6221] dark:text-[#FFE6AD]">
                    Due Today
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    Moment of Inertia of Rigid Bodies
                  </h3>
                  <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
                    Stage 2: Reinforcing synaptic pathways 3 days after initial learning to halt rapid forgetting.
                  </p>
                </div>

                {/* 7-Stage Visual Timeline Stepper */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#858A93] dark:text-[#777F8C] mb-1">
                    <span>7-Stage Recall Curve</span>
                    <span>Step 2 of 7</span>
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
                    Est. 15 min recall
                  </span>
                  <button
                    onClick={handleStartJourney}
                    className="btn-gold-primary flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold shadow-xs"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Start Active Recall</span>
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
                        14-Day Study Streak
                      </div>
                      <div className="text-[10px] text-[#858A93] dark:text-[#777F8C]">
                        Active consistency habit
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#A97B32] dark:text-[#E6C27A]">
                    100% Weekly
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
                  Organized Subjects
                </div>
                {[
                  { name: 'Physics', color: '#38bdf8', count: 24, mastery: '78%' },
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
                      <span>{s.count} topics</span>
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
            INTENTIONAL STUDY SYSTEM
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            Studying shouldn&apos;t mean constantly wondering what comes next.
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            Without a structured recall schedule, students waste cognitive energy deciding what to revise. AURELIS eliminates that hesitation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Block 1 */}
          <div className="rounded-3xl glass-subtle p-6 space-y-3 border border-black/[0.06] dark:border-white/[0.08] transition-all hover:border-[#E6C27A]/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-[#A97B32] dark:text-[#E6C27A]">
              <BookOpen className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Too much to remember
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Keep your subjects and topics organized in one place without messy physical notebooks or scattered spreadsheets.
            </p>
          </div>

          {/* Block 2 */}
          <div className="rounded-3xl glass-subtle p-6 space-y-3 border border-black/[0.06] dark:border-white/[0.08] transition-all hover:border-[#E6C27A]/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6C27A]/15 text-[#A97B32] dark:text-[#E6C27A]">
              <Calendar className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Revision without a plan
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Know which topics need attention and when to revisit them. Let the algorithm present items exactly when memory begins to fade.
            </p>
          </div>

          {/* Block 3 */}
          <div className="rounded-3xl glass-subtle p-6 space-y-3 border border-black/[0.06] dark:border-white/[0.08] transition-all hover:border-[#E6C27A]/30">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Inconsistent study routines
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Build a repeatable schedule that helps you return to what you&apos;ve learned, turning episodic cramming into steady academic habits.
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
            METHODOLOGY
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            A simple system for more intentional learning.
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            Three connected steps to transform short-term reading into lifelong retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 01 */}
          <div className="relative rounded-3xl glass-premium p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#A97B32] dark:text-[#E6C27A]">
              01
            </div>
            <h3 className="text-lg font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Organize
            </h3>
            <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
              Add your subjects and the topics you want to study. Attach key formula notes, difficulty levels, and syllabus units.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#858A93] dark:text-[#777F8C]">
              Step 1: Sets baseline study date
            </div>
          </div>

          {/* Step 02 */}
          <div className="relative rounded-3xl glass-premium p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#A97B32] dark:text-[#E6C27A]">
              02
            </div>
            <h3 className="text-lg font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Follow your revision plan
            </h3>
            <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
              Use your scheduled reviews to revisit topics at the appropriate time across 7 calibrated intervals (Day 1, 3, 5, 7, 14, 21, 28).
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#858A93] dark:text-[#777F8C]">
              Step 2: Spaced repetition automation
            </div>
          </div>

          {/* Step 03 */}
          <div className="relative rounded-3xl glass-premium p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="font-mono text-2xl sm:text-3xl font-bold text-[#A97B32] dark:text-[#E6C27A]">
              03
            </div>
            <h3 className="text-lg font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Reflect and improve
            </h3>
            <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5] leading-relaxed">
              Use the available tests, progress views, and error-tracking tools to identify what deserves more attention and measure mastery.
            </p>
            <div className="pt-2 text-[11px] font-mono text-[#858A93] dark:text-[#777F8C]">
              Step 3: Verification & error insights
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
            CAPABILITIES
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            Everything has a place. Every review has a purpose.
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            Engineered exclusively with tools that genuinely exist and work in the platform today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Clock,
              title: 'Smart Revision Schedule',
              desc: 'See which topics are due for review based on calendar-pure date arithmetic that prevents timezone drift.',
            },
            {
              icon: BookOpen,
              title: 'Subject & Topic Organization',
              desc: 'Keep your syllabus structured into subjects, chapters, and recall topics with difficulty benchmarks.',
            },
            {
              icon: Calendar,
              title: 'Calendar View',
              desc: 'Understand your upcoming study and revision commitments across months and specific calendar dates.',
            },
            {
              icon: FileCheck2,
              title: 'Weekly Tests',
              desc: 'Assess comprehension with weekly test milestones, marks tracking, and historical percentage trends.',
            },
            {
              icon: AlertCircle,
              title: 'Error Notebook',
              desc: 'Keep track of mistakes, conceptual confusions, and formula slips to eliminate recurring examination errors.',
            },
            {
              icon: BarChart3,
              title: 'Progress Analytics',
              desc: 'Review topic mastery scores, study days history, and syllabus completion velocity over time.',
            },
            {
              icon: ShieldCheck,
              title: 'Data Persistence',
              desc: 'Return to your saved work anytime with automatic local storage and one-click JSON backup export/restore.',
            },
            {
              icon: Sparkles,
              title: 'Flexible Study Setup',
              desc: 'Organize the subjects relevant to your study needs: add new subjects, archive completed courses, or remove them.',
            },
          ].map((f, idx) => {
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
            STUDY PROFILE
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            Designed for students who want a clearer way to study.
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            Built to provide structure and peace of mind across demanding academic phases.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="rounded-3xl glass-premium p-6 sm:p-7 space-y-3 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              School students
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Organize subjects and build a regular revision habit throughout the semester without waiting until final exam week.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-3xl glass-premium p-6 sm:p-7 space-y-3 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-[#A97B32] dark:text-[#E6C27A]">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Exam preparation
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Keep upcoming reviews visible while preparing for high-stakes assessments, board examinations, and entrance tests.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-3xl glass-premium p-6 sm:p-7 space-y-3 border border-black/[0.06] dark:border-white/[0.08]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Independent learners
            </h3>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] leading-relaxed">
              Create a structured learning routine that suits your own pace, personal curiosity, and self-directed curriculum goals.
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
            CLARITY & DETAILS
          </span>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#686D77] dark:text-[#A7ABB5]">
            Everything you need to know about AURELIS, its revision scheduling, and your study data.
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
            Make your next study session count.
          </h2>
          <p className="text-sm sm:text-base text-[#686D77] dark:text-[#C5CAD4] leading-relaxed">
            Start with your subjects. Build your routine one review at a time.
          </p>
          <div className="pt-2">
            <button
              onClick={handleStartJourney}
              className="btn-gold-primary inline-flex items-center justify-center gap-2.5 rounded-2xl px-9 py-3.5 text-sm font-semibold shadow-lg active:scale-95 transition-all"
            >
              <span>Start Your Journey</span>
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
                A quiet, intelligent spaced-repetition revision platform designed to help students master demanding curricula with confidence.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#686D77] dark:text-[#A7ABB5]">
              <button
                onClick={() => scrollToSection('overview')}
                className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
              >
                Overview
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('faq')}
                className="hover:text-[#20232A] dark:hover:text-[#F6F3EC] transition-colors"
              >
                FAQ
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#858A93] dark:text-[#777F8C]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#A97B32] dark:text-[#E6C27A]" />
              <span>Local-First & Private: All study data remains stored securely in your browser.</span>
            </div>
            <div>
              © 2026 AURELIS. Designed for intentional learners.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
