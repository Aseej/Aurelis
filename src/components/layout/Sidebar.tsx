import React, { useState } from 'react';
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
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    todayReviewsDue,
    weeklyTestsDue,
    setIsSettingsOpen,
  } = useApp();

  const { t, isRTL } = useI18n();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const dueCount = todayReviewsDue.length;
  const testCount = weeklyTestsDue.length;

  const navItems = [
    { id: 'dashboard', label: t('nav.dashboard', "Today's Focus"), icon: LayoutDashboard, badge: dueCount > 0 ? dueCount : null },
    { id: 'review', label: t('nav.review', 'Revision Queue'), icon: Repeat, badge: dueCount > 0 ? dueCount : null },
    { id: 'calendar', label: t('nav.calendar', 'Calendar'), icon: Calendar },
    { id: 'subjects', label: t('nav.subjects', 'Subjects'), icon: BookOpen },
    { id: 'tests', label: t('nav.tests', 'Weekly Tests'), icon: FileCheck2, badge: testCount > 0 ? testCount : null },
    { id: 'errors', label: t('nav.errors', 'Error Notebook'), icon: AlertCircle },
    { id: 'analytics', label: t('nav.analytics', 'Analytics'), icon: BarChart3 },
    { id: 'landing', label: t('nav.landing', 'Public Overview'), icon: Compass },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-black/[0.06] bg-[#EBE7DE]/50 backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#0E1118]/70 transition-all duration-200 ease-in-out shrink-0 select-none z-20 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-black/[0.06] dark:border-white/[0.08]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-[#1E2430] to-[#0E1118] text-[11px] font-serif font-semibold text-[#E6C27A] border border-white/10 dark:border-[#E6C27A]/30">
              A
            </span>
            <span className="font-serif text-xs font-semibold tracking-wider text-[#20232A] dark:text-[#F6F3EC]">
              {t('nav.menu', 'NAVIGATION')}
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex h-7 w-7 items-center justify-center rounded-md text-[#858A93] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:bg-white/[0.06] dark:hover:text-[#F6F3EC] ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-black/[0.07] text-[#20232A] shadow-xs border border-black/[0.08] dark:bg-white/[0.08] dark:text-[#FFE6AD] dark:border-white/[0.12]'
                  : 'text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.04] dark:hover:text-[#F6F3EC]'
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
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E6C27A]/20 px-1 text-[10px] font-mono font-semibold text-[#8C6221] dark:text-[#FFE6AD]">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer with Settings */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08]">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-[#686D77] hover:bg-black/[0.04] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:bg-white/[0.04] dark:hover:text-[#F6F3EC] transition-all ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={t('nav.settings', 'Settings & Backup')}
        >
          <Settings className="h-4 w-4 shrink-0 text-[#858A93] dark:text-[#777F8C]" />
          {!isCollapsed && (
            <span className="truncate">{t('nav.settings', 'Settings & Backup')}</span>
          )}
        </button>
      </div>
    </aside>
  );
};
