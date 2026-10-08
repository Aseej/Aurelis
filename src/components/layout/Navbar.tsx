import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, Plus, Moon, Sun, ShieldCheck, Flame } from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#0a0b0e]/85">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element brand wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveView('dashboard')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
            aria-label="AURELIS Home"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-xs font-semibold tracking-wider text-amber-300 ring-1 ring-amber-400/30 dark:bg-neutral-800 dark:text-amber-300">
              A
            </span>
            <span className="font-serif text-base font-semibold tracking-wide text-neutral-900 transition-colors group-hover:text-amber-600 dark:text-neutral-100 dark:group-hover:text-amber-400">
              AURELIS
            </span>
          </button>

          {state.isDemoData && (
            <button
              onClick={() => purgeDemoData()}
              title="Reset all demo data and start with an empty slate"
              className="hidden items-center gap-1.5 text-xs text-neutral-500 sm:inline-flex hover:text-amber-600 dark:hover:text-amber-300 transition-colors"
            >
              <span aria-hidden="true">·</span>
              <span className="text-amber-600/90 dark:text-amber-400/80 hover:underline">
                Reset Demo Data
              </span>
            </button>
          )}
        </div>

        {/* Zone 2: Clean text navigation links (Hidden on mobile, prominent on tablet/desktop) */}
        <nav
          className="hidden md:flex items-center gap-6 text-xs font-medium tracking-wide uppercase text-neutral-600 dark:text-neutral-400"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => setActiveView('dashboard')}
            className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              activeView === 'dashboard'
                ? 'text-neutral-950 font-semibold border-b-2 border-amber-500 pb-0.5 dark:text-white'
                : ''
            }`}
          >
            Today's Focus
          </button>
          <button
            onClick={() => setActiveView('review')}
            className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              activeView === 'review'
                ? 'text-neutral-950 font-semibold border-b-2 border-amber-500 pb-0.5 dark:text-white'
                : ''
            }`}
          >
            Revision Queue
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              activeView === 'calendar'
                ? 'text-neutral-950 font-semibold border-b-2 border-amber-500 pb-0.5 dark:text-white'
                : ''
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setActiveView('subjects')}
            className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              activeView === 'subjects'
                ? 'text-neutral-950 font-semibold border-b-2 border-amber-500 pb-0.5 dark:text-white'
                : ''
            }`}
          >
            Subjects
          </button>
          <button
            onClick={() => setActiveView('tests')}
            className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              activeView === 'tests'
                ? 'text-neutral-950 font-semibold border-b-2 border-amber-500 pb-0.5 dark:text-white'
                : ''
            }`}
          >
            Weekly Tests
          </button>
          <button
            onClick={() => setActiveView('errors')}
            className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              activeView === 'errors'
                ? 'text-neutral-950 font-semibold border-b-2 border-amber-500 pb-0.5 dark:text-white'
                : ''
            }`}
          >
            Error Log
          </button>
          <button
            onClick={() => setActiveView('analytics')}
            className={`transition-colors hover:text-neutral-900 dark:hover:text-neutral-100 ${
              activeView === 'analytics'
                ? 'text-neutral-950 font-semibold border-b-2 border-amber-500 pb-0.5 dark:text-white'
                : ''
            }`}
          >
            Analytics
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {streakInfo.currentStreak > 0 && (
            <button
              onClick={() => setActiveView('dashboard')}
              title={streakInfo.statusMessage}
              className="hidden sm:flex h-9 items-center gap-1.5 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2.5 text-xs font-mono font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-400/15 transition-colors"
            >
              <Flame className="h-3.5 w-3.5 fill-current text-amber-500" />
              <span className="tabular-nums">{streakInfo.currentStreak}d</span>
            </button>
          )}

          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex h-9 items-center gap-2 rounded-lg border border-neutral-200/90 bg-neutral-100/70 px-2.5 text-xs text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-neutral-200"
            title="Search topics, notes & mistakes (⌘K)"
            aria-label="Quick Search"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden sm:inline-block rounded border border-neutral-300 bg-white px-1 text-[10px] font-mono text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200/90 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={() => setIsAddTopicOpen(true)}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-neutral-900 px-3 text-xs font-medium text-amber-300 shadow-sm transition-all hover:bg-neutral-800 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap font-semibold">Add Topic</span>
          </button>
        </div>
      </div>
    </header>
  );
};
