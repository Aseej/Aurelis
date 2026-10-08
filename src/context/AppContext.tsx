/**
 * AURELIS App Context & Global State Provider
 * Implements centralized state management, deterministic persistence,
 * theme management, and active screen routing.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  AppState,
  Topic,
  Subject,
  WeeklyTest,
  ErrorLogEntry,
  UserSettings,
  ActiveView,
  RecallRating,
  ReviewScheduleItem,
} from '../types';
import {
  loadPersistedState,
  savePersistedState,
  generateInitialDemoData,
  exportDataAsJSON,
  validateAndParseImportJSON,
  DEFAULT_SUBJECTS,
  DEFAULT_SETTINGS,
} from '../services/storage';
import {
  generateSchedule,
  recalculateScheduleOnDateChange,
  refreshReviewStatuses,
  applyAdaptiveAdjustment,
  getTodayDateString,
} from '../utils/scheduler';
import { calculateTopicMastery } from '../utils/mastery';
import { calculateStreak, StreakInfo } from '../utils/streak';

interface AppContextType {
  state: AppState;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  // Modals & Active Drilldown State
  isAddTopicOpen: boolean;
  setIsAddTopicOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  reviewingTopic: { topic: Topic; stepIndex: number } | null;
  startReviewSession: (topicId: string, stepIndex?: number) => void;
  closeReviewSession: () => void;
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  selectedCalendarDate: string;
  setSelectedCalendarDate: (dateStr: string) => void;
  // Data Mutations
  addTopic: (
    topicData: {
      subjectId: string;
      chapterName: string;
      title: string;
      studiedDate: string;
      estimatedDurationMinutes: number;
      difficulty: 'easy' | 'moderate' | 'difficult';
      notes: string;
    }
  ) => Topic;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;
  completeReview: (
    topicId: string,
    stepIndex: number,
    rating: RecallRating,
    recallNotes?: string
  ) => void;
  skipReview: (topicId: string, stepIndex: number) => void;
  addWeeklyTest: (test: Omit<WeeklyTest, 'id' | 'createdAt'>) => void;
  deleteWeeklyTest: (id: string) => void;
  addErrorLog: (entry: Omit<ErrorLogEntry, 'id' | 'createdAt'>) => void;
  toggleErrorResolved: (id: string) => void;
  deleteErrorLog: (id: string) => void;
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  recordDailyCheckin: () => void;
  // Backup / Reset / Demo Management
  loadDemoData: () => void;
  purgeDemoData: () => void;
  exportData: () => void;
  importData: (jsonStr: string) => boolean;
  clearAllData: () => void;
  // Aggregated Helper Queries
  todayReviewsDue: { topic: Topic; item: ReviewScheduleItem }[];
  todayCompletedReviews: { topic: Topic; item: ReviewScheduleItem }[];
  overdueReviews: { topic: Topic; item: ReviewScheduleItem }[];
  weeklyTestsDue: Topic[];
  topicsNeedingAttention: Topic[];
  streakInfo: StreakInfo;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const loaded = loadPersistedState();
    // Refresh dynamic overdue statuses on mount based on today's calendar date
    const today = getTodayDateString();
    const updatedTopics = loaded.topics.map((t) => ({
      ...t,
      schedule: refreshReviewStatuses(t.schedule, today),
    }));
    return { ...loaded, topics: updatedTopics };
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>(state.settings.theme || 'dark');
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reviewingTopic, setReviewingTopic] = useState<{ topic: Topic; stepIndex: number } | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(getTodayDateString());

  // Synchronize HTML theme class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  // Persist state whenever it changes
  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      setState((s) => ({
        ...s,
        settings: { ...s.settings, theme: next },
      }));
      return next;
    });
  }, []);

  // Update Settings
  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
    if (updates.theme) {
      setTheme(updates.theme);
    }
  }, []);

  // Add a new topic
  const addTopic = useCallback(
    (topicData: {
      subjectId: string;
      chapterName: string;
      title: string;
      studiedDate: string;
      estimatedDurationMinutes: number;
      difficulty: 'easy' | 'moderate' | 'difficult';
      notes: string;
    }): Topic => {
      const topicId = `topic_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const intervals = state.settings.revisionIntervals || [0, 2, 4, 6, 13, 20, 27];
      const initialSchedule = generateSchedule(topicId, topicData.studiedDate, intervals);

      const newTopic: Topic = {
        id: topicId,
        subjectId: topicData.subjectId,
        chapterName: topicData.chapterName.trim(),
        title: topicData.title.trim(),
        studiedDate: topicData.studiedDate,
        estimatedDurationMinutes: topicData.estimatedDurationMinutes || 20,
        difficulty: topicData.difficulty,
        notes: topicData.notes || '',
        mastery: 'new',
        masteryScore: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        schedule: initialSchedule,
      };

      const masteryCalc = calculateTopicMastery(newTopic);
      newTopic.mastery = masteryCalc.level;
      newTopic.masteryScore = masteryCalc.score;

      setState((prev) => {
        const history = prev.studyDaysHistory || [];
        const updatedHistory = history.includes(topicData.studiedDate)
          ? history
          : [...history, topicData.studiedDate];
        return {
          ...prev,
          topics: [newTopic, ...prev.topics],
          studyDaysHistory: updatedHistory,
          isDemoData: false, // User added real data
        };
      });

      return newTopic;
    },
    [state.settings.revisionIntervals]
  );

  // Update topic
  const updateTopic = useCallback((id: string, updates: Partial<Topic>) => {
    setState((prev) => {
      const targetTopic = prev.topics.find((t) => t.id === id);
      if (!targetTopic) return prev;

      let updatedSchedule = targetTopic.schedule;
      // If studiedDate changed, recalculate schedule preserving completed reviews
      if (updates.studiedDate && updates.studiedDate !== targetTopic.studiedDate) {
        updatedSchedule = recalculateScheduleOnDateChange(
          targetTopic.schedule,
          updates.studiedDate,
          prev.settings.revisionIntervals
        );
      }

      const mergedTopic: Topic = {
        ...targetTopic,
        ...updates,
        schedule: updatedSchedule,
        updatedAt: new Date().toISOString(),
      };

      const masteryCalc = calculateTopicMastery(mergedTopic);
      mergedTopic.mastery = masteryCalc.level;
      mergedTopic.masteryScore = masteryCalc.score;

      return {
        ...prev,
        topics: prev.topics.map((t) => (t.id === id ? mergedTopic : t)),
      };
    });
  }, []);

  // Delete topic
  const deleteTopic = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      topics: prev.topics.filter((t) => t.id !== id),
      errorLogs: prev.errorLogs.filter((e) => e.topicId !== id),
    }));
  }, []);

  // Complete review session
  const completeReview = useCallback(
    (topicId: string, stepIndex: number, rating: RecallRating, recallNotes?: string) => {
      const today = getTodayDateString();

      setState((prev) => {
        const topic = prev.topics.find((t) => t.id === topicId);
        if (!topic) return prev;

        const updatedSchedule = topic.schedule.map((item) => {
          if (item.stepIndex === stepIndex) {
            return {
              ...item,
              status: 'completed' as const,
              completedDate: today,
              confidenceRating: rating,
              userRecallNotes: recallNotes || item.userRecallNotes,
              completedAtTimestamp: new Date().toISOString(),
            };
          }
          return item;
        });

        // Apply adaptive adjustment (e.g. earlier review if hard)
        const adjustedSchedule = applyAdaptiveAdjustment(updatedSchedule, stepIndex, rating, today);

        const updatedTopic: Topic = {
          ...topic,
          schedule: adjustedSchedule,
          updatedAt: new Date().toISOString(),
        };

        const unresolvedErrors = prev.errorLogs.filter(
          (e) => e.topicId === topicId && !e.resolved
        ).length;
        const masteryCalc = calculateTopicMastery(updatedTopic, unresolvedErrors);
        updatedTopic.mastery = masteryCalc.level;
        updatedTopic.masteryScore = masteryCalc.score;

        const history = prev.studyDaysHistory || [];
        const updatedHistory = history.includes(today) ? history : [...history, today];

        return {
          ...prev,
          topics: prev.topics.map((t) => (t.id === topicId ? updatedTopic : t)),
          studyDaysHistory: updatedHistory,
        };
      });

      setReviewingTopic(null);
    },
    []
  );

  // Skip a review
  const skipReview = useCallback((topicId: string, stepIndex: number) => {
    setState((prev) => {
      const topic = prev.topics.find((t) => t.id === topicId);
      if (!topic) return prev;

      const updatedSchedule = topic.schedule.map((item) => {
        if (item.stepIndex === stepIndex) {
          return {
            ...item,
            status: 'skipped' as const,
            completedAtTimestamp: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...prev,
        topics: prev.topics.map((t) => (t.id === topicId ? { ...t, schedule: updatedSchedule } : t)),
      };
    });
  }, []);

  // Weekly Test Actions
  const addWeeklyTest = useCallback((test: Omit<WeeklyTest, 'id' | 'createdAt'>) => {
    const newTest: WeeklyTest = {
      ...test,
      id: `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setState((prev) => {
      const history = prev.studyDaysHistory || [];
      const updatedHistory = history.includes(test.date) ? history : [...history, test.date];
      return {
        ...prev,
        weeklyTests: [newTest, ...prev.weeklyTests],
        studyDaysHistory: updatedHistory,
      };
    });
  }, []);

  const deleteWeeklyTest = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      weeklyTests: prev.weeklyTests.filter((t) => t.id !== id),
    }));
  }, []);

  // Error Log Actions
  const addErrorLog = useCallback((entry: Omit<ErrorLogEntry, 'id' | 'createdAt'>) => {
    const newError: ErrorLogEntry = {
      ...entry,
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => {
      // Re-evaluate topic mastery if linked
      let updatedTopics = prev.topics;
      if (entry.topicId) {
        updatedTopics = prev.topics.map((t) => {
          if (t.id === entry.topicId) {
            const currentErrors = prev.errorLogs.filter((e) => e.topicId === t.id && !e.resolved).length + 1;
            const mastery = calculateTopicMastery(t, currentErrors);
            return { ...t, mastery: mastery.level, masteryScore: mastery.score };
          }
          return t;
        });
      }

      return {
        ...prev,
        topics: updatedTopics,
        errorLogs: [newError, ...prev.errorLogs],
      };
    });
  }, []);

  const toggleErrorResolved = useCallback((id: string) => {
    setState((prev) => {
      const entry = prev.errorLogs.find((e) => e.id === id);
      if (!entry) return prev;
      const nextResolved = !entry.resolved;

      const updatedLogs = prev.errorLogs.map((e) =>
        e.id === id ? { ...e, resolved: nextResolved } : e
      );

      // Refresh linked topic mastery
      let updatedTopics = prev.topics;
      if (entry.topicId) {
        updatedTopics = prev.topics.map((t) => {
          if (t.id === entry.topicId) {
            const count = updatedLogs.filter((e) => e.topicId === t.id && !e.resolved).length;
            const mastery = calculateTopicMastery(t, count);
            return { ...t, mastery: mastery.level, masteryScore: mastery.score };
          }
          return t;
        });
      }

      return {
        ...prev,
        topics: updatedTopics,
        errorLogs: updatedLogs,
      };
    });
  }, []);

  const deleteErrorLog = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      errorLogs: prev.errorLogs.filter((e) => e.id !== id),
    }));
  }, []);

  // Subject Actions
  const addSubject = useCallback((subject: Omit<Subject, 'id'>) => {
    const newSubj: Subject = {
      ...subject,
      id: `subj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    setState((prev) => ({
      ...prev,
      subjects: [...prev.subjects, newSubj],
    }));
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      topics: prev.topics.filter((t) => t.subjectId !== id),
      errorLogs: prev.errorLogs.filter((e) => e.subjectId !== id),
    }));
  }, []);

  // Demo & Reset Management
  const loadDemoData = useCallback(() => {
    const demo = generateInitialDemoData();
    setState(demo);
  }, []);

  const purgeDemoData = useCallback(() => {
    setState((prev) => {
      const clean = {
        ...prev,
        topics: [],
        weeklyTests: [],
        errorLogs: [],
        studyDaysHistory: [],
        isDemoData: false,
      };
      savePersistedState(clean);
      return clean;
    });
  }, []);

  const exportData = useCallback(() => {
    exportDataAsJSON(state);
  }, [state]);

  const importData = useCallback((jsonStr: string): boolean => {
    const parsed = validateAndParseImportJSON(jsonStr);
    if (parsed) {
      setState(parsed);
      return true;
    }
    return false;
  }, []);

  const clearAllData = useCallback(() => {
    const cleanState: AppState = {
      subjects: DEFAULT_SUBJECTS,
      topics: [],
      weeklyTests: [],
      errorLogs: [],
      settings: DEFAULT_SETTINGS,
      isDemoData: false,
      studyDaysHistory: [],
    };
    setState(cleanState);
  }, []);

  // Active review start
  const startReviewSession = useCallback(
    (topicId: string, stepIndex?: number) => {
      const topic = state.topics.find((t) => t.id === topicId);
      if (!topic) return;

      const today = getTodayDateString();
      let targetIndex = stepIndex;

      if (targetIndex === undefined) {
        // Find first due or overdue step, or first uncompleted step
        const dueStep = topic.schedule.find(
          (s) =>
            s.status !== 'completed' &&
            s.status !== 'skipped' &&
            (s.scheduledDate <= today || s.status === 'overdue')
        );
        targetIndex = dueStep ? dueStep.stepIndex : 1;
      }

      setReviewingTopic({ topic, stepIndex: targetIndex });
    },
    [state.topics]
  );

  const closeReviewSession = useCallback(() => {
    setReviewingTopic(null);
  }, []);

  // Aggregated Queries for Dashboard & Views
  const today = getTodayDateString();

  const todayReviewsDue = useMemo(() => {
    const results: { topic: Topic; item: ReviewScheduleItem }[] = [];
    state.topics.forEach((topic) => {
      topic.schedule.forEach((item) => {
        // Due today or overdue, excluding step 0 (Learn) if it's already logged
        if (
          item.stepIndex > 0 &&
          (item.status === 'scheduled' || item.status === 'overdue') &&
          item.scheduledDate <= today
        ) {
          results.push({ topic, item });
        }
      });
    });
    // Sort overdue first, then by earliest scheduled date
    return results.sort((a, b) => a.item.scheduledDate.localeCompare(b.item.scheduledDate));
  }, [state.topics, today]);

  const todayCompletedReviews = useMemo(() => {
    const results: { topic: Topic; item: ReviewScheduleItem }[] = [];
    state.topics.forEach((topic) => {
      topic.schedule.forEach((item) => {
        if (item.status === 'completed' && item.completedDate === today && item.stepIndex > 0) {
          results.push({ topic, item });
        }
      });
    });
    return results;
  }, [state.topics, today]);

  const overdueReviews = useMemo(() => {
    const results: { topic: Topic; item: ReviewScheduleItem }[] = [];
    state.topics.forEach((topic) => {
      topic.schedule.forEach((item) => {
        if (item.status === 'overdue' && item.stepIndex > 0) {
          results.push({ topic, item });
        }
      });
    });
    return results;
  }, [state.topics]);

  const weeklyTestsDue = useMemo(() => {
    return state.topics.filter((t) => {
      const step3 = t.schedule.find((s) => s.stepIndex === 3);
      return step3 && (step3.status === 'scheduled' || step3.status === 'overdue') && step3.scheduledDate <= today;
    });
  }, [state.topics, today]);

  const topicsNeedingAttention = useMemo(() => {
    // Topics with unresolved error logs OR rated 'hard' in recent reviews
    const errorTopicIds = new Set(
      state.errorLogs.filter((e) => !e.resolved && e.topicId).map((e) => e.topicId as string)
    );
    return state.topics.filter((t) => {
      if (errorTopicIds.has(t.id)) return true;
      const lastReview = [...t.schedule].reverse().find((s) => s.status === 'completed');
      if (lastReview && lastReview.confidenceRating === 'hard') return true;
      return t.mastery === 'learning' && t.schedule.filter((s) => s.status === 'completed').length > 2;
    });
  }, [state.topics, state.errorLogs]);

  const streakInfo = useMemo(() => {
    return calculateStreak(state, today);
  }, [state, today]);

  const recordDailyCheckin = useCallback(() => {
    setState((prev) => {
      const history = prev.studyDaysHistory || [];
      if (history.includes(today)) return prev;
      return {
        ...prev,
        studyDaysHistory: [...history, today],
      };
    });
  }, [today]);

  const value = {
    state,
    activeView,
    setActiveView,
    theme,
    toggleTheme,
    isAddTopicOpen,
    setIsAddTopicOpen,
    isSearchOpen,
    setIsSearchOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    reviewingTopic,
    startReviewSession,
    closeReviewSession,
    selectedSubjectId,
    setSelectedSubjectId,
    selectedCalendarDate,
    setSelectedCalendarDate,
    addTopic,
    updateTopic,
    deleteTopic,
    completeReview,
    skipReview,
    addWeeklyTest,
    deleteWeeklyTest,
    addErrorLog,
    toggleErrorResolved,
    deleteErrorLog,
    addSubject,
    updateSubject,
    deleteSubject,
    updateSettings,
    recordDailyCheckin,
    loadDemoData,
    purgeDemoData,
    exportData,
    importData,
    clearAllData,
    todayReviewsDue,
    todayCompletedReviews,
    overdueReviews,
    weeklyTestsDue,
    topicsNeedingAttention,
    streakInfo,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
