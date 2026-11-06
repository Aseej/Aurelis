import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { ScientificCalculator } from './calculator/ScientificCalculator';
import { CaptureNotebook } from './notebook/CaptureNotebook';
import {
  Calculator,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Maximize2,
  Minimize2,
  LayoutGrid,
  Camera,
} from 'lucide-react';

export type ToolsTab = 'overview' | 'calculator' | 'notebook';

export const ToolsView: React.FC = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<ToolsTab>('overview');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6">
      {/* 1. Header & Navigation Tabs */}
      {!isFocused && (
        <div className="space-y-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#20232A] dark:text-[#F6F3EC]">
              {t('tools.title', 'Tools')}
            </h1>

            {/* Breadcrumb back button when inside a specific tool */}
            {activeTab !== 'overview' && (
              <button
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 px-3 py-1.5 rounded-xl transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('tools.backToTools', 'Back to Tools')}</span>
              </button>
            )}
          </div>

          {/* Top Tabs Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-black font-semibold shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6E737D] dark:text-[#A0A5B0] hover:text-[#20232A] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t('tools.allTools', 'All Tools')}</span>
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'calculator'
                  ? 'bg-amber-500 text-black font-semibold shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6E737D] dark:text-[#A0A5B0] hover:text-[#20232A] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{t('tools.scientificCalc', 'Scientific Calculator')}</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/15 dark:bg-white/15">
                fx-991ES
              </span>
            </button>

            <button
              onClick={() => setActiveTab('notebook')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeTab === 'notebook'
                  ? 'bg-amber-500 text-black font-semibold shadow-xs'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6E737D] dark:text-[#A0A5B0] hover:text-[#20232A] dark:hover:text-[#F6F3EC]'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{t('tools.captureNotebook', 'Capture Notebook')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. OVERVIEW / HUB VIEW (Default when opening Tools) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tool Card 1: Calculator */}
            <div
              onClick={() => setActiveTab('calculator')}
              className="group rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 sm:p-6 hover:border-amber-500/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {t('tools.active', 'Active')}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#20232A] dark:text-[#F6F3EC] group-hover:text-amber-500 transition-colors">
                    {t('tools.scientificCalc', 'Scientific Calculator')}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['fx-991ES PLUS', t('tools.tagNaturalDisplay', 'Natural Display'), t('tools.tag8Modes', '8 Modes')].map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[#6E737D] dark:text-[#A0A5B0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('calculator');
                }}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>{t('tools.openCalculator', 'Open Calculator')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Tool Card 2: Capture Notebook */}
            <div
              onClick={() => setActiveTab('notebook')}
              className="group rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 sm:p-6 hover:border-amber-500/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    {t('tools.active', 'Active')}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-[#20232A] dark:text-[#F6F3EC] group-hover:text-amber-500 transition-colors">
                    {t('tools.captureNotebook', 'Capture Notebook')}
                  </h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[t('tools.tagDriveSync', 'Google Drive Sync'), t('tools.tagHandwritten', 'Handwritten Notes'), t('tools.tagCamera', 'Camera Capture'), t('tools.tagReader', 'Reader')].map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-[#6E737D] dark:text-[#A0A5B0]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('notebook');
                }}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>{t('tools.openNotebook', 'Open Capture Notebook')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CALCULATOR TAB */}
      {activeTab === 'calculator' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-end px-1">
            <button
              onClick={() => setIsFocused((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC] px-2.5 py-1.5 rounded-lg hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title={isFocused ? t('tools.exitFocus', 'Exit Focus') : t('tools.focusView', 'Focus View')}
            >
              {isFocused ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>{t('tools.exitFocus', 'Exit Focus')}</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>{t('tools.focusView', 'Focus View')}</span>
                </>
              )}
            </button>
          </div>

          <ScientificCalculator />
        </div>
      )}

      {/* 4. CAPTURE NOTEBOOK TAB */}
      {activeTab === 'notebook' && (
        <div className="space-y-4 animate-fade-in">
          <CaptureNotebook />
        </div>
      )}
    </div>
  );
};
