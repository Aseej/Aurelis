import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getTodayDateString,
  formatDisplayDate,
  getDueReasonExplanation,
} from '../../utils/scheduler';
import { Play, Check, Clock, AlertTriangle, Filter, Search, RotateCcw } from 'lucide-react';

export const RevisionQueueView: React.FC = () => {
  const { state, startReviewSession, todayReviewsDue, overdueReviews } = useApp();

  const todayStr = getTodayDateString();

  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'due' | 'overdue' | 'completed' | 'upcoming'>('due');
  const [searchFilter, setSearchFilter] = useState('');

  // Collect all schedule items across topics
  const allQueueItems = useMemo(() => {
    const list: {
      topic: (typeof state.topics)[0];
      item: (typeof state.topics)[0]['schedule'][0];
    }[] = [];

    state.topics.forEach((topic) => {
      topic.schedule.forEach((item) => {
        if (item.stepIndex === 0) return; // skip initial learn session

        if (selectedSubject !== 'all' && topic.subjectId !== selectedSubject) return;

        const isOverdue = item.status === 'overdue';
        const isCompleted = item.status === 'completed';
        const isDue =
          !isCompleted &&
          (item.scheduledDate <= todayStr || isOverdue);
        const isUpcoming = !isCompleted && !isOverdue && item.scheduledDate > todayStr;

        if (selectedStatus === 'due' && !isDue) return;
        if (selectedStatus === 'overdue' && !isOverdue) return;
        if (selectedStatus === 'completed' && !isCompleted) return;
        if (selectedStatus === 'upcoming' && !isUpcoming) return;

        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase();
          const match =
            topic.title.toLowerCase().includes(q) ||
            topic.chapterName.toLowerCase().includes(q);
          if (!match) return;
        }

        list.push({ topic, item });
      });
    });

    // Sort: overdue first, then scheduledDate ascending
    return list.sort((a, b) => a.item.scheduledDate.localeCompare(b.item.scheduledDate));
  }, [state.topics, selectedSubject, selectedStatus, searchFilter, todayStr]);

  const subjectMap = useMemo(() => {
    const map = new Map<string, { name: string; color: string }>();
    state.subjects.forEach((s) => map.set(s.id, { name: s.name, color: s.color }));
    return map;
  }, [state.subjects]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
          Spaced Repetition Queue
        </h1>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Complete spaced repetitions across all subjects and chapters
        </p>
      </div>

      {/* Filter and Status Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-xl border border-neutral-200/90 bg-white p-3 dark:border-neutral-800/90 dark:bg-[#111216] text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Filter queue by topic or chapter..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 pl-8 pr-3 py-1.5 text-xs text-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <option value="all">All Subjects</option>
          {state.subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Status Segmented Control */}
        <div className="flex rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700">
          {(['due', 'overdue', 'upcoming', 'completed', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded px-2.5 py-1 text-[11px] font-medium capitalize transition-colors ${
                selectedStatus === st
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-3">
        {allQueueItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-12 text-center text-xs text-neutral-400 dark:border-neutral-800">
            No revision items match your active filter.
          </div>
        ) : (
          allQueueItems.map(({ topic, item }) => {
            const subject = subjectMap.get(topic.subjectId) || {
              name: 'General',
              color: '#d4af37',
            };
            const isCompleted = item.status === 'completed';
            const isOverdue = item.status === 'overdue';
            const reason = getDueReasonExplanation(item, topic.studiedDate, todayStr);

            return (
              <div
                key={item.id}
                className={`rounded-xl border bg-white p-4 transition-all dark:bg-[#111216] ${
                  isOverdue
                    ? 'border-rose-300 dark:border-rose-900/50'
                    : isCompleted
                    ? 'border-neutral-200/60 opacity-80 dark:border-neutral-800/60'
                    : 'border-neutral-200/90 dark:border-neutral-800/90 hover:border-neutral-400 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span
                        className="font-semibold uppercase tracking-wider text-[11px]"
                        style={{ color: subject.color }}
                      >
                        {subject.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{topic.chapterName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">
                        {item.stageName} (Step {item.stepIndex + 1}/7)
                      </span>
                      {isOverdue && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-rose-500 font-semibold">Overdue</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {!isCompleted ? (
                      <button
                        onClick={() => startReviewSession(topic.id, item.stepIndex)}
                        className="flex h-9 items-center gap-2 rounded-lg bg-neutral-900 px-3.5 text-xs font-semibold text-amber-300 shadow-sm transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Start Review</span>
                      </button>
                    ) : (
                      <div className="text-right text-xs">
                        <span className="text-emerald-500 font-medium">Completed</span>
                        <div className="text-[10px] text-neutral-400">
                          Recall: {item.confidenceRating || 'Logged'}
                        </div>
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
