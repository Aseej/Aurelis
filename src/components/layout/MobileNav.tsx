import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  Home,
  Repeat,
  Calendar,
  BookOpen,
  MoreHorizontal,
  FileText,
  AlertCircle,
  BarChart3,
  Settings as SettingsIcon,
  Compass,
  X,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeView, setActiveView, todayReviewsDue, setIsSettingsOpen } = useApp();
  const { t } = useI18n();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const dueCount = todayReviewsDue.length;

  return (
    <>
      {/* More actions overlay sheet when More tab is tapped */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="fixed bottom-20 left-4 right-4 rounded-3xl glass-premium p-5 shadow-2xl border border-white/20 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                {t('nav.additionalViews', 'Additional Study Views')}
              </span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="h-6 w-6 flex items-center justify-center rounded-full text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
                aria-label={t('common.close', 'Close')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setActiveView('tests');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                  activeView === 'tests'
                    ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold'
                    : 'text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0 text-[#E6C27A]" />
                <span>{t('nav.tests', 'Weekly Tests')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('errors');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                  activeView === 'errors'
                    ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold'
                    : 'text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-[#F87171]" />
                <span>{t('nav.errors', 'Error Notebook')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('analytics');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                  activeView === 'analytics'
                    ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold'
                    : 'text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <BarChart3 className="h-4 w-4 shrink-0 text-[#60A5FA]" />
                <span>{t('nav.analytics', 'Analytics')}</span>
              </button>

              <button
                onClick={() => {
                  setActiveView('landing');
                  setIsMoreMenuOpen(false);
                }}
                className={`flex items-center gap-2.5 rounded-xl p-3 text-left transition-all ${
                  activeView === 'landing'
                    ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold'
                    : 'text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <Compass className="h-4 w-4 shrink-0 text-[#34D399]" />
                <span>{t('nav.landing', 'Public Overview')}</span>
              </button>

              <button
                onClick={() => {
                  setIsSettingsOpen(true);
                  setIsMoreMenuOpen(false);
                }}
                className="col-span-2 flex items-center gap-2.5 rounded-xl p-3 text-left text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] mt-1"
              >
                <SettingsIcon className="h-4 w-4 shrink-0 text-[#858A93] dark:text-[#777F8C]" />
                <span className="font-medium">{t('nav.settings', 'Settings & Data Backup')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Translucent Liquid Glass Bottom Navigation Dock */}
      <div className="fixed bottom-3 inset-x-3 z-30 flex justify-center md:hidden pointer-events-none pb-safe">
        <nav
          className="pointer-events-auto w-full max-w-md rounded-2xl glass-dock px-2 py-1.5 shadow-2xl transition-all"
          aria-label="Mobile Bottom Navigation"
        >
          <div className="grid grid-cols-5 items-center">
            {/* 1. Home */}
            <button
              onClick={() => {
                setActiveView('dashboard');
                setIsMoreMenuOpen(false);
              }}
              className={`relative flex min-h-[46px] flex-col items-center justify-center rounded-xl transition-all ${
                activeView === 'dashboard'
                  ? 'text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <Home className="h-4.5 w-4.5" />
              <span className="mt-1 text-[10px] tracking-tight">{t('nav.dashboard', 'Home')}</span>
              {activeView === 'dashboard' && (
                <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-[#E6C27A]" />
              )}
            </button>

            {/* 2. Review */}
            <button
              onClick={() => {
                setActiveView('review');
                setIsMoreMenuOpen(false);
              }}
              className={`relative flex min-h-[46px] flex-col items-center justify-center rounded-xl transition-all ${
                activeView === 'review'
                  ? 'text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <div className="relative">
                <Repeat className="h-4.5 w-4.5" />
                {dueCount > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#E6C27A] px-1 text-[9px] font-bold text-[#090B10]">
                    {dueCount}
                  </span>
                )}
              </div>
              <span className="mt-1 text-[10px] tracking-tight">{t('nav.review', 'Review')}</span>
              {activeView === 'review' && (
                <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-[#E6C27A]" />
              )}
            </button>

            {/* 3. Calendar */}
            <button
              onClick={() => {
                setActiveView('calendar');
                setIsMoreMenuOpen(false);
              }}
              className={`relative flex min-h-[46px] flex-col items-center justify-center rounded-xl transition-all ${
                activeView === 'calendar'
                  ? 'text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <Calendar className="h-4.5 w-4.5" />
              <span className="mt-1 text-[10px] tracking-tight">{t('nav.calendar', 'Calendar')}</span>
              {activeView === 'calendar' && (
                <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-[#E6C27A]" />
              )}
            </button>

            {/* 4. Subjects */}
            <button
              onClick={() => {
                setActiveView('subjects');
                setIsMoreMenuOpen(false);
              }}
              className={`relative flex min-h-[46px] flex-col items-center justify-center rounded-xl transition-all ${
                activeView === 'subjects'
                  ? 'text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <BookOpen className="h-4.5 w-4.5" />
              <span className="mt-1 text-[10px] tracking-tight">{t('nav.subjects', 'Subjects')}</span>
              {activeView === 'subjects' && (
                <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-[#E6C27A]" />
              )}
            </button>

            {/* 5. More */}
            <button
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className={`relative flex min-h-[46px] flex-col items-center justify-center rounded-xl transition-all ${
                isMoreMenuOpen || ['tests', 'errors', 'analytics'].includes(activeView)
                  ? 'text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <MoreHorizontal className="h-4.5 w-4.5" />
              <span className="mt-1 text-[10px] tracking-tight">{t('nav.menu', 'More')}</span>
              {['tests', 'errors', 'analytics'].includes(activeView) && (
                <span className="absolute bottom-1 h-0.5 w-3 rounded-full bg-[#E6C27A]" />
              )}
            </button>
          </div>
        </nav>
      </div>
    </>
  );
};

