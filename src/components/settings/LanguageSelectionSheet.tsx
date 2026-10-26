import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n';
import { LanguageCatalogItem } from '../../i18n/types';
import { Search, Check, X, Globe, Sparkles, AlertCircle } from 'lucide-react';

interface LanguageSelectionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectionSheet: React.FC<LanguageSelectionSheetProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, setLanguage, catalog, t, isRTL } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'fully_supported' | 'in_progress'>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setActiveFilter('all');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered and sorted languages
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return catalog
      .filter((item) => {
        // Tab filter
        if (activeFilter === 'fully_supported' && item.status !== 'fully_supported') {
          return false;
        }
        if (activeFilter === 'in_progress' && item.status !== 'in_progress') {
          return false;
        }

        // Search query
        if (!q) return true;
        return (
          item.name.toLowerCase().includes(q) ||
          item.nativeName.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          (item.script && item.script.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        // Selected language first, then fully supported, then alphabetical by nativeName
        if (a.code === language) return -1;
        if (b.code === language) return 1;
        if (a.status !== b.status) {
          return a.status === 'fully_supported' ? -1 : 1;
        }
        return a.nativeName.localeCompare(b.nativeName, a.code);
      });
  }, [catalog, searchQuery, activeFilter, language]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-sheet-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 overflow-hidden transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-xl max-h-[88vh] sm:max-h-[82vh] rounded-t-3xl sm:rounded-3xl glass-premium shadow-2xl flex flex-col border border-white/20 dark:border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-black/20 dark:bg-white/20" />
        </div>

        {/* Sheet Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6C27A]/15 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h2
                id="language-sheet-title"
                className="text-base font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]"
              >
                {t('settings.languageSheetTitle', 'Select Language')}
              </h2>
              <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                {catalog.length} languages cataloged · Native writing systems supported
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
            aria-label={t('common.close', 'Close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Field & Filter Pills */}
        <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] space-y-3">
          <div className="relative">
            <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-[#858A93] dark:text-[#777F8C] ${isRTL ? 'right-3' : 'left-3'}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('settings.languageSearchPlaceholder', 'Search by language or native script...')}
              className={`w-full rounded-2xl border border-black/[0.08] bg-white/70 py-2.5 text-xs text-[#20232A] placeholder-[#858A93] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/40 dark:text-[#F6F3EC] dark:placeholder-[#777F8C] ${
                isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute top-1/2 -translate-y-1/2 p-1 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] ${
                  isRTL ? 'left-3' : 'right-3'
                }`}
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                activeFilter === 'all'
                  ? 'bg-black/[0.08] text-[#20232A] dark:bg-white/[0.12] dark:text-[#F6F3EC] font-semibold'
                  : 'text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              {t('settings.allLanguages', 'All Languages')} ({catalog.length})
            </button>
            <button
              onClick={() => setActiveFilter('fully_supported')}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                activeFilter === 'fully_supported'
                  ? 'bg-[#E6C27A]/20 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30 font-semibold'
                  : 'text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              {t('settings.fullySupported', 'Fully Supported')} (11)
            </button>
            <button
              onClick={() => setActiveFilter('in_progress')}
              className={`px-3 py-1 rounded-lg transition-all font-medium ${
                activeFilter === 'in_progress'
                  ? 'bg-black/[0.08] text-[#20232A] dark:bg-white/[0.12] dark:text-[#F6F3EC] font-semibold'
                  : 'text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
              }`}
            >
              {t('settings.inProgress', 'In Progress')} ({catalog.length - 11})
            </button>
          </div>
        </div>

        {/* Languages Scrollable List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 divide-y divide-black/[0.03] dark:divide-white/[0.03]">
          {filteredLanguages.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="h-6 w-6 text-[#858A93] dark:text-[#777F8C] mx-auto opacity-60" />
              <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                {t('settings.noLanguageMatches', 'No languages match your search.')}
              </p>
            </div>
          ) : (
            filteredLanguages.map((item: LanguageCatalogItem) => {
              const isSelected = item.code.toLowerCase() === language.toLowerCase();
              const isFull = item.status === 'fully_supported';

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    onClose();
                  }}
                  className={`group w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left ${
                    isSelected
                      ? 'bg-[#E6C27A]/15 border border-[#E6C27A]/40 shadow-xs'
                      : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-mono text-xs font-semibold uppercase ${
                        isSelected
                          ? 'bg-[#E6C27A] text-[#131720] shadow-sm'
                          : 'bg-black/[0.04] text-[#858A93] dark:bg-white/[0.06] dark:text-[#777F8C]'
                      }`}
                    >
                      {item.code.split('-')[0]}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {/* Native Name rendered in large native script */}
                        <span className="text-sm font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC] truncate">
                          {item.nativeName}
                        </span>

                        {/* RTL Indicator if right-to-left */}
                        {item.dir === 'rtl' && (
                          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/[0.06] text-[#858A93] dark:bg-white/[0.08] dark:text-[#777F8C]">
                            RTL
                          </span>
                        )}
                      </div>

                      {/* English name and script family for clarity */}
                      <p className="text-[11px] text-[#858A93] dark:text-[#777F8C] truncate">
                        {item.name}
                        {item.script ? ` · ${item.script}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator & Selection Check */}
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    {isFull ? (
                      <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Sparkles className="h-2.5 w-2.5" />
                        {t('settings.fullySupported', 'Fully Supported')}
                      </span>
                    ) : (
                      <span className="hidden sm:inline-flex rounded-full bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 text-[10px] text-[#858A93] dark:text-[#777F8C] border border-black/[0.04] dark:border-white/[0.06]">
                        {t('settings.inProgress', 'In Progress')}
                      </span>
                    )}

                    <div
                      className={`h-5 w-5 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#E6C27A] text-[#131720]'
                          : 'border border-black/[0.12] dark:border-white/[0.12] group-hover:border-[#E6C27A]/50'
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="px-6 py-3 border-t border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between text-[11px] text-[#858A93] dark:text-[#777F8C]">
          <span>{t('settings.catalogNotice', 'Missing phrases gracefully fallback to English.')}</span>
          <button
            type="button"
            onClick={onClose}
            className="font-medium text-[#A97B32] dark:text-[#E6C27A] hover:underline"
          >
            {t('common.done', 'Done')}
          </button>
        </div>
      </div>
    </div>
  );
};
