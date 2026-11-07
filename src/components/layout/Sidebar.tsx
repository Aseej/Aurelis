import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  LayoutDashboard,
  Repeat,
  Calendar,
  BookOpen,
  FileCheck2,
  AlertCircle,
  BarChart3,
  Calculator,
  Compass,
  Settings,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  RotateCcw,
  X,
  Sparkles,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    todayReviewsDue,
    weeklyTestsDue,
    setIsSettingsOpen,
    state,
    purgeDemoData,
  } = useApp();

  const { t, isRTL } = useI18n();

  // Collapsed state persisted in localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aurelis_sidebar_collapsed') === 'true';
    }
    return false;
  });

  // More menu popover state
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const morePopoverRef = useRef<HTMLDivElement | null>(null);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('aurelis_sidebar_collapsed', String(next));
      return next;
    });
    // Close popover if toggling
    setIsMoreOpen(false);
  };

  // Close More popover on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isMoreOpen &&
        morePopoverRef.current &&
        !morePopoverRef.current.contains(e.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(e.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMoreOpen) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMoreOpen]);

  const dueCount = todayReviewsDue.length;
  const testCount = weeklyTestsDue.length;
  const tooltipPosClass = isRTL ? 'right-full mr-3' : 'left-full ml-3';

  // Primary navigation items
  const primaryItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard', "Today's Focus"),
      icon: LayoutDashboard,
      badge: dueCount > 0 ? dueCount : null,
    },
    {
      id: 'review',
      label: t('nav.review', 'Revision Queue'),
      icon: Repeat,
      badge: dueCount > 0 ? dueCount : null,
    },
    {
      id: 'calendar',
      label: t('nav.calendar', 'Calendar'),
      icon: Calendar,
    },
    {
      id: 'subjects',
      label: t('nav.subjects', 'Subjects'),
      icon: BookOpen,
    },
  ];

  // Secondary / study views
  const secondaryItems = [
    {
      id: 'tests',
      label: t('nav.tests', 'Weekly Tests'),
      icon: FileCheck2,
      badge: testCount > 0 ? testCount : null,
    },
    {
      id: 'errors',
      label: t('nav.errors', 'Error Notebook'),
      icon: AlertCircle,
    },
    {
      id: 'analytics',
      label: t('nav.analytics', 'Analytics'),
      icon: BarChart3,
    },
    {
      id: 'tools',
      label: t('nav.tools', 'Tools'),
      icon: Calculator,
    },
  ];

  // Check if current view is inside More destinations
  const isMoreDestinationActive = ['tests', 'errors', 'analytics', 'tools', 'landing'].includes(
    activeView
  );

  return (
    <aside
      className={`hidden md:flex flex-col relative sticky top-0 h-screen shrink-0 z-30 ${
        isRTL ? 'border-l' : 'border-r'
      } border-black/[0.06] bg-[#FAF8F5]/90 dark:border-white/[0.08] dark:bg-[#0C0E14]/90 backdrop-blur-2xl transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
      aria-label="Desktop Sidebar Navigation"
    >
      {/* 1. Sidebar Brand Header */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-black/[0.05] dark:border-white/[0.06]">
        {/* Expanded Brand View */}
        {!isCollapsed ? (
          <button
            onClick={() => setActiveView('dashboard')}
            className="group flex items-center gap-3 text-left focus:outline-none min-w-0"
            aria-label="AURELIS Home"
          >
            {/* Logo Emblem Tile */}
            <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E2430] to-[#0E1118] text-sm font-semibold tracking-wider text-[#E6C27A] shadow-sm border border-white/10 dark:from-[#1E2430] dark:to-[#090B10] dark:border-[#E6C27A]/30 transition-transform group-hover:scale-105">
              <span className="font-serif">A</span>
              <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-xl" />
            </div>

            {/* Brand Title & Tagline */}
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-base font-bold tracking-wider text-[#20232A] transition-colors group-hover:text-[#A97B32] dark:text-[#F6F3EC] dark:group-hover:text-[#E6C27A] truncate">
                AURELIS
              </span>
              <span className="text-[9.5px] uppercase tracking-widest text-[#858A93] dark:text-[#777F8C] -mt-0.5 truncate">
                {t('app.brandTagline', 'Remember what matters')}
              </span>
            </div>
          </button>
        ) : (
          /* Collapsed Brand View */
          <button
            onClick={() => setActiveView('dashboard')}
            className="group mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#1E2430] to-[#0E1118] text-sm font-semibold tracking-wider text-[#E6C27A] shadow-sm border border-white/10 dark:from-[#1E2430] dark:to-[#090B10] dark:border-[#E6C27A]/30 transition-transform hover:scale-105"
            aria-label="AURELIS Home"
            title="AURELIS"
          >
            <span className="font-serif">A</span>
            <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 rounded-t-xl" />
          </button>
        )}

        {/* Collapse / Expand Toggle Button */}
        {!isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#858A93] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC] transition-colors shrink-0"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            {isRTL ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className={`flex-1 px-2.5 py-3 space-y-4 scrollbar-none ${isCollapsed ? 'overflow-visible' : 'overflow-y-auto'}`}>
        {/* Section 1: Core Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider uppercase text-[#858A93] dark:text-[#777F8C]">
              {t('nav.menu', 'Navigation')}
            </div>
          )}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold shadow-xs'
                      : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.05] dark:hover:text-[#F6F3EC]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#A97B32] dark:text-[#E6C27A]'
                        : 'text-[#858A93] group-hover:text-[#20232A] dark:text-[#777F8C] dark:group-hover:text-[#F6F3EC]'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                    <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[#E6C27A] px-1.5 text-[10px] font-mono font-bold text-black">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className={`pointer-events-none absolute ${tooltipPosClass} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center rounded-xl bg-[#1C1F26] text-[#F6F3EC] px-3 py-1.5 text-xs font-medium shadow-2xl whitespace-nowrap z-50 border border-white/10`}>
                    <span>{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="ml-2 px-1.5 py-0.2 rounded-full bg-[#E6C27A] text-[9.5px] font-bold text-black font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section 2: Dedicated Study Tools */}
        <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.05]">
          {!isCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider uppercase text-[#858A93] dark:text-[#777F8C]">
              {t('nav.tools', 'Academic Tools')}
            </div>
          )}
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold shadow-xs'
                      : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.05] dark:hover:text-[#F6F3EC]'
                  } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      isActive
                        ? 'text-[#A97B32] dark:text-[#E6C27A]'
                        : 'text-[#858A93] group-hover:text-[#20232A] dark:text-[#777F8C] dark:group-hover:text-[#F6F3EC]'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="flex-1 text-left truncate">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                    <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-[#E6C27A] px-1.5 text-[10px] font-mono font-bold text-black">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className={`pointer-events-none absolute ${tooltipPosClass} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center rounded-xl bg-[#1C1F26] text-[#F6F3EC] px-3 py-1.5 text-xs font-medium shadow-2xl whitespace-nowrap z-50 border border-white/10`}>
                    <span>{item.label}</span>
                    {item.badge !== null && item.badge !== undefined && (
                      <span className="ml-2 px-1.5 py-0.2 rounded-full bg-[#E6C27A] text-[9.5px] font-bold text-black font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Section 3: More & System Views */}
        <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.05] relative">
          {!isCollapsed && (
            <div className="px-2.5 pb-1 text-[10px] font-semibold tracking-wider uppercase text-[#858A93] dark:text-[#777F8C]">
              {t('nav.additionalViews', 'More & Overview')}
            </div>
          )}

          {/* More Navigation Button with Popover Flyout */}
          <div className="relative group">
            <button
              ref={moreButtonRef}
              onClick={() => setIsMoreOpen((prev) => !prev)}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                isMoreOpen || isMoreDestinationActive
                  ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold shadow-xs'
                  : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.05] dark:hover:text-[#F6F3EC]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? t('nav.more', 'More') : undefined}
              aria-expanded={isMoreOpen}
              aria-haspopup="true"
            >
              <MoreHorizontal
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isMoreOpen || isMoreDestinationActive
                    ? 'text-[#A97B32] dark:text-[#E6C27A]'
                    : 'text-[#858A93] group-hover:text-[#20232A] dark:text-[#777F8C] dark:group-hover:text-[#F6F3EC]'
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{t('nav.more', 'More')}</span>
              )}
              {!isCollapsed && isMoreDestinationActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#E6C27A]" />
              )}
            </button>

            {/* Collapsed Tooltip for More */}
            {isCollapsed && (
              <div className={`pointer-events-none absolute ${tooltipPosClass} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center rounded-xl bg-[#1C1F26] text-[#F6F3EC] px-3 py-1.5 text-xs font-medium shadow-2xl whitespace-nowrap z-50 border border-white/10`}>
                <span>{t('nav.more', 'More')}</span>
              </div>
            )}
          </div>

          {/* Public Overview Link */}
          <div className="relative group">
            <button
              onClick={() => setActiveView('landing')}
              className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                activeView === 'landing'
                  ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold shadow-xs'
                  : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.05] dark:hover:text-[#F6F3EC]'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? t('nav.landing', 'Public Overview') : undefined}
            >
              <Compass
                className={`h-4 w-4 shrink-0 transition-colors ${
                  activeView === 'landing'
                    ? 'text-[#A97B32] dark:text-[#E6C27A]'
                    : 'text-[#858A93] group-hover:text-[#20232A] dark:text-[#777F8C] dark:group-hover:text-[#F6F3EC]'
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{t('nav.landing', 'Public Overview')}</span>
              )}
            </button>

            {/* Collapsed Tooltip for Public Overview */}
            {isCollapsed && (
              <div className={`pointer-events-none absolute ${tooltipPosClass} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center rounded-xl bg-[#1C1F26] text-[#F6F3EC] px-3 py-1.5 text-xs font-medium shadow-2xl whitespace-nowrap z-50 border border-white/10`}>
                <span>{t('nav.landing', 'Public Overview')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Dedicated More Menu Flyout Popover */}
      {isMoreOpen && (
        <div
          ref={morePopoverRef}
          className={`absolute ${
            isRTL
              ? isCollapsed ? 'right-[84px]' : 'right-[260px]'
              : isCollapsed ? 'left-[84px]' : 'left-[260px]'
          } bottom-14 z-50 w-72 rounded-2xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-3 shadow-2xl space-y-1.5 animate-fadeIn backdrop-blur-2xl`}
          role="menu"
          aria-label="More navigation destinations"
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08] px-1.5">
            <div className="flex items-center gap-1.5">
              <MoreHorizontal className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A]" />
              <span className="text-[11px] font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                {t('nav.additionalViews', 'More Destinations')}
              </span>
            </div>
            <button
              onClick={() => setIsMoreOpen(false)}
              className="p-1 rounded-md text-[#858A93] hover:text-[#20232A] dark:hover:text-white transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Destination Links */}
          <div className="space-y-1 py-1">
            <button
              onClick={() => {
                setActiveView('tests');
                setIsMoreOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                activeView === 'tests'
                  ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <FileCheck2 className="h-4 w-4 shrink-0 text-[#E6C27A]" />
              <span className="flex-1 text-left">{t('nav.tests', 'Weekly Tests')}</span>
              {testCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-[#E6C27A] text-[9.5px] font-bold text-black font-mono">
                  {testCount}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveView('errors');
                setIsMoreOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                activeView === 'errors'
                  ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <AlertCircle className="h-4 w-4 shrink-0 text-[#F87171]" />
              <span className="flex-1 text-left">{t('nav.errors', 'Error Notebook')}</span>
            </button>

            <button
              onClick={() => {
                setActiveView('analytics');
                setIsMoreOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                activeView === 'analytics'
                  ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <BarChart3 className="h-4 w-4 shrink-0 text-[#60A5FA]" />
              <span className="flex-1 text-left">{t('nav.analytics', 'Analytics')}</span>
            </button>

            <button
              onClick={() => {
                setActiveView('tools');
                setIsMoreOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                activeView === 'tools'
                  ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <Calculator className="h-4 w-4 shrink-0 text-[#E6C27A]" />
              <span className="flex-1 text-left">{t('nav.tools', 'Tools')}</span>
            </button>

            <button
              onClick={() => {
                setActiveView('landing');
                setIsMoreOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                activeView === 'landing'
                  ? 'bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <Compass className="h-4 w-4 shrink-0 text-[#34D399]" />
              <span className="flex-1 text-left">{t('nav.landing', 'Public Overview')}</span>
            </button>

            {/* Settings destination */}
            <button
              onClick={() => {
                setIsSettingsOpen(true);
                setIsMoreOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors border-t border-black/[0.04] dark:border-white/[0.06] pt-2"
            >
              <Settings className="h-4 w-4 shrink-0 text-[#A97B32] dark:text-[#E6C27A]" />
              <span className="flex-1 text-left font-semibold">
                {t('nav.settings', 'Settings & Data Backup')}
              </span>
            </button>

            {/* Reset Demo Data if active */}
            {state.isDemoData && (
              <button
                onClick={() => {
                  purgeDemoData();
                  setIsMoreOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-xs text-rose-500 hover:bg-rose-500/10 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span className="flex-1 text-left">{t('nav.resetDemo', 'Reset Demo Data')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. Sidebar Footer with Settings & Collapse Toggle */}
      <div className="p-3 border-t border-black/[0.05] dark:border-white/[0.06] space-y-1.5">
        {/* Settings button */}
        <div className="relative group">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.05] dark:hover:text-[#F6F3EC] transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title={isCollapsed ? t('nav.settings', 'Settings & Backup') : undefined}
          >
            <Settings className="h-4 w-4 shrink-0 text-[#858A93] dark:text-[#777F8C] group-hover:rotate-45 transition-transform duration-300" />
            {!isCollapsed && (
              <span className="flex-1 text-left truncate">{t('nav.settings', 'Settings & Backup')}</span>
            )}
          </button>

          {/* Collapsed Tooltip for Settings */}
          {isCollapsed && (
            <div className={`pointer-events-none absolute ${tooltipPosClass} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center rounded-xl bg-[#1C1F26] text-[#F6F3EC] px-3 py-1.5 text-xs font-medium shadow-2xl whitespace-nowrap z-50 border border-white/10`}>
              <span>{t('nav.settings', 'Settings & Backup')}</span>
            </div>
          )}
        </div>

        {/* Collapsed Expand Button */}
        {isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="flex w-full items-center justify-center h-8 rounded-xl text-[#858A93] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC] transition-colors"
            title="Expand sidebar"
            aria-label="Expand sidebar"
          >
            {isRTL ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
        )}
      </div>
    </aside>
  );
};
