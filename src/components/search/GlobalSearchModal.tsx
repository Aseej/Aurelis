import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { Search, X, ArrowRight } from 'lucide-react';
import { formatDisplayDate } from '../../utils/scheduler';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    state,
    startReviewSession,
    setActiveView,
  } = useApp();
  const { t, formatDate } = useI18n();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  // Search Results across Topics, Notes, Chapters, Mistakes
  const results = useMemo(() => {
    if (!query.trim()) return { topics: [], errors: [] };
    const q = query.toLowerCase();

    const matchingTopics = state.topics.filter(
      (topic) =>
        !topic.isArchived &&
        (topic.title.toLowerCase().includes(q) ||
          topic.chapterName.toLowerCase().includes(q) ||
          topic.notes.toLowerCase().includes(q))
    );

    const matchingErrors = state.errorLogs.filter(
      (e) =>
        e.questionOrProblem.toLowerCase().includes(q) ||
        e.mistakeDescription.toLowerCase().includes(q) ||
        e.correctMethod.toLowerCase().includes(q) ||
        e.topicTitle.toLowerCase().includes(q)
    );

    return { topics: matchingTopics, errors: matchingErrors };
  }, [query, state.topics, state.errorLogs]);

  if (!isSearchOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-16 sm:pt-24"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl glass-premium shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-white/20 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-black/[0.06] px-4.5 py-3.5 dark:border-white/[0.08]">
          <Search className="h-4 w-4 text-[#858A93] dark:text-[#777F8C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={t('search.placeholder', 'Search topics, subjects, chapters, notes, errors... (⌘K)')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#20232A] placeholder-[#858A93] focus:outline-none dark:text-[#F6F3EC] dark:placeholder-[#777F8C]"
          />
          <kbd className="hidden sm:inline-block rounded-lg border border-black/[0.08] bg-black/[0.03] px-2 py-0.5 text-[10px] font-mono text-[#858A93] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#777F8C]">
            ESC
          </kbd>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="rounded-lg p-1 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-10 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
              {t('search.noQuery', 'Type keywords to search across topics, chapters, formulas, and errors.')}
            </div>
          ) : results.topics.length === 0 && results.errors.length === 0 ? (
            <div className="py-10 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
              {t('search.noResults', 'No matching topics, subjects, or errors found.')}
            </div>
          ) : (
            <>
              {/* Topics Results */}
              {results.topics.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                    {t('search.topicsCategory', 'Topics')} ({results.topics.length})
                  </div>
                  {results.topics.map((topicItem) => {
                    const subj = state.subjects.find((s) => s.id === topicItem.subjectId);
                    return (
                      <div
                        key={topicItem.id}
                        onClick={() => {
                          startReviewSession(topicItem.id);
                          setIsSearchOpen(false);
                        }}
                        className="group flex cursor-pointer items-center justify-between rounded-2xl p-3 transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="font-semibold text-[#20232A] dark:text-[#F6F3EC] truncate group-hover:text-[#A97B32] dark:group-hover:text-[#E6C27A]">
                            {topicItem.title}
                          </div>
                          <div className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                            <span style={{ color: subj?.color }}>{subj?.name}</span> · {topicItem.chapterName}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[#A97B32] dark:text-[#E6C27A] shrink-0">
                          <span>{t('subjects.revise', 'Review')}</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Error Notebook Results */}
              {results.errors.length > 0 && (
                <div className="space-y-1 border-t border-black/[0.06] pt-2 dark:border-white/[0.08]">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
                    {t('search.errorsCategory', 'Error Notebook')} ({results.errors.length})
                  </div>
                  {results.errors.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setActiveView('errors');
                        setIsSearchOpen(false);
                      }}
                      className="group flex cursor-pointer items-center justify-between rounded-2xl p-3 transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-semibold text-[#20232A] dark:text-[#F6F3EC] truncate group-hover:text-[#A97B32] dark:group-hover:text-[#E6C27A]">
                          {e.questionOrProblem}
                        </div>
                        <div className="text-[11px] text-[#F87171] line-clamp-1">
                          {t('errors.whyHappened', 'Trap')}: {e.mistakeDescription}
                        </div>
                      </div>

                      <span className="text-[10px] text-[#858A93] dark:text-[#777F8C] font-mono shrink-0">
                        {formatDate(e.date, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
