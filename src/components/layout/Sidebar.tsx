import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    state,
    todayReviewsDue,
    weeklyTestsDue,
    setIsSettingsOpen,
  } = useApp();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const dueCount = todayReviewsDue.length;
  const testCount = weeklyTestsDue.length;

  const navItems = [
    { id: 'dashboard', label: "Today's Focus", icon: LayoutDashboard, badge: dueCount > 0 ? dueCount : null },
    { id: 'review', label: 'Revision Queue', icon: Repeat, badge: dueCount > 0 ? dueCount : null },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'tests', label: 'Weekly Tests', icon: FileCheck2, badge: testCount > 0 ? testCount : null },
    { id: 'errors', label: 'Error Notebook', icon: AlertCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col border-r border-neutral-200/80 bg-[#fafafa] dark:border-neutral-800/80 dark:bg-[#0c0d11] transition-all duration-200 ease-in-out shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-neutral-200/60 dark:border-neutral-800/60">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded bg-neutral-900 text-[11px] font-semibold text-amber-300 ring-1 ring-amber-400/30 dark:bg-neutral-800">
              A
            </span>
            <span className="font-serif text-sm font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">
              AURELIS
            </span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200 ${
            isCollapsed ? 'mx-auto' : ''
          }`}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-800/90 dark:text-amber-200'
                  : 'text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-850 dark:hover:text-neutral-200'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-amber-400' : 'text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400 dark:group-hover:text-neutral-200'
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
              {!isCollapsed && item.badge !== null && item.badge !== undefined && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400/20 px-1 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Student Profile Card & Settings at bottom */}
      <div className="border-t border-neutral-200/60 p-2.5 dark:border-neutral-800/60 space-y-1">
        <button
          onClick={() => setActiveView('landing')}
          className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs text-neutral-600 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-850 dark:hover:text-neutral-200 ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Product Vision & Landing"
        >
          <Sparkles className="h-4 w-4 shrink-0 text-amber-500/80" />
          {!isCollapsed && <span className="truncate">Public Overview</span>}
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs text-neutral-600 transition-colors hover:bg-neutral-200/50 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-850 dark:hover:text-neutral-200 ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title="Settings & Data Preferences"
        >
          <Settings className="h-4 w-4 shrink-0 text-neutral-500" />
          {!isCollapsed && <span className="truncate">Settings & Backup</span>}
        </button>

        {!isCollapsed && (
          <div className="mt-2 rounded-lg bg-neutral-100/70 p-2.5 dark:bg-neutral-900/60">
            <div className="text-[11px] font-medium text-neutral-900 dark:text-neutral-200 truncate">
              {state.settings.studentName || 'Aakash Panjiyar'}
            </div>
            <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
              {state.settings.targetExam || 'Preparation Mode'}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
