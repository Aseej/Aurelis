/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { RevisionQueueView } from './components/review/RevisionQueueView';
import { CalendarView } from './components/calendar/CalendarView';
import { SubjectsView } from './components/subjects/SubjectsView';
import { WeeklyTestsView } from './components/tests/WeeklyTestsView';
import { ErrorLogView } from './components/errors/ErrorLogView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { LandingPage } from './components/landing/LandingPage';
import { AddTopicModal } from './components/topics/AddTopicModal';
import { ReviewSessionModal } from './components/review/ReviewSessionModal';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { AddSubjectModal } from './components/subjects/AddSubjectModal';

import { I18nProvider } from './i18n';

const AppContent: React.FC = () => {
  const { activeView, state, updateSettings } = useApp();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F4F1EA] dark:bg-[#090B10] text-[#20232A] dark:text-[#F6F3EC] selection:bg-[#E6C27A]/25 selection:text-[#B88A43] dark:selection:text-[#FFE6AD] overflow-x-hidden">
      {/* Cinematic Ambient Atmosphere Layers */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle warm champagne-gold ambient glow top-right */}
        <div className="absolute -top-[120px] right-[5%] h-[550px] w-[550px] rounded-full bg-gradient-to-br from-[#E6C27A]/8 via-[#B88A43]/4 to-transparent blur-[120px] dark:from-[#E6C27A]/12 dark:via-[#B88A43]/6" />
        {/* Subtle cool obsidian-indigo ambient glow mid-left */}
        <div className="absolute top-[35%] -left-[100px] h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-[#60A5FA]/4 to-transparent blur-[140px] dark:from-[#3B82F6]/6" />
        {/* Faint gold highlight focal glow bottom-right */}
        <div className="absolute -bottom-[80px] right-[15%] h-[420px] w-[420px] rounded-full bg-gradient-to-t from-[#B88A43]/5 to-transparent blur-[110px] dark:from-[#B88A43]/8" />
      </div>

      {/* Top Bar following Top Bar Contract */}
      <div className="relative z-30">
        <Navbar />
      </div>

      {activeView === 'landing' ? (
        <div className="relative z-10">
          <LandingPage />
        </div>
      ) : (
        <div className="relative z-10 flex-1 flex overflow-hidden">
          {/* Desktop Collapsible Sidebar */}
          <Sidebar />

          {/* Primary Content Viewport */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto pb-28 lg:pb-14">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'review' && <RevisionQueueView />}
            {activeView === 'calendar' && <CalendarView />}
            {activeView === 'subjects' && <SubjectsView />}
            {activeView === 'tests' && <WeeklyTestsView />}
            {activeView === 'errors' && <ErrorLogView />}
            {activeView === 'analytics' && <AnalyticsView />}
          </main>
        </div>
      )}

      {/* Floating Bottom Navigation Dock (hidden in landing view) */}
      {activeView !== 'landing' && <MobileNav />}

      {/* Global Modals - single consistent tree with keys */}
      <AddTopicModal key="modal-add-topic" />
      <AddSubjectModal key="modal-add-subject" />
      <ReviewSessionModal key="modal-review-session" />
      <GlobalSearchModal key="modal-search" />
      <SettingsModal key="modal-settings" />
      <OnboardingModal
        key="modal-onboarding"
        isOpen={!state.settings.onboarded}
        onClose={() => updateSettings({ onboarded: true })}
      />
    </div>
  );
};

const AppWithI18n: React.FC = () => {
  const { state, updateSettings } = useApp();
  const currentLanguage = state.settings.language || 'en';

  const handleLanguageChange = (code: string) => {
    updateSettings({ language: code });
  };

  return (
    <I18nProvider currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange}>
      <AppContent />
    </I18nProvider>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppWithI18n />
    </AppProvider>
  );
}
