import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getTodayDateString,
  getDueReasonExplanation,
} from '../../utils/scheduler';
import { Play, Check, Clock, AlertTriangle, Filter, Search, Sparkles } from 'lucide-react';

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
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
          Spaced Repetition Queue
        </h1>
        <p className="text-xs text-[#858A93] dark:text-[#777F8C] mt-0.5">
          Scan and complete scheduled active-recall repetitions across all subjects
        </p>
      </div>

      {/* Filter and Status Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-2xl glass-subtle p-3 text-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#858A93] dark:text-[#777F8C]" />
          <input
            type="text"
            placeholder="Search queue by topic or chapter..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-xl border border-black/[0.08] bg-white/70 pl-8.5 pr-3 py-1.5 text-xs text-[#20232A] focus:outline-none focus:border-[#E6C27A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC] dark:focus:border-[#E6C27A]"
          />
        </div>

        {/* Subject Filter */}
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded-xl border border-black/[0.08] bg-white/70 px-3 py-1.5 text-[#20232A] focus:outline-none focus:border-[#E6C27A] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC]"
        >
          <option value="all">All Subjects</option>
          {state.subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Status Segmented Control */}
        <div className="flex rounded-xl border border-black/[0.08] bg-black/[0.03] p-0.5 dark:border-white/[0.08] dark:bg-white/[0.03]">
          {(['due', 'overdue', 'upcoming', 'completed', 'all'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium capitalize transition-all ${
                selectedStatus === st
                  ? 'bg-white text-[#20232A] shadow-xs dark:bg-white/[0.12] dark:text-[#FFE6AD] font-semibold'
                  : 'text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
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
          <div className="rounded-2xl glass-subtle border border-dashed border-black/[0.1] dark:border-white/[0.1] p-12 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
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
                className={`rounded-2xl p-4 transition-all ${
                  isOverdue
                    ? 'glass-premium border border-[#F87171]/40'
                    : isCompleted
                    ? 'glass-subtle opacity-75'
                    : 'glass-subtle hover:border-[#E6C27A]/40'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#686D77] dark:text-[#A7ABB5]">
                      <span
                        className="font-semibold uppercase tracking-wider text-[11px]"
                        style={{ color: subject.color }}
                      >
                        {subject.name}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{topic.chapterName}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[#858A93] dark:text-[#777F8C]">
                        {item.stageName} (Step {item.stepIndex + 1}/7)
                      </span>
                      {isOverdue && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#F87171] font-semibold">Overdue</span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[#20232A] dark:text-[#F6F3EC] truncate">
                      {topic.title}
                    </h3>

                    <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                      {reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {!isCompleted ? (
                      <button
                        onClick={() => startReviewSession(topic.id, item.stepIndex)}
                        className="btn-gold-primary flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold shadow-xs transition-all active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Start Review</span>
                      </button>
                    ) : (
                      <div className="text-right text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Completed</span>
                        <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] font-mono">
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
