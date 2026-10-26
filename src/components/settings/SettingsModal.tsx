import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { DEFAULT_REVISION_INTERVALS } from '../../utils/scheduler';
import { LANGUAGE_CATALOG } from '../../i18n/catalog';
import {
  X,
  User,
  Calendar,
  Download,
  Upload,
  Trash2,
  Shield,
  Check,
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsOpen,
    setIsSettingsOpen,
    state,
    updateSettings,
    exportData,
    importData,
    loadDemoData,
    purgeDemoData,
    clearAllData,
  } = useApp();

  const { t, setLanguage } = useI18n();

  const [activeTab, setActiveTab] = useState<'profile' | 'schedule' | 'data' | 'privacy'>('profile');
  const [studentName, setStudentName] = useState(state.settings.studentName || 'Aakash Panjiyar');
  const [targetExam, setTargetExam] = useState(state.settings.targetExam || '');
  const [targetDailyTopics, setTargetDailyTopics] = useState(state.settings.targetDailyTopics || 3);
  const [selectedLanguage, setSelectedLanguage] = useState(state.settings.language || 'en');
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
      setSelectedLanguage(state.settings.language || 'en');
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
      language: selectedLanguage,
    });
    setLanguage(selectedLanguage);
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
        t(
          'settings.clearAllDataConfirm',
          'Are you sure you want to delete all study data? This action cannot be undone unless you have exported a backup.'
        )
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
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
      >
        <div className="relative w-full max-w-2xl rounded-3xl glass-premium shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-white/20 dark:border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-4 dark:border-white/[0.08]">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                {t('settings.title', 'Settings & Preferences')}
              </h2>
              <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                {t('settings.subtitle', 'Customize revision rhythm, personal targets, and local data backups')}
              </p>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="rounded-xl p-1.5 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
              aria-label={t('common.close', 'Close')}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-black/[0.06] px-6 dark:border-white/[0.08] text-xs">
            {[
              { id: 'profile', label: t('settings.tabProfile', 'Profile & Targets') },
              { id: 'schedule', label: t('settings.tabSchedule', 'Revision Rhythm') },
              { id: 'data', label: t('settings.tabData', 'Data & Backup') },
              { id: 'privacy', label: t('settings.tabPrivacy', 'Privacy') },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3.5 font-medium transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? 'border-[#A97B32] text-[#20232A] dark:border-[#E6C27A] dark:text-[#FFE6AD] font-semibold'
                    : 'border-transparent text-[#686D77] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 text-xs space-y-6">
            {isSavedNotice && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 font-medium">
                <Check className="h-4 w-4" />
                <span>{t('common.preferencesSaved', 'Preferences saved.')}</span>
              </div>
            )}

            {/* 1. Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {t('settings.studentName', 'Student Name')}
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {t('settings.targetExam', 'Target Examination / Academic Curriculum')}
                    </label>
                    <input
                      type="text"
                      placeholder={t('settings.targetExamPlaceholder', 'e.g. Class 12 Boards & Competitive Entrance')}
                      value={targetExam}
                      onChange={(e) => setTargetExam(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {t('settings.dailyTarget', 'Daily New Topics Target')}
                    </label>
                    <select
                      value={targetDailyTopics}
                      onChange={(e) => setTargetDailyTopics(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                    >
                      <option value={1}>1 {t('common.topics', 'topics')} / {t('common.day', 'day')}</option>
                      <option value={2}>2 {t('common.topics', 'topics')} / {t('common.day', 'day')}</option>
                      <option value={3}>3 {t('common.topics', 'topics')} / {t('common.day', 'day')} ({t('common.recommended', 'Recommended')})</option>
                      <option value={4}>4 {t('common.topics', 'topics')} / {t('common.day', 'day')}</option>
                      <option value={5}>5 {t('common.topics', 'topics')} / {t('common.day', 'day')}</option>
                      <option value={6}>6+ {t('common.topics', 'topics')} / {t('common.day', 'day')}</option>
                    </select>
                  </div>

                  {/* Language Option at below everything */}
                  <div>
                    <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {t('settings.language', 'Language')}
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => {
                        const newLang = e.target.value;
                        setSelectedLanguage(newLang);
                        setLanguage(newLang);
                        updateSettings({ language: newLang });
                      }}
                      className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                    >
                      {LANGUAGE_CATALOG.map((lang) => (
                        <option
                          key={lang.code}
                          value={lang.code}
                          className="dark:bg-[#16181D] text-[#20232A] dark:text-[#F6F3EC]"
                        >
                          {lang.nativeName} ({lang.name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="btn-gold-primary rounded-xl px-5 py-2.5 font-semibold text-xs shadow-xs"
                    >
                      {t('settings.saveProfile', 'Save Profile Settings')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. Revision Rhythm Tab */}
            {activeTab === 'schedule' && (
              <form onSubmit={handleSaveIntervals} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    {t('settings.scheduleTitle', 'Spaced Repetition Schedule (Day Offsets)')}
                  </label>
                  <p className="text-[#858A93] dark:text-[#777F8C] text-[11px]">
                    {t('settings.scheduleSub', 'Default spaced intervals: Day 1 (0), Day 3 (+2), Day 5 (+4), Day 7 (+6), Day 14 (+13), Day 21 (+20), Day 28 (+27).')}
                  </p>
                </div>

                <input
                  type="text"
                  value={intervalsStr}
                  onChange={(e) => setIntervalsStr(e.target.value)}
                  className="w-full rounded-xl border border-black/[0.08] bg-white/70 p-2.5 font-mono text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                />

                <div className="rounded-2xl glass-subtle p-3.5 text-[11px] text-[#686D77] dark:text-[#A7ABB5]">
                  <span className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                    Active Configuration Rhythm:
                  </span>
                  <div className="mt-1 font-mono">
                    Day 1 (Learn) → Day 3 (Rev 1) → Day 5 (Rev 2) → Day 7 (Test) → Day 14 (Rev) → Day 21 (Rev) → Day 28 (Rev)
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIntervalsStr(DEFAULT_REVISION_INTERVALS.join(', '))}
                    className="btn-glass-secondary rounded-xl px-3.5 py-2 font-medium"
                  >
                    Reset to Default
                  </button>
                  <button
                    type="submit"
                    className="btn-gold-primary rounded-xl px-4 py-2 font-semibold shadow-xs"
                  >
                    {t('settings.saveRhythm', 'Update Rhythm')}
                  </button>
                </div>
              </form>
            )}

            {/* 3. Data & Backup Tab */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                {importStatus && (
                  <div className="rounded-2xl glass-subtle p-3 font-mono text-[11px] text-[#20232A] dark:text-[#F6F3EC]">
                    {importStatus}
                  </div>
                )}

                {/* Export */}
                <div className="flex items-center justify-between rounded-2xl glass-subtle p-4">
                  <div>
                    <h4 className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {t('settings.exportBackup', 'Export Data Backup')}
                    </h4>
                    <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                      {t('settings.exportBackupSub', 'Download your complete study log, topics, test scores, and error notebook as a JSON file.')}
                    </p>
                  </div>
                  <button
                    onClick={exportData}
                    className="btn-glass-secondary flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-medium shrink-0 ml-3"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{t('settings.downloadJSON', 'Download JSON Backup')}</span>
                  </button>
                </div>

                {/* Import */}
                <div className="flex items-center justify-between rounded-2xl glass-subtle p-4">
                  <div>
                    <h4 className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      {t('settings.restoreBackup', 'Restore from Backup')}
                    </h4>
                    <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                      {t('settings.restoreBackupSub', 'Import a previously saved AURELIS JSON backup file.')}
                    </p>
                  </div>
                  <label className="btn-glass-secondary flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 font-medium shrink-0 ml-3">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{t('settings.selectBackupFile', 'Select Backup File')}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Demo Data Management */}
                <div className="flex items-center justify-between rounded-2xl glass-subtle p-4">
                  <div>
                    <h4 className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                      Demo Preview Data
                    </h4>
                    <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                      {state.isDemoData
                        ? 'Currently viewing sample academic dataset. Purge to begin your personal revision notebook.'
                        : 'Load realistic sample physics, chemistry, and math syllabus records.'}
                    </p>
                  </div>
                  {state.isDemoData ? (
                    <button
                      onClick={purgeDemoData}
                      className="rounded-xl border border-[#E6C27A]/40 bg-[#E6C27A]/15 px-3.5 py-2 font-semibold text-[#8C6221] dark:text-[#FFE6AD] hover:bg-[#E6C27A]/25 transition-colors shrink-0 ml-3"
                    >
                      {t('nav.resetDemo', 'Reset Demo Data')}
                    </button>
                  ) : (
                    <button
                      onClick={loadDemoData}
                      className="btn-glass-secondary rounded-xl px-3.5 py-2 font-medium shrink-0 ml-3"
                    >
                      Load Demo Data
                    </button>
                  )}
                </div>

                {/* Destructive Clear */}
                <div className="flex items-center justify-between rounded-2xl glass-subtle border border-[#F87171]/20 p-4">
                  <div>
                    <h4 className="font-semibold text-[#F87171]">
                      {t('settings.clearAllData', 'Delete All Study Data')}
                    </h4>
                    <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                      Permanently delete all subjects, topics, and mistake logs in this browser session.
                    </p>
                  </div>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 rounded-xl border border-[#F87171]/40 bg-[#F87171]/10 px-3.5 py-2 font-semibold text-[#F87171] hover:bg-[#F87171]/20 transition-colors shrink-0 ml-3"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t('common.delete', 'Delete')}</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-3 leading-relaxed text-[#686D77] dark:text-[#A7ABB5] text-xs">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#20232A] dark:text-[#F6F3EC]">
                  <Shield className="h-4 w-4 text-[#E6C27A]" />
                  <span>{t('settings.privacyLocalFirst', 'Local-First Architecture')}</span>
                </div>
                <p>
                  {t(
                    'settings.privacyLocalFirstSub',
                    'Your study data, schedules, test scores, and error logs are stored exclusively in your browser localStorage. No external trackers or private data harvesting.'
                  )}
                </p>
                <p>
                  AURELIS operates fully offline and locally. Language preferences, topics, notes, and progress records remain entirely on your personal machine.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
};
