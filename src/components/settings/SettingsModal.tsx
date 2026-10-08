import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_REVISION_INTERVALS } from '../../utils/scheduler';
import {
  X,
  User,
  BookOpen,
  Calendar,
  Sun,
  Moon,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  Shield,
  Check,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    state,
    updateSettings,
    theme,
    toggleTheme,
    exportData,
    importData,
    loadDemoData,
    purgeDemoData,
    clearAllData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'data' | 'privacy'>('profile');
  const [studentName, setStudentName] = useState(state.settings.studentName || 'Aakash Panjiyar');
  const [targetExam, setTargetExam] = useState(state.settings.targetExam || '');
  const [targetDailyTopics, setTargetDailyTopics] = useState(state.settings.targetDailyTopics || 3);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Interval editor
  const [intervalsStr, setIntervalsStr] = useState(
    (state.settings.revisionIntervals || DEFAULT_REVISION_INTERVALS).join(', ')
  );
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  React.useEffect(() => {
    if (isSettingsOpen) {
      setStudentName(state.settings.studentName || 'Aakash Panjiyar');
      setTargetExam(state.settings.targetExam || 'Class 12 Boards & Competitive Exam');
      setTargetDailyTopics(state.settings.targetDailyTopics || 3);
      setIntervalsStr((state.settings.revisionIntervals || DEFAULT_REVISION_INTERVALS).join(', '));
    }
  }, [isSettingsOpen, state.settings]);

  if (!isSettingsOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName: studentName.trim(),
      targetExam: targetExam.trim(),
      targetDailyTopics: Number(targetDailyTopics),
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2000);
  };

  const handleSaveIntervals = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = intervalsStr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n));

      if (parsed.length >= 3) {
        updateSettings({ revisionIntervals: parsed });
        setIsSavedNotice(true);
        setTimeout(() => setIsSavedNotice(false), 2000);
      }
    } catch (err) {
      alert('Please enter valid comma-separated day offsets (e.g. 0, 2, 4, 6, 13, 20, 27).');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      if (success) {
        setImportStatus('Backup data restored successfully!');
      } else {
        setImportStatus('Invalid backup JSON format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all study data? This action cannot be undone unless you have exported a backup.'
      )
    ) {
      clearAllData();
      setIsSettingsOpen(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200/90 bg-white shadow-2xl dark:border-neutral-800/90 dark:bg-[#0e0f14] overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-4 dark:border-neutral-800/80">
          <div>
            <h2 className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Settings & Preferences
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Customize revision intervals, daily targets, and manage personal data
            </p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200/60 px-6 dark:border-neutral-800/60 text-xs">
          {[
            { id: 'profile', label: 'Profile & Targets' },
            { id: 'schedule', label: 'Revision Rhythm' },
            { id: 'data', label: 'Data & Backup' },
            { id: 'privacy', label: 'Privacy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-amber-500 text-neutral-900 dark:text-neutral-100 font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
          {isSavedNotice && (
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-500 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Preferences saved.</span>
            </div>
          )}

          {/* 1. Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Target Examination / Curriculum
                </label>
                <input
                  type="text"
                  placeholder="e.g. Class 12 Boards & JEE / NEET / SAT"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Daily New Topics Target
                </label>
                <select
                  value={targetDailyTopics}
                  onChange={(e) => setTargetDailyTopics(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value={1}>1 topic / day</option>
                  <option value={2}>2 topics / day</option>
                  <option value={3}>3 topics / day (Recommended)</option>
                  <option value={4}>4 topics / day</option>
                  <option value={5}>5 topics / day</option>
                  <option value={6}>6+ topics / day</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-2 font-semibold text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
                >
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {/* 2. Revision Rhythm Tab */}
          {activeTab === 'schedule' && (
            <form onSubmit={handleSaveIntervals} className="space-y-4">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Spaced Repetition Schedule (Day Offsets)
                </label>
                <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                  Default algorithm uses Day 1 (0), Day 3 (+2), Day 5 (+4), Day 7 (+6), Day 14 (+13), Day 21 (+20), Day 28 (+27).
                </p>
              </div>

              <input
                type="text"
                value={intervalsStr}
                onChange={(e) => setIntervalsStr(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 p-2.5 font-mono text-xs text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
              />

              <div className="rounded-lg border border-neutral-200/60 bg-neutral-50 p-3 dark:border-neutral-800/60 dark:bg-neutral-900/40 text-[11px] text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                  Active Configuration:
                </span>
                <div className="mt-1 font-mono">
                  Day 1 (Learn) → Day 3 (Rev 1) → Day 5 (Rev 2) → Day 7 (Test) → Day 14 (Rev) → Day 21 (Rev) → Day 28 (Rev)
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIntervalsStr(DEFAULT_REVISION_INTERVALS.join(', '))}
                  className="rounded-lg border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300"
                >
                  Reset to Default
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 font-semibold text-amber-300 dark:bg-neutral-100 dark:text-neutral-900"
                >
                  Update Rhythm
                </button>
              </div>
            </form>
          )}

          {/* 3. Data & Backup Tab */}
          {activeTab === 'data' && (
            <div className="space-y-5">
              {importStatus && (
                <div className="rounded-lg bg-neutral-100 p-2.5 dark:bg-neutral-800 font-mono text-[11px]">
                  {importStatus}
                </div>
              )}

              {/* Export */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Export Learning Records
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Download complete snapshot of subjects, topics, schedules, and test scores as JSON.
                  </p>
                </div>
                <button
                  onClick={exportData}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export JSON</span>
                </button>
              </div>

              {/* Import */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Import Backup
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Restore previously exported learning data from a JSON backup file.
                  </p>
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Select File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Demo Data Management */}
              <div className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
                <div>
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Demo Preview Data
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    {state.isDemoData
                      ? 'Currently viewing Class 11/12 demo dataset. Purge to start your real notebook.'
                      : 'Load realistic Class 11/12 physics, chemistry, and math demo records.'}
                  </p>
                </div>
                {state.isDemoData ? (
                  <button
                    onClick={purgeDemoData}
                    className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300"
                  >
                    Clear Demo Data
                  </button>
                ) : (
                  <button
                    onClick={loadDemoData}
                    className="rounded-lg border border-neutral-300 px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200"
                  >
                    Load Demo Data
                  </button>
                )}
              </div>

              {/* Destructive Clear */}
              <div className="flex items-center justify-between rounded-xl border border-rose-200/60 p-4 dark:border-rose-950/50">
                <div>
                  <h4 className="font-semibold text-rose-600 dark:text-rose-400">
                    Purge All Learning Records
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Permanently delete all subjects, topics, and mistake logs on this browser.
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete All</span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-3 leading-relaxed text-neutral-600 dark:text-neutral-300 text-xs">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                <Shield className="h-4 w-4 text-amber-500" />
                <span>You Own Your Academic Learning Data</span>
              </div>
              <p>
                AURELIS is built with a local-first philosophy. Your recorded chapters, formulas, recall scores, and error logs are stored on your device and are never sold or shared with third parties.
              </p>
              <p>
                When using optional AI features (such as practice question synthesis or cognitive mistake diagnosis), prompts are processed securely using Google Gemini server-side infrastructure without storing your study material for training.
              </p>
              <p>
                You can export your complete study history anytime as standard JSON.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
