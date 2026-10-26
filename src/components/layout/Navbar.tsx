import React from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { Search, Plus, Moon, Sun, Flame } from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    theme,
    toggleTheme,
    setIsAddTopicOpen,
    setIsSearchOpen,
    state,
    streakInfo,
    purgeDemoData,
  } = useApp();

  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/[0.06] bg-[#F4F1EA]/80 backdrop-blur-xl dark:border-white/[0.09] dark:bg-[#090B10]/80 transition-colors">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            aria-label="AURELIS Home"
          >
            <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#1E2430] to-[#0E1118] text-xs font-semibold tracking-wider text-[#E6C27A] shadow-xs border border-white/10 dark:from-[#1E2430] dark:to-[#090B10] dark:border-[#E6C27A]/30">
              <span className="font-serif">A</span>
              {/* Subtle top edge specular highlight */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-lg" />
            </div>

            <div className="flex flex-col">
              <span className="font-serif text-sm sm:text-base font-semibold tracking-wider text-[#20232A] transition-colors group-hover:text-[#A97B32] dark:text-[#F6F3EC] dark:group-hover:text-[#E6C27A]">
                AURELIS
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-[#858A93] dark:text-[#777F8C] -mt-0.5">
                {t('app.brandTagline', 'Remember what matters')}
              </span>
            </div>
          </button>

          {state.isDemoData && (
            <button
              onClick={() => purgeDemoData()}
              title="Reset all demo data and start with an empty slate"
              className="hidden items-center gap-1.5 text-xs text-[#858A93] dark:text-[#777F8C] sm:inline-flex hover:text-[#A97B32] dark:hover:text-[#E6C27A] transition-colors ml-1"
            >
              <span aria-hidden="true">·</span>
              <span className="text-[#A97B32] dark:text-[#E6C27A]/90 hover:underline">
                {t('nav.resetDemo', 'Reset Demo Data')}
              </span>
            </button>
          )}
        </div>

        {/* Zone 2: Clean text navigation links (Hidden on mobile, prominent on tablet/desktop) */}
        <nav
          className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wide uppercase text-[#686D77] dark:text-[#A7ABB5]"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => setActiveView('dashboard')}
            className={`transition-colors hover:text-[#20232A] dark:hover:text-[#F6F3EC] ${
              activeView === 'dashboard'
                ? 'text-[#20232A] font-semibold border-b-2 border-[#A97B32] pb-0.5 dark:text-[#F6F3EC] dark:border-[#E6C27A]'
                : ''
            }`}
          >
            {t('nav.dashboard', "Today's Focus")}
          </button>
          <button
            onClick={() => setActiveView('review')}
            className={`transition-colors hover:text-[#20232A] dark:hover:text-[#F6F3EC] ${
              activeView === 'review'
                ? 'text-[#20232A] font-semibold border-b-2 border-[#A97B32] pb-0.5 dark:text-[#F6F3EC] dark:border-[#E6C27A]'
                : ''
            }`}
          >
            {t('nav.review', 'Revision Queue')}
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`transition-colors hover:text-[#20232A] dark:hover:text-[#F6F3EC] ${
              activeView === 'calendar'
                ? 'text-[#20232A] font-semibold border-b-2 border-[#A97B32] pb-0.5 dark:text-[#F6F3EC] dark:border-[#E6C27A]'
                : ''
            }`}
          >
            {t('nav.calendar', 'Calendar')}
          </button>
          <button
            onClick={() => setActiveView('subjects')}
            className={`transition-colors hover:text-[#20232A] dark:hover:text-[#F6F3EC] ${
              activeView === 'subjects'
                ? 'text-[#20232A] font-semibold border-b-2 border-[#A97B32] pb-0.5 dark:text-[#F6F3EC] dark:border-[#E6C27A]'
                : ''
            }`}
          >
            {t('nav.subjects', 'Subjects')}
          </button>
          <button
            onClick={() => setActiveView('tests')}
            className={`transition-colors hover:text-[#20232A] dark:hover:text-[#F6F3EC] ${
              activeView === 'tests'
                ? 'text-[#20232A] font-semibold border-b-2 border-[#A97B32] pb-0.5 dark:text-[#F6F3EC] dark:border-[#E6C27A]'
                : ''
            }`}
          >
            {t('nav.tests', 'Weekly Tests')}
          </button>
          <button
            onClick={() => setActiveView('errors')}
            className={`transition-colors hover:text-[#20232A] dark:hover:text-[#F6F3EC] ${
              activeView === 'errors'
                ? 'text-[#20232A] font-semibold border-b-2 border-[#A97B32] pb-0.5 dark:text-[#F6F3EC] dark:border-[#E6C27A]'
                : ''
            }`}
          >
            {t('nav.errors', 'Error Log')}
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`transition-colors hover:text-[#20232A] dark:hover:text-[#F6F3EC] ${
              activeView === 'analytics'
                ? 'text-[#20232A] font-semibold border-b-2 border-[#A97B32] pb-0.5 dark:text-[#F6F3EC] dark:border-[#E6C27A]'
                : ''
            }`}
          >
            {t('nav.analytics', 'Analytics')}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {streakInfo.currentStreak > 0 && (
            <button
              onClick={() => setActiveView('dashboard')}
              title={streakInfo.statusMessage}
              className="hidden sm:flex h-8 items-center gap-1.5 rounded-lg border border-[#E6C27A]/30 bg-[#E6C27A]/10 px-2.5 text-xs font-mono font-semibold text-[#8C6221] dark:text-[#FFE6AD] hover:bg-[#E6C27A]/20 transition-colors"
            >
              <Flame className="h-3.5 w-3.5 fill-[#E6C27A] text-[#B88A43] dark:text-[#E6C27A]" />
              <span className="tabular-nums">{streakInfo.currentStreak}d</span>
            </button>
          )}

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex h-8 items-center gap-2 rounded-lg border border-black/[0.08] bg-white/60 px-2.5 text-xs text-[#686D77] transition-all hover:bg-white hover:text-[#20232A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#A7ABB5] dark:hover:bg-white/[0.08] dark:hover:text-[#F6F3EC]"
            title={t('nav.searchPlaceholder', 'Search topics, notes & mistakes (⌘K)')}
            aria-label={t('nav.search', 'Search')}
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('nav.search', 'Search')}</span>
            <kbd className="hidden sm:inline-block rounded border border-black/[0.1] bg-white/80 px-1 text-[10px] font-mono text-[#858A93] dark:border-white/[0.1] dark:bg-white/[0.06] dark:text-[#777F8C]">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/[0.08] text-[#686D77] transition-colors hover:bg-white/70 hover:text-[#20232A] dark:border-white/[0.08] dark:text-[#A7ABB5] dark:hover:bg-white/[0.08] dark:hover:text-[#F6F3EC]"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-[#E6C27A]" /> : <Moon className="h-3.5 w-3.5 text-[#A97B32]" />}
          </button>

          <button
            onClick={() => setIsAddTopicOpen(true)}
            className="btn-gold-primary flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs tracking-tight"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span className="whitespace-nowrap font-semibold">{t('nav.addTopic', 'Add Topic')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

