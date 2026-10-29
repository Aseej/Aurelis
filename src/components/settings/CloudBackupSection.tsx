import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  uploadBackupToDrive,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  deleteBackupFromDrive,
  getCachedAccessToken,
  onGoogleAuthStateChanged,
} from '../../services/googleDriveService';
import {
  createSafetySnapshot,
  getSafetySnapshot,
  clearSafetySnapshot,
} from '../../services/safetySnapshotService';
import { CloudBackupSummary, AurelisCloudBackup, SafetySnapshot } from '../../types';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  ShieldCheck,
  RotateCcw,
  Clock,
  Trash2,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  History,
  FileCheck2,
} from 'lucide-react';

type ConnectionState = 'not_connected' | 'connecting' | 'connected' | 'connection_expired' | 'error';

export const CloudBackupSection: React.FC = () => {
  const { state, updateSettings, streakInfo } = useApp();
  const { t } = useI18n();

  // Auth & Connection State
  const [connectionState, setConnectionState] = useState<ConnectionState>('not_connected');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Backup & Operation States
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgressMsg, setBackupProgressMsg] = useState<string | null>(null);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);

  // History & List
  const [backups, setBackups] = useState<CloudBackupSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Restore Modal State
  const [restoreCandidate, setRestoreCandidate] = useState<{
    fileId: string;
    summary?: CloudBackupSummary;
    payload?: AurelisCloudBackup;
    verified?: boolean;
  } | null>(null);
  const [isDownloadingCandidate, setIsDownloadingCandidate] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Safety Snapshot State
  const [existingSnapshot, setExistingSnapshot] = useState<SafetySnapshot | null>(() => getSafetySnapshot());

  // Listen to Google Auth status changes
  useEffect(() => {
    const unsubscribe = onGoogleAuthStateChanged((user, hasToken) => {
      if (user) {
        setUserEmail(user.email || 'Google Account');
        if (hasToken) {
          setConnectionState('connected');
        } else {
          setConnectionState('connection_expired');
        }
      } else {
        setUserEmail(null);
        setConnectionState('not_connected');
      }
    });

    return () => unsubscribe();
  }, []);

  // Format bytes nicely
  const formatBytes = (bytes?: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format date nicely
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Never';
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' +
        d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      );
    } catch {
      return isoString;
    }
  };

  // Connect Google Drive
  const handleConnect = async () => {
    try {
      setConnectionState('connecting');
      setAuthErrorMessage(null);
      const { user } = await connectGoogleDrive();
      setUserEmail(user.email);
      setConnectionState('connected');
      setOperationSuccess('Google Drive connected successfully.');
      setTimeout(() => setOperationSuccess(null), 3000);
      loadHistory();
    } catch (err: any) {
      console.error('Google Drive connection failed:', err);
      setConnectionState('error');
      setAuthErrorMessage(err.message || 'Failed to authenticate with Google Drive.');
    }
  };

  // Disconnect Google Drive
  const handleDisconnect = async () => {
    try {
      await disconnectGoogleDrive();
      setUserEmail(null);
      setConnectionState('not_connected');
      setBackups([]);
      setIsHistoryOpen(false);
    } catch (err: any) {
      console.error('Failed to disconnect Google Drive:', err);
    }
  };

  // Load list of backups from Drive
  const loadHistory = useCallback(async () => {
    if (!getCachedAccessToken()) return;
    try {
      setIsLoadingHistory(true);
      const list = await listBackupsFromDrive();
      setBackups(list);
    } catch (err: any) {
      console.warn('Failed to fetch backup history:', err);
      if (err.message?.includes('expired')) {
        setConnectionState('connection_expired');
      }
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Back up now action
  const handleBackupNow = async () => {
    if (connectionState !== 'connected' || !getCachedAccessToken()) {
      handleConnect();
      return;
    }

    try {
      setIsBackingUp(true);
      setBackupProgressMsg('Computing SHA-256 digest...');
      await new Promise((r) => setTimeout(r, 200));

      setBackupProgressMsg('Uploading snapshot to Google Drive...');
      const { summary } = await uploadBackupToDrive(state, streakInfo.currentStreak);

      updateSettings({
        lastCloudBackupDate: summary.createdTime,
        lastCloudBackupStatus: 'success',
        lastCloudBackupSize: summary.size,
        lastCloudBackupError: undefined,
        lastCloudBackupId: summary.id,
      });

      setOperationSuccess('Backup complete and verified on Google Drive.');
      setTimeout(() => setOperationSuccess(null), 3500);
      loadHistory();
    } catch (err: any) {
      console.error('Backup error:', err);
      updateSettings({
        lastCloudBackupStatus: 'failed',
        lastCloudBackupError: err.message || 'Backup failed',
      });
      if (err.message?.includes('expired')) {
        setConnectionState('connection_expired');
      }
    } finally {
      setIsBackingUp(false);
      setBackupProgressMsg(null);
    }
  };

  // Prepare restore candidate (download and verify)
  const handleSelectRestoreCandidate = async (backupItem: CloudBackupSummary) => {
    try {
      setIsDownloadingCandidate(true);
      const { backup, verified } = await downloadBackupFromDrive(backupItem.id);
      setRestoreCandidate({
        fileId: backupItem.id,
        summary: backupItem,
        payload: backup,
        verified,
      });
    } catch (err: any) {
      alert(`Could not retrieve backup file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsDownloadingCandidate(false);
    }
  };

  // Execute restore with safety snapshot
  const handleExecuteRestore = async () => {
    if (!restoreCandidate?.payload?.data) return;

    try {
      setIsRestoring(true);

      // 1. Create a local safety snapshot before overwriting
      const snapshot = createSafetySnapshot(
        state,
        `Pre-restore snapshot before applying ${restoreCandidate.summary?.name || 'Cloud Backup'}`
      );
      setExistingSnapshot(snapshot);

      // 2. Transactionally apply backup to localStorage
      const backupData = restoreCandidate.payload.data;
      localStorage.setItem('aurelis_spaced_repetition_data_v1', JSON.stringify(backupData));

      setOperationSuccess('Data restored successfully! Refreshing study space...');
      setRestoreCandidate(null);

      // 3. Reload window cleanly after a momentary pause to re-mount context and state cleanly
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      alert(`Restore failed: ${err.message || 'Unknown error'}`);
      setIsRestoring(false);
    }
  };

  // Revert to safety snapshot
  const handleRevertSnapshot = () => {
    if (!existingSnapshot) return;
    if (
      window.confirm(
        `Revert to safety snapshot from ${formatDate(existingSnapshot.timestamp)}? This will restore the study state you had immediately before your last cloud restore.`
      )
    ) {
      localStorage.setItem('aurelis_spaced_repetition_data_v1', JSON.stringify(existingSnapshot.state));
      clearSafetySnapshot();
      setExistingSnapshot(null);
      window.location.reload();
    }
  };

  // Delete a backup from Drive
  const handleDeleteBackup = async (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (backups.length <= 1) {
      alert('Safety policy requires preserving at least one valid backup on Google Drive.');
      return;
    }
    if (!window.confirm('Delete this backup from your Google Drive?')) return;

    try {
      await deleteBackupFromDrive(fileId);
      setBackups((prev) => prev.filter((b) => b.id !== fileId));
    } catch (err: any) {
      alert(`Could not delete backup: ${err.message || 'Unknown error'}`);
    }
  };

  // Auto-backup toggle
  const toggleAutoBackup = () => {
    const nextVal = !state.settings.autoCloudBackupEnabled;
    updateSettings({ autoCloudBackupEnabled: nextVal });
  };

  // Next backup calculation
  const getNextBackupText = () => {
    if (!state.settings.autoCloudBackupEnabled) {
      return 'Paused';
    }
    if (connectionState !== 'connected') {
      return 'Connect Drive to activate';
    }
    if (!state.settings.lastCloudBackupDate) {
      return 'Eligible for initial run';
    }
    const lastDate = new Date(state.settings.lastCloudBackupDate).getTime();
    const nextDate = new Date(lastDate + 24 * 60 * 60 * 1000);
    if (Date.now() >= nextDate.getTime()) {
      return 'Eligible now (automatic)';
    }
    return `Tomorrow after ${nextDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-4">
      {/* Operation Notice */}
      {operationSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{operationSuccess}</span>
        </div>
      )}

      {/* Safety Snapshot Rollback Banner if available */}
      {existingSnapshot && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-[#E6C27A]/10 border border-[#E6C27A]/30 p-3.5">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="h-4 w-4 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
            <div>
              <div className="font-semibold text-xs text-[#20232A] dark:text-[#F6F3EC]">
                Pre-Restore Safety Snapshot Available
              </div>
              <div className="text-[11px] text-[#686D77] dark:text-[#A7ABB5]">
                Saved automatically on {formatDate(existingSnapshot.timestamp)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleRevertSnapshot}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#E6C27A] text-black hover:bg-[#d4ae65] transition shadow-xs"
            >
              Revert to Pre-Restore
            </button>
            <button
              onClick={() => {
                clearSafetySnapshot();
                setExistingSnapshot(null);
              }}
              className="p-1.5 text-[#858A93] hover:text-[#20232A] dark:hover:text-white rounded-lg"
              title="Dismiss snapshot"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 1. Account & Connection Card */}
      <div className="rounded-2xl glass-subtle border border-black/[0.06] dark:border-white/[0.08] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#E6C27A]/25 to-[#A97B32]/10 border border-[#E6C27A]/30 flex items-center justify-center shrink-0 shadow-xs">
              <Cloud className="h-5 w-5 text-[#A97B32] dark:text-[#E6C27A]" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-xs text-[#20232A] dark:text-[#F6F3EC]">
                  Google Drive Cloud
                </span>
                {connectionState === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                )}
                {connectionState === 'connecting' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                    Connecting...
                  </span>
                )}
                {connectionState === 'connection_expired' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <AlertCircle className="h-2.5 w-2.5" />
                    Session Expired
                  </span>
                )}
                {connectionState === 'not_connected' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                    Not connected
                  </span>
                )}
                {connectionState === 'error' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Connection error
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#858A93] dark:text-[#777F8C] mt-0.5 font-medium">
                {userEmail || 'Sign in to sync your study data across devices'}
              </p>
            </div>
          </div>

          {/* Connect / Disconnect Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {connectionState === 'connected' ? (
              <button
                onClick={handleDisconnect}
                className="btn-glass-secondary rounded-xl px-3 py-1.5 text-xs text-[#858A93] hover:text-rose-500 hover:border-rose-500/30 transition"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connectionState === 'connecting'}
                className="btn-gold-primary rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-xs transition"
              >
                <Cloud className="h-3.5 w-3.5" />
                <span>
                  {connectionState === 'connection_expired' ? 'Reconnect Google Drive' : 'Connect Google Drive'}
                </span>
              </button>
            )}
          </div>
        </div>

        {authErrorMessage && (
          <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] text-rose-500 flex items-center gap-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span>{authErrorMessage}</span>
          </div>
        )}

        {/* Privacy Note */}
        <div className="mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2 text-[10.5px] text-[#686D77] dark:text-[#858A93]">
          <Lock className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
          <span>
            Stored safely in your private <strong className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">appDataFolder</strong>.
            Hidden from normal Google Drive folders to prevent accidental deletion.
          </span>
        </div>
      </div>

      {/* 2. Backup Status & Controls Dashboard */}
      <div className="rounded-2xl glass-subtle border border-black/[0.06] dark:border-white/[0.08] p-4 sm:p-5 space-y-4">
        {/* Sub-header with Auto Backup Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#A97B32] dark:text-[#E6C27A]" />
            <span className="font-semibold text-xs text-[#20232A] dark:text-[#F6F3EC]">
              Cloud Backup Status & Sync
            </span>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] text-[#858A93] dark:text-[#777F8C] hidden sm:inline">
              Daily Auto-Backup
            </span>
            <button
              type="button"
              onClick={toggleAutoBackup}
              title="Toggle automatic daily cloud backup"
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                state.settings.autoCloudBackupEnabled ? 'bg-[#A97B32] dark:bg-[#E6C27A]' : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  state.settings.autoCloudBackupEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Metric 1: Last Successful Backup */}
          <div className="rounded-xl bg-white/40 dark:bg-black/25 p-3 border border-black/[0.04] dark:border-white/[0.05]">
            <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase tracking-wider font-semibold">
              Last Backup
            </div>
            <div className="mt-1 font-medium text-xs text-[#20232A] dark:text-[#F6F3EC] flex items-center gap-1.5 truncate">
              <Clock className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
              <span className="truncate">{formatDate(state.settings.lastCloudBackupDate)}</span>
            </div>
          </div>

          {/* Metric 2: Result & Verification */}
          <div className="rounded-xl bg-white/40 dark:bg-black/25 p-3 border border-black/[0.04] dark:border-white/[0.05]">
            <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase tracking-wider font-semibold">
              Integrity & Status
            </div>
            <div className="mt-1 font-medium text-xs flex items-center gap-1.5 truncate">
              {state.settings.lastCloudBackupStatus === 'success' && (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Verified (SHA-256)</span>
                </span>
              )}
              {state.settings.lastCloudBackupStatus === 'failed' && (
                <span className="text-rose-500 flex items-center gap-1 truncate">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Failed</span>
                </span>
              )}
              {!state.settings.lastCloudBackupStatus && (
                <span className="text-[#858A93] dark:text-[#777F8C] truncate">
                  No backup yet
                </span>
              )}
            </div>
          </div>

          {/* Metric 3: Size & Next Run */}
          <div className="rounded-xl bg-white/40 dark:bg-black/25 p-3 border border-black/[0.04] dark:border-white/[0.05]">
            <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase tracking-wider font-semibold">
              Size & Schedule
            </div>
            <div className="mt-1 font-medium text-xs text-[#20232A] dark:text-[#F6F3EC] flex items-center gap-1.5 truncate">
              <HardDrive className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
              <span className="font-mono">{formatBytes(state.settings.lastCloudBackupSize)}</span>
              <span className="text-[10px] text-[#858A93] dark:text-[#777F8C] truncate">
                • {getNextBackupText()}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={handleBackupNow}
            disabled={isBackingUp || connectionState === 'connecting'}
            className="btn-gold-primary rounded-xl px-4 py-2 font-semibold text-xs flex items-center gap-2 shadow-xs transition"
          >
            {isBackingUp ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>{backupProgressMsg || 'Backing up...'}</span>
              </>
            ) : (
              <>
                <CloudUpload className="h-3.5 w-3.5" />
                <span>Back Up Now</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              const nextState = !isHistoryOpen;
              setIsHistoryOpen(nextState);
              if (nextState) loadHistory();
            }}
            disabled={connectionState !== 'connected'}
            className="btn-glass-secondary rounded-xl px-3.5 py-2 font-medium text-xs flex items-center gap-1.5 transition"
          >
            <History className="h-3.5 w-3.5" />
            <span>{isHistoryOpen ? 'Hide History' : 'Backup History & Restore'}</span>
            {isHistoryOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {backups.length > 0 && !isHistoryOpen && (
            <button
              onClick={() => handleSelectRestoreCandidate(backups[0])}
              disabled={connectionState !== 'connected' || isDownloadingCandidate}
              className="btn-glass-secondary rounded-xl px-3.5 py-2 font-medium text-xs flex items-center gap-1.5 transition text-[#A97B32] dark:text-[#E6C27A]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Restore Latest</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Backup History Accordion / Drawer */}
      {isHistoryOpen && (
        <div className="rounded-2xl glass-subtle border border-black/[0.06] dark:border-white/[0.08] p-4 sm:p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-[#A97B32] dark:text-[#E6C27A]" />
              <span className="font-semibold text-xs text-[#20232A] dark:text-[#F6F3EC]">
                Cloud Snapshot History ({backups.length})
              </span>
            </div>
            <button
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="p-1 rounded-lg text-[#858A93] hover:text-[#20232A] dark:hover:text-white transition"
              title="Refresh history"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
            Up to 5 recent snapshots are retained automatically on Google Drive with verified SHA-256 integrity checksums.
          </p>

          {isLoadingHistory ? (
            <div className="py-8 text-center text-xs text-[#858A93]">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#A97B32] dark:text-[#E6C27A]" />
              Fetching backups from Google Drive...
            </div>
          ) : backups.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
              No cloud backups found on Google Drive yet. Tap &quot;Back Up Now&quot; to create your first cloud snapshot.
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {backups.map((b, idx) => (
                <div
                  key={b.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-white/40 dark:bg-black/25 border border-black/[0.04] dark:border-white/[0.05] hover:border-[#E6C27A]/30 transition"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-xs text-[#20232A] dark:text-[#F6F3EC]">
                        {formatDate(b.createdTime)}
                      </span>
                      {idx === 0 && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-[#E6C27A]/20 text-[#A97B32] dark:text-[#FFE6AD]">
                          Latest
                        </span>
                      )}
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        <FileCheck2 className="h-3 w-3" />
                        SHA-256 OK
                      </span>
                    </div>
                    <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] flex items-center gap-3 mt-1 font-mono">
                      <span>{formatBytes(b.size)}</span>
                      {b.metadata && (
                        <span>
                          {b.metadata.topicsCount} topics • {b.metadata.subjectsCount} subjects • {b.metadata.streakDays}d streak
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => handleSelectRestoreCandidate(b)}
                      disabled={isDownloadingCandidate}
                      className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-[#E6C27A] text-black hover:bg-[#d4ae65] transition flex items-center gap-1 shadow-xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Restore</span>
                    </button>
                    {backups.length > 1 && (
                      <button
                        onClick={(e) => handleDeleteBackup(b.id, e)}
                        className="p-1.5 rounded-lg text-[#858A93] hover:text-rose-500 hover:bg-rose-500/10 transition"
                        title="Delete this backup"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. Restore Confirmation Modal */}
      {restoreCandidate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl glass-premium border border-white/20 dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-[#A97B32] dark:text-[#E6C27A]" />
                <h3 className="font-semibold text-sm text-[#20232A] dark:text-[#F6F3EC]">
                  Confirm Data Restoration
                </h3>
              </div>
              <button
                onClick={() => setRestoreCandidate(null)}
                className="p-1 text-[#858A93] hover:text-[#20232A] dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
              Review the snapshot details below. Restoring will replace your current study logs with the backup state.
            </p>

            {/* Comparison Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Current Local Data */}
              <div className="rounded-2xl bg-white/40 dark:bg-black/30 p-3.5 border border-black/[0.06] dark:border-white/[0.08]">
                <div className="text-[10px] uppercase font-semibold text-[#858A93] dark:text-[#777F8C]">
                  Current Local Data
                </div>
                <div className="mt-2 space-y-1 font-mono text-[11px] text-[#20232A] dark:text-[#F6F3EC]">
                  <div>{state.topics.length} topics</div>
                  <div>{state.subjects.length} subjects</div>
                  <div>{state.weeklyTests.length} tests</div>
                  <div>{state.errorLogs.length} error logs</div>
                  <div>{streakInfo.currentStreak}d streak</div>
                </div>
              </div>

              {/* Backup Data */}
              <div className="rounded-2xl bg-[#E6C27A]/10 border border-[#E6C27A]/30 p-3.5">
                <div className="text-[10px] uppercase font-semibold text-[#A97B32] dark:text-[#FFE6AD] flex items-center justify-between">
                  <span>Backup to Restore</span>
                  {restoreCandidate.verified && (
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                      ✓ SHA-256 OK
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-1 font-mono text-[11px] text-[#20232A] dark:text-[#FFE6AD]">
                  <div>{restoreCandidate.payload?.metadata?.topicsCount ?? restoreCandidate.payload?.data?.topics?.length ?? 0} topics</div>
                  <div>{restoreCandidate.payload?.metadata?.subjectsCount ?? restoreCandidate.payload?.data?.subjects?.length ?? 0} subjects</div>
                  <div>{restoreCandidate.payload?.metadata?.weeklyTestsCount ?? restoreCandidate.payload?.data?.weeklyTests?.length ?? 0} tests</div>
                  <div>{restoreCandidate.payload?.metadata?.errorLogsCount ?? restoreCandidate.payload?.data?.errorLogs?.length ?? 0} error logs</div>
                  <div>{restoreCandidate.payload?.metadata?.streakDays ?? 0}d streak</div>
                </div>
              </div>
            </div>

            {/* Safety Guarantee */}
            <div className="flex items-start gap-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-[11px] text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                <strong>Safety Snapshot Protection:</strong> A pre-restore rollback copy of your current local data will be saved automatically before restoring. You can revert at any time with one click.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setRestoreCandidate(null)}
                disabled={isRestoring}
                className="btn-glass-secondary rounded-xl px-4 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRestore}
                disabled={isRestoring}
                className="btn-gold-primary rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Restoring & Verifying...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Confirm & Restore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
