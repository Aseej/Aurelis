import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Home, Repeat, Calendar, BookOpen, MoreHorizontal, FileText, AlertCircle, BarChart3, Settings as SettingsIcon, Globe } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeView, setActiveView, todayReviewsDue, setIsSettingsOpen } = useApp();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const dueCount = todayReviewsDue.length;

  return (
    <>
      {/* More actions overlay sheet when More tab is tapped */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="fixed bottom-16 left-0 right-0 rounded-t-2xl border-t border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-800 dark:bg-[#121318]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2 px-2">
              Additional Views
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <button
                onClick={() => {
                  setActiveView('tests');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-lg p-3 text-left transition-colors ${
                  activeView === 'tests'
                    ? 'bg-amber-400/10 text-amber-600 dark:text-amber-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                <span className="font-medium">Weekly Tests</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('errors');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-lg p-3 text-left transition-colors ${
                  activeView === 'errors'
                    ? 'bg-amber-400/10 text-amber-600 dark:text-amber-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">Error Notebook</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('analytics');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-lg p-3 text-left transition-colors ${
                  activeView === 'analytics'
                    ? 'bg-amber-400/10 text-amber-600 dark:text-amber-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                <span className="font-medium">Analytics</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('landing');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-lg p-3 text-left transition-colors ${
                  activeView === 'landing'
                    ? 'bg-amber-400/10 text-amber-600 dark:text-amber-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                <Globe className="h-4 w-4 shrink-0" />
                <span className="font-medium">Public Overview</span>
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="col-span-2 flex items-center gap-2.5 rounded-lg p-3 text-left text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <SettingsIcon className="h-4 w-4 shrink-0" />
                <span className="font-medium">Settings & Data Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Fixed Bottom Tab Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 border-t border-neutral-200/90 bg-white/95 pb-safe backdrop-blur-md dark:border-neutral-800/90 dark:bg-[#0a0b0e]/95 md:hidden"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid h-14 grid-cols-5 items-center px-1">
          {/* 1. Home */}
          <button
            onClick={() => {
              setActiveView('dashboard');
              setIsMoreMenuOpen(false);
            }}
            className={`flex min-h-[44px] flex-col items-center justify-center transition-colors ${
              activeView === 'dashboard'
                ? 'text-neutral-900 font-semibold dark:text-amber-300'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="mt-1 text-[10px] tracking-tight">Home</span>
          </button>

          {/* 2. Review */}
          <button
            onClick={() => {
              setActiveView('review');
              setIsMoreMenuOpen(false);
            }}
            className={`relative flex min-h-[44px] flex-col items-center justify-center transition-colors ${
              activeView === 'review'
                ? 'text-neutral-900 font-semibold dark:text-amber-300'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <div className="relative">
              <Repeat className="h-5 w-5" />
              {dueCount > 0 && (
                <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-neutral-950">
                  {dueCount}
                </span>
              )}
            </div>
            <span className="mt-1 text-[10px] tracking-tight">Review</span>
          </button>

          {/* 3. Calendar */}
          <button
            onClick={() => {
              setActiveView('calendar');
              setIsMoreMenuOpen(false);
            }}
            className={`flex min-h-[44px] flex-col items-center justify-center transition-colors ${
              activeView === 'calendar'
                ? 'text-neutral-900 font-semibold dark:text-amber-300'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span className="mt-1 text-[10px] tracking-tight">Calendar</span>
          </button>

          {/* 4. Subjects */}
          <button
            onClick={() => {
              setActiveView('subjects');
              setIsMoreMenuOpen(false);
            }}
            className={`flex min-h-[44px] flex-col items-center justify-center transition-colors ${
              activeView === 'subjects'
                ? 'text-neutral-900 font-semibold dark:text-amber-300'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="mt-1 text-[10px] tracking-tight">Subjects</span>
          </button>

          {/* 5. More */}
          <button
            onClick={() => setIsMoreMenuOpen((prev) => !prev)}
            className={`flex min-h-[44px] flex-col items-center justify-center transition-colors ${
              isMoreMenuOpen || ['tests', 'errors', 'analytics'].includes(activeView)
                ? 'text-neutral-900 font-semibold dark:text-amber-300'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="mt-1 text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </>
  );
};
