import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  getTodayDateString,
  getDueReasonExplanation,
  differenceInCalendarDays,
} from '../../utils/scheduler';
import {
  Play,
  Check,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
} from 'lucide-react';
import { RecallRating } from '../../types';

export const RevisionQueueView: React.FC = () => {
  const {
    state,
    activeSubjects,
    startReviewSession,
    completeReview,
    todayReviewsDue,
    overdueReviews,
    setIsAddTopicOpen,
  } = useApp();
  const { t } = useI18n();

  const todayStr = getTodayDateString();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'due' | 'overdue' | 'upcoming' | 'completed' | 'all'>('due');
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [quickCompleteTopicId, setQuickCompleteTopicId] = useState<string | null>(null);

  const activeSubjectIds = useMemo(() => new Set(activeSubjects.map((s) => s.id)), [activeSubjects]);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    state.subjects.forEach((s) => map.set(s.id, { name: s.name, color: s.color }));
    return map;
  }, [state.subjects]);

  // Extract all review items with their topic context
  const allRawItems = useMemo(() => {
    const list: {
      topic: (typeof state.topics)[0];
      item: (typeof state.topics)[0]['schedule'][0];
    }[] = [];

    state.topics.forEach((topic) => {
      if (topic.isArchived || !activeSubjectIds.has(topic.subjectId)) return;

      topic.schedule.forEach((item) => {
        if (item.stepIndex === 0) return; // skip initial learn session (Day 1)
        list.push({ topic, item });
      });
    });

    return list;
  }, [state.topics, activeSubjectIds]);

  // Aggregate counts for KPI ribbon & filter badges
  const counts = useMemo(() => {
    let dueCount = 0;
    let overdueCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    allRawItems.forEach(({ item }) => {
      const isCompleted = item.status === 'completed';
      const isOverdue = item.status === 'overdue';
      const isDue = !isCompleted && (item.scheduledDate <= todayStr || isOverdue);
      const isUpcoming = !isCompleted && !isOverdue && item.scheduledDate > todayStr;

      if (isDue) dueCount++;
      if (isOverdue) overdueCount++;
      if (isUpcoming) upcomingCount++;
      if (isCompleted) completedCount++;
    });

    return {
      due: dueCount,
      overdue: overdueCount,
      upcoming: upcomingCount,
      completed: completedCount,
      all: allRawItems.length,
    };
  }, [allRawItems, todayStr]);

  // Filtered list based on active filters and search
  const filteredQueueItems = useMemo(() => {
    return allRawItems.filter(({ topic, item }) => {
      if (selectedSubject !== 'all' && topic.subjectId !== selectedSubject) return false;

      const isCompleted = item.status === 'completed';
      const isOverdue = item.status === 'overdue';
      const isDue = !isCompleted && (item.scheduledDate <= todayStr || isOverdue);
      const isUpcoming = !isCompleted && !isOverdue && item.scheduledDate > todayStr;

      if (selectedStatus === 'due' && !isDue) return false;
      if (selectedStatus === 'overdue' && !isOverdue) return false;
      if (selectedStatus === 'upcoming' && !isUpcoming) return false;
      if (selectedStatus === 'completed' && !isCompleted) return false;

      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase();
        const match =
          topic.title.toLowerCase().includes(q) ||
          topic.chapterName.toLowerCase().includes(q) ||
          (topic.notes && topic.notes.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    }).sort((a, b) => {
      // Overdue first, then by scheduledDate ascending
      if (a.item.status === 'overdue' && b.item.status !== 'overdue') return -1;
      if (b.item.status === 'overdue' && a.item.status !== 'overdue') return 1;
      return a.item.scheduledDate.localeCompare(b.item.scheduledDate);
    });
  }, [allRawItems, selectedSubject, selectedStatus, searchFilter, todayStr]);

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickComplete = (topicId: string, stepIndex: number, rating: RecallRating) => {
    completeReview(topicId, stepIndex, rating);
    setQuickCompleteTopicId(null);
  };

  // Find first due item for "Start Daily Queue"
  const firstDueItem = useMemo(() => {
    const dueItem = allRawItems.find(({ item }) => {
      const isCompleted = item.status === 'completed';
      return !isCompleted && (item.scheduledDate <= todayStr || item.status === 'overdue');
    });
    return dueItem;
  }, [allRawItems, todayStr]);

  return (
    <div className="space-y-6 pb-16">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
            {t('queue.title', 'Spaced Repetition Queue')}
          </h1>
          <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#777F8C] mt-1 max-w-2xl">
            {t('queue.subtitle', 'Automated 7-stage recall engine based on the Ebbinghaus forgetting curve')}
          </p>
        </div>

        {/* Primary Action Button */}
        {firstDueItem ? (
          <button
            onClick={() => startReviewSession(firstDueItem.topic.id, firstDueItem.item.stepIndex)}
            className="btn-gold-primary self-start sm:self-auto flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-md active:scale-95 transition-all"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{t('dashboard.continueSession', 'Start Daily Queue')}</span>
            <span className="ml-1 rounded-full bg-black/10 dark:bg-black/20 px-2 py-0.5 text-[11px] font-mono">
              {counts.due}
            </span>
          </button>
        ) : (
          <div className="self-start sm:self-auto flex items-center gap-2 rounded-2xl glass-subtle px-4 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="h-4 w-4" />
            <span>{t('dashboard.noReviewsDue', 'All caught up today')}</span>
          </div>
        )}
      </div>

      {/* 2. Interactive KPI Ribbon / Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Due Today */}
        <button
          onClick={() => setSelectedStatus('due')}
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all text-left ${
            selectedStatus === 'due'
              ? 'glass-premium border-2 border-[#E6C27A] shadow-md dark:border-[#E6C27A]'
              : 'glass-subtle hover:border-[#E6C27A]/30'
          }`}
        >
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              {t('queue.dueToday', 'Due Today')}
            </div>
            <div className="text-2xl font-mono font-bold text-[#20232A] dark:text-[#F6F3EC]">
              {counts.due}
            </div>
          </div>
          <div className={`p-2.5 rounded-xl ${
            counts.due > 0
              ? 'bg-[#E6C27A]/20 text-[#996E25] dark:text-[#E6C27A]'
              : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#858A93]'
          }`}>
            <Clock className="h-4 w-4" />
          </div>
        </button>

        {/* Overdue */}
        <button
          onClick={() => setSelectedStatus('overdue')}
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all text-left ${
            selectedStatus === 'overdue'
              ? 'glass-premium border-2 border-[#F87171] shadow-md dark:border-[#F87171]'
              : 'glass-subtle hover:border-[#F87171]/30'
          }`}
        >
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              {t('queue.overdue', 'Overdue')}
            </div>
            <div className="text-2xl font-mono font-bold text-[#F87171]">
              {counts.overdue}
            </div>
          </div>
          <div className={`p-2.5 rounded-xl ${
            counts.overdue > 0
              ? 'bg-[#F87171]/20 text-[#F87171]'
              : 'bg-black/[0.04] dark:bg-white/[0.04] text-[#858A93]'
          }`}>
            <AlertTriangle className="h-4 w-4" />
          </div>
        </button>

        {/* Upcoming */}
        <button
          onClick={() => setSelectedStatus('upcoming')}
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all text-left ${
            selectedStatus === 'upcoming'
              ? 'glass-premium border-2 border-sky-500 shadow-md dark:border-sky-400'
              : 'glass-subtle hover:border-sky-500/30'
          }`}
        >
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              {t('queue.upcoming', 'Upcoming')}
            </div>
            <div className="text-2xl font-mono font-bold text-[#20232A] dark:text-[#F6F3EC]">
              {counts.upcoming}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Calendar className="h-4 w-4" />
          </div>
        </button>

        {/* Completed */}
        <button
          onClick={() => setSelectedStatus('completed')}
          className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl transition-all text-left ${
            selectedStatus === 'completed'
              ? 'glass-premium border-2 border-emerald-500 shadow-md dark:border-emerald-400'
              : 'glass-subtle hover:border-emerald-500/30'
          }`}
        >
          <div className="space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              {t('queue.completed', 'Completed')}
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {counts.completed}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-4 w-4" />
          </div>
        </button>
      </div>

      {/* 3. Search and Subject Toolbar */}
      <div className="rounded-2xl glass-subtle p-3 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#858A93] dark:text-[#777F8C]" />
            <input
              type="text"
              placeholder={t('subjects.searchTopics', 'Search queue by topic, chapter, or keywords...')}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/70 pl-9 pr-9 py-2 text-xs sm:text-sm text-[#20232A] focus:outline-none focus:border-[#E6C27A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC] dark:focus:border-[#E6C27A]"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-2.5 text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC]"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Subject Filter Dropdown */}
          <div className="sm:w-64">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/70 px-3.5 py-2 text-xs sm:text-sm text-[#20232A] focus:outline-none focus:border-[#E6C27A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC]"
            >
              <option value="all">{t('subjects.filterBySubject', 'All Subjects')} ({activeSubjects.length})</option>
              {activeSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented Filter Tab Strip with smooth horizontal scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
          {(
            [
              { key: 'due', label: t('queue.dueToday', 'Due Today'), count: counts.due, alert: false },
              { key: 'overdue', label: t('queue.overdue', 'Overdue'), count: counts.overdue, alert: counts.overdue > 0 },
              { key: 'upcoming', label: t('queue.upcoming', 'Upcoming'), count: counts.upcoming, alert: false },
              { key: 'completed', label: t('queue.completed', 'Completed'), count: counts.completed, alert: false },
              { key: 'all', label: t('common.all', 'All'), count: counts.all, alert: false },
            ] as const
          ).map((tab) => {
            const isActive = selectedStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatus(tab.key)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all shrink-0 ${
                  isActive
                    ? 'bg-white text-[#20232A] shadow-xs dark:bg-white/[0.14] dark:text-[#FFE6AD] font-semibold'
                    : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono font-semibold ${
                    tab.alert
                      ? 'bg-[#F87171]/20 text-[#F87171]'
                      : isActive
                      ? 'bg-black/[0.08] text-[#20232A] dark:bg-white/[0.16] dark:text-[#FFE6AD]'
                      : 'bg-black/[0.04] text-[#858A93] dark:bg-white/[0.06] dark:text-[#777F8C]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Queue Items Stream */}
      <div className="space-y-3.5">
        {filteredQueueItems.length === 0 ? (
          <div className="rounded-3xl glass-subtle border border-dashed border-black/[0.12] dark:border-white/[0.12] p-10 sm:p-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E6C27A]/10 text-[#A97B32] dark:text-[#E6C27A] mb-3">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {selectedStatus === 'due' && counts.due === 0
                ? t('dashboard.noReviewsDue', 'No reviews due today! You are completely up to date.')
                : selectedStatus === 'overdue' && counts.overdue === 0
                ? 'No overdue reviews. Outstanding consistency!'
                : t('queue.emptyQueue', 'No topics in this review queue.')}
            </h3>
            <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-1 max-w-md mx-auto">
              {searchFilter
                ? `No topics matched your search for "${searchFilter}". Try clearing your search filter.`
                : t('queue.emptyQueueSub', 'Add new topics or check back tomorrow for upcoming intervals.')}
            </p>
            {searchFilter ? (
              <button
                onClick={() => setSearchFilter('')}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white/70 px-4 py-2 text-xs font-semibold text-[#20232A] hover:bg-white dark:border-white/[0.08] dark:bg-white/[0.06] dark:text-[#F6F3EC]"
              >
                Clear Search Filter
              </button>
            ) : (
              <button
                onClick={() => setIsAddTopicOpen(true)}
                className="btn-gold-primary mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold shadow-xs"
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>{t('subjects.addTopic', 'New Topic')}</span>
              </button>
            )}
          </div>
        ) : (
          filteredQueueItems.map(({ topic, item }) => {
            const subject = subjectMap.get(topic.subjectId) || {
              name: 'General',
              color: '#d4af37',
            };
            const isCompleted = item.status === 'completed';
            const isOverdue = item.status === 'overdue';
            const isDueToday = !isCompleted && item.scheduledDate === todayStr;
            const daysDiff = differenceInCalendarDays(todayStr, item.scheduledDate);
            const reason = getDueReasonExplanation(item, topic.studiedDate, todayStr);
            const isNotesOpen = !!expandedNotes[item.id];
            const isQuickOpen = quickCompleteTopicId === item.id;

            return (
              <div
                key={item.id}
                className={`group rounded-2xl sm:rounded-3xl p-4 sm:p-5 transition-all ${
                  isOverdue
                    ? 'glass-premium border border-[#F87171]/40 shadow-xs'
                    : isDueToday
                    ? 'glass-premium border border-[#E6C27A]/40 shadow-xs'
                    : isCompleted
                    ? 'glass-subtle opacity-80 hover:opacity-100'
                    : 'glass-subtle hover:border-[#E6C27A]/30'
                }`}
              >
                {/* Card Top Row: Subject kicker & temporal status pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#686D77] dark:text-[#A7ABB5]">
                    {/* Subject Pill with color indicator */}
                    <div className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[11px]">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: subject.color }}
                      />
                      <span style={{ color: subject.color }}>{subject.name}</span>
                    </div>

                    <span className="text-[#858A93] dark:text-[#777F8C]" aria-hidden="true">·</span>
                    <span className="truncate max-w-[180px] sm:max-w-xs">{topic.chapterName}</span>

                    <span className="text-[#858A93] dark:text-[#777F8C]" aria-hidden="true">·</span>
                    <span className="font-mono text-[11px] text-[#858A93] dark:text-[#777F8C]">
                      {t('topicModal.dateStudied', 'Studied')}: {topic.studiedDate}
                    </span>
                  </div>

                  {/* Status Indicator Badge */}
                  <div className="shrink-0">
                    {isOverdue ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#F87171]/15 text-[#F87171]">
                        <AlertTriangle className="h-3 w-3" />
                        <span>
                          {daysDiff > 0 ? `${daysDiff}d overdue` : t('common.overdue', 'Overdue')}
                        </span>
                      </span>
                    ) : isDueToday ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-[#E6C27A]/20 text-[#8C6221] dark:text-[#FFE6AD]">
                        <Clock className="h-3 w-3" />
                        <span>{t('queue.dueToday', 'Due Today')}</span>
                      </span>
                    ) : isCompleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <Check className="h-3 w-3" />
                        <span>{t('common.completed', 'Completed')}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-mono text-[#858A93] dark:text-[#777F8C] bg-black/[0.04] dark:bg-white/[0.04]">
                        <Calendar className="h-3 w-3" />
                        <span>{item.scheduledDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Title & Stage */}
                <div className="mt-2.5 space-y-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base sm:text-lg font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                      {topic.title}
                    </h3>
                    <span className="shrink-0 text-xs font-mono font-medium text-[#A97B32] dark:text-[#E6C27A]">
                      {item.stageName} ({t('queue.stageBadge', 'Step')} {item.stepIndex + 1}/7)
                    </span>
                  </div>

                  {/* Cognitive Ebbinghaus Explanation */}
                  <p className="text-xs text-[#858A93] dark:text-[#777F8C] leading-relaxed">
                    {reason}
                  </p>
                </div>

                {/* 7-Stage Visual Timeline Stepper */}
                <div className="mt-4 pt-3 border-t border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#858A93] dark:text-[#777F8C] mb-1.5">
                    <span className="uppercase tracking-wider">7-Stage Spaced Curve</span>
                    <span>
                      {topic.schedule.filter((s) => s.status === 'completed').length} of 7 steps mastered
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                    {topic.schedule.map((step) => {
                      const isStepCompleted = step.status === 'completed';
                      const isCurrentStep = step.stepIndex === item.stepIndex;
                      const isStepOverdue = step.status === 'overdue';

                      return (
                        <div
                          key={step.id}
                          title={`${step.stageName} (${step.scheduledDate}) - ${step.status}`}
                          className={`relative group/step flex flex-col items-center rounded-lg p-1 transition-all ${
                            isCurrentStep
                              ? isOverdue
                                ? 'bg-[#F87171]/20 ring-1 ring-[#F87171]'
                                : 'bg-[#E6C27A]/25 ring-1 ring-[#E6C27A]'
                              : isStepCompleted
                              ? 'bg-emerald-500/10 dark:bg-emerald-500/15'
                              : 'bg-black/[0.03] dark:bg-white/[0.03]'
                          }`}
                        >
                          <div className="flex items-center justify-center h-4 w-4 rounded-full text-[9px] font-bold">
                            {isStepCompleted ? (
                              <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 stroke-[3]" />
                            ) : isCurrentStep ? (
                              <span className={isStepOverdue ? 'text-[#F87171]' : 'text-[#8C6221] dark:text-[#FFE6AD]'}>
                                {step.stepIndex + 1}
                              </span>
                            ) : (
                              <span className="text-[#858A93] dark:text-[#777F8C] font-normal">
                                {step.stepIndex + 1}
                              </span>
                            )}
                          </div>
                          <span className="hidden sm:inline text-[9px] font-mono truncate w-full text-center mt-0.5 text-[#858A93] dark:text-[#777F8C]">
                            {step.stageName.replace('Revision ', 'R').replace('Weekly Test', 'Test').replace('Review ', 'Rev')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Expandable Topic Notes Preview */}
                {topic.notes && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleNotes(item.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>{isNotesOpen ? 'Hide Concept Notes' : 'View Concept Notes'}</span>
                      {isNotesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    {isNotesOpen && (
                      <div className="mt-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] p-3 text-xs text-[#4A505D] dark:text-[#A7ABB5] whitespace-pre-wrap font-sans border border-black/[0.04] dark:border-white/[0.04]">
                        {topic.notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Card Footer: Metadata and Action Controls */}
                <div className="mt-4 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-black/[0.05] dark:border-white/[0.05]">
                  <div className="flex items-center gap-3 text-xs text-[#858A93] dark:text-[#777F8C]">
                    <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                      <Clock className="h-3 w-3" />
                      {topic.estimatedDurationMinutes || 15} mins
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="capitalize text-[11px]">
                      {t(`topicModal.${topic.difficulty || 'moderate'}`, topic.difficulty || 'Moderate')}
                    </span>
                    {topic.mastery && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize text-[11px] font-medium text-[#A97B32] dark:text-[#E6C27A]">
                          {topic.mastery}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Actions Area */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {!isCompleted ? (
                      <>
                        {/* Quick Complete Dropdown Toggle */}
                        <div className="relative">
                          <button
                            onClick={() => setQuickCompleteTopicId(isQuickOpen ? null : item.id)}
                            title="Quick mark complete"
                            className="flex h-9 items-center gap-1.5 rounded-xl border border-black/[0.08] bg-white/70 dark:border-white/[0.08] dark:bg-white/[0.04] px-3 text-xs font-medium text-[#686D77] hover:text-[#20232A] dark:text-[#A7ABB5] dark:hover:text-[#F6F3EC] transition-all"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">{t('queue.markDone', 'Quick Log')}</span>
                            <ChevronDown className="h-3 w-3" />
                          </button>

                          {/* Quick Rating Popover */}
                          {isQuickOpen && (
                            <div className="absolute right-0 bottom-full mb-2 w-48 rounded-2xl glass-premium shadow-xl border border-white/20 dark:border-white/10 p-2 z-20 space-y-1">
                              <div className="text-[10px] uppercase font-mono tracking-wider px-2 py-1 text-[#858A93] dark:text-[#777F8C]">
                                {t('session.howEasilyRecalled', 'Recall Rating')}:
                              </div>
                              <button
                                onClick={() => handleQuickComplete(topic.id, item.stepIndex, 'easy')}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-between transition-colors"
                              >
                                <span>{t('session.ratingEasy', 'Mastered')}</span>
                                <span className="text-[10px] font-mono">🟢</span>
                              </button>
                              <button
                                onClick={() => handleQuickComplete(topic.id, item.stepIndex, 'okay')}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-[#E6C27A]/20 text-[#8C6221] dark:text-[#FFE6AD] flex items-center justify-between transition-colors"
                              >
                                <span>{t('session.ratingOkay', 'Satisfactory')}</span>
                                <span className="text-[10px] font-mono">🟡</span>
                              </button>
                              <button
                                onClick={() => handleQuickComplete(topic.id, item.stepIndex, 'hard')}
                                className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium hover:bg-[#F87171]/15 text-[#F87171] flex items-center justify-between transition-colors"
                              >
                                <span>{t('session.ratingHard', 'Strained')}</span>
                                <span className="text-[10px] font-mono">🔴</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Primary Start Active Recall Button */}
                        <button
                          onClick={() => startReviewSession(topic.id, item.stepIndex)}
                          className="btn-gold-primary flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all active:scale-95"
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          <span>{t('queue.startRecall', 'Start Recall')}</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{t('common.completed', 'Completed')}</span>
                        </span>
                        {item.confidenceRating && (
                          <span className="rounded-lg bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 text-[11px] font-mono font-medium text-[#686D77] dark:text-[#A7ABB5]">
                            Rating: {item.confidenceRating}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
