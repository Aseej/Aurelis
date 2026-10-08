import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, BookOpen, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { formatDisplayDate } from '../../utils/scheduler';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchOpen,
    setIsSearchOpen,
    state,
    startReviewSession,
    setSelectedSubjectId,
    setActiveView,
  } = useApp();

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
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.chapterName.toLowerCase().includes(q) ||
        t.notes.toLowerCase().includes(q)
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
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-xs p-4 pt-16 sm:pt-24"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="relative w-full max-w-xl rounded-2xl border border-neutral-200/90 bg-white shadow-2xl dark:border-neutral-800/90 dark:bg-[#0e0f14] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-neutral-200/80 px-4 py-3.5 dark:border-neutral-800/80">
          <Search className="h-4 w-4 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search topics, formulas, notes, or error log..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-neutral-100 dark:placeholder-neutral-500"
          />
          <kbd className="hidden sm:inline-block rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900">
            ESC
          </kbd>
          <button
            onClick={() => setIsSearchOpen(false)}
            className="rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {!query.trim() ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              Type keywords to search across subjects, chapters, notes, and mistakes.
            </div>
          ) : results.topics.length === 0 && results.errors.length === 0 ? (
            <div className="py-10 text-center text-xs text-neutral-400">
              No results found for "{query}".
            </div>
          ) : (
            <>
              {/* Topics Results */}
              {results.topics.length > 0 && (
                <div className="space-y-1">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Topics ({results.topics.length})
                  </div>
                  {results.topics.map((t) => {
                    const subj = state.subjects.find((s) => s.id === t.subjectId);
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          startReviewSession(t.id);
                          setIsSearchOpen(false);
                        }}
                        className="group flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-amber-500">
                            {t.title}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            <span style={{ color: subj?.color }}>{subj?.name}</span> · {t.chapterName}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 shrink-0">
                          <span>Review</span>
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Error Notebook Results */}
              {results.errors.length > 0 && (
                <div className="space-y-1 border-t border-neutral-100 pt-2 dark:border-neutral-800">
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Mistakes & Errors ({results.errors.length})
                  </div>
                  {results.errors.map((e) => (
                    <div
                      key={e.id}
                      onClick={() => {
                        setActiveView('errors');
                        setIsSearchOpen(false);
                      }}
                      className="group flex cursor-pointer items-center justify-between rounded-lg p-2.5 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
                    >
                      <div className="space-y-0.5 min-w-0 pr-2">
                        <div className="font-semibold text-neutral-900 dark:text-neutral-100 truncate group-hover:text-amber-500">
                          {e.questionOrProblem}
                        </div>
                        <div className="text-[11px] text-rose-500 line-clamp-1">
                          Trap: {e.mistakeDescription}
                        </div>
                      </div>

                      <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                        {formatDisplayDate(e.date, false)}
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
