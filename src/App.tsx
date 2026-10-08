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

const AppContent: React.FC = () => {
  const { activeView, state, updateSettings } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] dark:bg-[#0a0b0e] text-neutral-900 dark:text-neutral-100 selection:bg-amber-400/20 selection:text-amber-300">
      {/* Top Bar following Top Bar Contract */}
      <Navbar />

      {activeView === 'landing' ? (
        <LandingPage />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Collapsible Sidebar */}
          <Sidebar />

          {/* Primary Content Viewport */}
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
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

      {/* Mobile Navigation Tab Bar (hidden in landing view) */}
      {activeView !== 'landing' && <MobileNav />}

      {/* Global Modals - single consistent tree with keys */}
      <AddTopicModal key="modal-add-topic" />
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

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
