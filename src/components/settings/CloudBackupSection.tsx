import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  deleteBackupFromDrive,
  subscribeToCloudConnection,
  CloudConnectionInfo,
} from '../../services/googleDriveService';
import { cloudBackupManager } from '../../services/cloudBackupManager';
import {
  createSafetySnapshot,
  getSafetySnapshot,
  clearSafetySnapshot,
} from '../../services/safetySnapshotService';
import {
  CloudBackupSummary,
  AurelisCloudBackup,
  SafetySnapshot,
  CloudConnectionState,
  AutoBackupSyncStatus,
} from '../../types';
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
  WifiOff,
  Sparkles,
} from 'lucide-react';

export const CloudBackupSection: React.FC = () => {
  const { state, updateSettings, streakInfo, restoreAppState } = useApp();
  const { t } = useI18n();

  // Truthful Google Drive Connection State
  const [connectionInfo, setConnectionInfo] = useState<CloudConnectionInfo>({
    state: 'initializing',
    user: null,
    email: null,
    hasValidToken: false,
  });

  // Centralized Automatic Backup Sync State
  const [syncStatus, setSyncStatus] = useState<AutoBackupSyncStatus>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('All changes saved locally.');

  // UI operation states
  const [isManualBackingUp, setIsManualBackingUp] = useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);

  // History & List
  const [backups, setBackups] = useState<CloudBackupSummary[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Restore Modal State
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string | null>(null);
  const [downloadedBackup, setDownloadedBackup] = useState<{
    backup: AurelisCloudBackup;
    verified: boolean;
  } | null>(null);
  const [isDownloadingCandidate, setIsDownloadingCandidate] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Safety Snapshot State (for 1-click rollback)
  const [existingSnapshot, setExistingSnapshot] = useState<SafetySnapshot | null>(() =>
    getSafetySnapshot()
  );

  // 1. Subscribe to Truthful Connection State
  useEffect(() => {
    const unsubscribe = subscribeToCloudConnection((info) => {
      setConnectionInfo(info);
      if (info.state === 'connected') {
        // Trigger any pending background backup
        cloudBackupManager.triggerPendingBackup();
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Subscribe to Centralized Cloud Backup Manager Sync Status
  useEffect(() => {
    const unsubscribe = cloudBackupManager.subscribe((status, message) => {
      setSyncStatus(status);
      setSyncMessage(message);
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

  // Connect / Reauthorize Google Drive
  const handleConnect = async () => {
    try {
      setOperationError(null);
      const { user } = await connectGoogleDrive();
      setConnectionInfo({
        state: 'connected',
        user,
        email: user.email || 'Google Account',
        hasValidToken: true,
      });
      setOperationSuccess('Google Drive connected successfully.');
      setTimeout(() => setOperationSuccess(null), 3500);

      // Trigger any pending changes
      cloudBackupManager.triggerPendingBackup();
    } catch (err: any) {
      console.error('Google Drive connection failed:', err);
      setOperationError(err.message || 'Failed to authenticate with Google Drive.');
    }
  };

  // Disconnect Google Drive
  const handleDisconnect = async () => {
    try {
      await disconnectGoogleDrive();
      setConnectionInfo({
        state: 'signed_out',
        user: null,
        email: null,
        hasValidToken: false,
      });
      setBackups([]);
      setIsHistoryOpen(false);
      setOperationSuccess('Google Drive disconnected.');
      setTimeout(() => setOperationSuccess(null), 2500);
    } catch (err: any) {
      console.error('Failed to disconnect Google Drive:', err);
      setOperationError(err.message || 'Failed to disconnect.');
    }
  };

  // Load list of backups from Drive
  const loadHistory = useCallback(async () => {
    if (connectionInfo.state !== 'connected') return;
    try {
      setIsLoadingHistory(true);
      const list = await listBackupsFromDrive();
      setBackups(list);
    } catch (err: any) {
      console.warn('Failed to fetch backup history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [connectionInfo.state]);

  // Back Up Now Action (Manual)
  const handleBackupNow = async () => {
    if (connectionInfo.state !== 'connected') {
      await handleConnect();
      return;
    }

    try {
      setIsManualBackingUp(true);
      setOperationError(null);
      const success = await cloudBackupManager.executeBackup(state, streakInfo.currentStreak, true);

      if (success) {
        setOperationSuccess('Backup completed and verified on Google Drive.');
        setTimeout(() => setOperationSuccess(null), 3500);
        loadHistory();
      }
    } catch (err: any) {
      setOperationError(err.message || 'Backup failed.');
    } finally {
      setIsManualBackingUp(false);
    }
  };

  // Open Restore Flow ("Restore Now" button click)
  const handleRestoreNowClick = async () => {
    if (connectionInfo.state !== 'connected') {
      // Guide user to connect / reauthorize first
      await handleConnect();
      return;
    }

    try {
      setIsLoadingBackups(true);
      setOperationError(null);
      const list = await listBackupsFromDrive();
      setBackups(list);

      if (list.length === 0) {
        setOperationError('No cloud backups found on Google Drive. Create a backup first.');
        return;
      }

      // Default to most recent backup
      const latest = list[0];
      setSelectedBackupId(latest.id);
      setIsRestoreModalOpen(true);

      // Pre-download and verify the selected candidate
      await fetchCandidateDetails(latest.id);
    } catch (err: any) {
      setOperationError(err.message || 'Failed to retrieve backups from Google Drive.');
    } finally {
      setIsLoadingBackups(false);
    }
  };

  // Fetch candidate backup details for comparison
  const fetchCandidateDetails = async (fileId: string) => {
    try {
      setIsDownloadingCandidate(true);
      const result = await downloadBackupFromDrive(fileId);
      setDownloadedBackup(result);
    } catch (err: any) {
      setOperationError(`Could not inspect backup: ${err.message || 'Download error'}`);
      setDownloadedBackup(null);
    } finally {
      setIsDownloadingCandidate(false);
    }
  };

  // When student changes the selected restore point in the modal
  const handleSelectRestorePoint = async (fileId: string) => {
    setSelectedBackupId(fileId);
    await fetchCandidateDetails(fileId);
  };

  // Execute restore safely with instant in-memory update (no manual page reload)
  const handleConfirmRestore = async () => {
    if (!downloadedBackup?.backup?.data) return;

    try {
      setIsRestoring(true);

      // 1. Create a local safety snapshot before overwriting
      const snapshot = createSafetySnapshot(
        state,
        `Pre-restore safety snapshot taken on ${formatDate(new Date().toISOString())}`
      );
      setExistingSnapshot(snapshot);

      // 2. Safely apply backup to AppState and localStorage without page reload
      const success = restoreAppState(downloadedBackup.backup.data);

      if (success) {
        setOperationSuccess('Study data restored successfully from Google Drive!');
        setIsRestoreModalOpen(false);
        setDownloadedBackup(null);
        setTimeout(() => setOperationSuccess(null), 4000);
      } else {
        throw new Error('Failed to parse and apply study records.');
      }
    } catch (err: any) {
      alert(`Restoration failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // Revert to safety snapshot (1-click rollback, no page reload)
  const handleRevertSnapshot = () => {
    if (!existingSnapshot) return;
    if (
      window.confirm(
        `Revert to the safety snapshot from ${formatDate(
          existingSnapshot.timestamp
        )}? This will restore your study records to the state immediately before your cloud restoration.`
      )
    ) {
      restoreAppState(existingSnapshot.state);
      clearSafetySnapshot();
      setExistingSnapshot(null);
      setOperationSuccess('Reverted successfully to pre-restore study state.');
      setTimeout(() => setOperationSuccess(null), 3500);
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
      if (selectedBackupId === fileId) {
        const remaining = backups.filter((b) => b.id !== fileId);
        if (remaining.length > 0) {
          handleSelectRestorePoint(remaining[0].id);
        } else {
          setIsRestoreModalOpen(false);
        }
      }
    } catch (err: any) {
      alert(`Could not delete backup: ${err.message || 'Unknown error'}`);
    }
  };

  // Auto-backup toggle
  const toggleAutoBackup = () => {
    const nextVal = !state.settings.autoCloudBackupEnabled;
    updateSettings({ autoCloudBackupEnabled: nextVal });
    if (nextVal) {
      cloudBackupManager.notifyDataChanged(state, streakInfo.currentStreak);
    }
  };

  // Selected backup candidate summary
  const selectedSummary = backups.find((b) => b.id === selectedBackupId);

  return (
    <div className="space-y-4">
      {/* 1. Operation Notice / Success Banner */}
      {operationSuccess && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-fadeIn">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{operationSuccess}</span>
        </div>
      )}

      {operationError && (
        <div className="flex items-center gap-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3 text-xs text-rose-500 font-medium animate-fadeIn">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{operationError}</span>
        </div>
      )}

      {/* 2. Safety Snapshot Rollback Banner if available */}
      {existingSnapshot && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl bg-[#E6C27A]/10 border border-[#E6C27A]/30 p-3.5 animate-fadeIn">
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

      {/* 3. Account & Connection Status Card */}
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

                {/* Truthful Connection States */}
                {connectionInfo.state === 'initializing' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                    Checking Google Drive...
                  </span>
                )}

                {connectionInfo.state === 'connected' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Connected
                  </span>
                )}

                {connectionInfo.state === 'reauth_required' && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <AlertCircle className="h-2.5 w-2.5" />
                    Authorization Required
                  </span>
                )}

                {connectionInfo.state === 'signed_out' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                    Not connected
                  </span>
                )}

                {connectionInfo.state === 'error' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    Connection error
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#858A93] dark:text-[#777F8C] mt-0.5 font-medium">
                {connectionInfo.email || 'Sign in with Google to sync study data across your devices'}
              </p>
            </div>
          </div>

          {/* Connect / Disconnect / Reauthorize Buttons */}
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            {connectionInfo.state === 'connected' ? (
              <button
                onClick={handleDisconnect}
                className="btn-glass-secondary rounded-xl px-3.5 py-1.5 text-xs text-[#858A93] hover:text-rose-500 hover:border-rose-500/30 transition"
              >
                Disconnect
              </button>
            ) : connectionInfo.state === 'reauth_required' ? (
              <button
                onClick={handleConnect}
                className="btn-gold-primary rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-xs transition"
              >
                <Cloud className="h-3.5 w-3.5" />
                <span>Reauthorize Google Drive</span>
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connectionInfo.state === 'initializing'}
                className="btn-gold-primary rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 shadow-xs transition"
              >
                <Cloud className="h-3.5 w-3.5" />
                <span>Connect Google Drive</span>
              </button>
            )}
          </div>
        </div>

        {/* Informative Note for reauth_required */}
        {connectionInfo.state === 'reauth_required' && (
          <div className="mt-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
            <span>
              Google Drive access authorization requires refreshing for security. Your previous cloud
              backups remain completely safe in your account. Click &quot;Reauthorize Google Drive&quot;
              above to resume automatic syncing.
            </span>
          </div>
        )}

        {/* Private appDataFolder note */}
        <div className="mt-3 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center gap-2 text-[10.5px] text-[#686D77] dark:text-[#858A93]">
          <Lock className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
          <span>
            Backups are stored inside Google Drive&apos;s private{' '}
            <strong className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              appDataFolder
            </strong>
            . Hidden from normal Google Drive folders to prevent accidental deletion.
          </span>
        </div>
      </div>

      {/* 4. Backup Status, Centralized Auto-Backup & Controls */}
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
              Auto-Backup After Changes
            </span>
            <button
              type="button"
              onClick={toggleAutoBackup}
              title="Toggle automatic cloud backup after study changes"
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                state.settings.autoCloudBackupEnabled
                  ? 'bg-[#A97B32] dark:bg-[#E6C27A]'
                  : 'bg-zinc-300 dark:bg-zinc-700'
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

        {/* Live Automatic Sync Status Banner */}
        <div className="flex items-center gap-2.5 rounded-xl bg-white/40 dark:bg-black/30 border border-black/[0.04] dark:border-white/[0.06] px-3.5 py-2.5 text-[11px]">
          {syncStatus === 'uploading' ? (
            <RefreshCw className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] animate-spin shrink-0" />
          ) : syncStatus === 'offline' ? (
            <WifiOff className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          ) : syncStatus === 'reauth_required' ? (
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
          ) : syncStatus === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          ) : syncStatus === 'preparing' ? (
            <Clock className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
          )}

          <div className="flex-1 truncate">
            <span className="font-medium text-[#20232A] dark:text-[#F6F3EC]">{syncMessage}</span>
          </div>

          {cloudBackupManager.hasPendingBackup() && (
            <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 shrink-0">
              Pending Sync
            </span>
          )}
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Metric 1: Last Successful Backup */}
          <div className="rounded-xl bg-white/40 dark:bg-black/25 p-3 border border-black/[0.04] dark:border-white/[0.05]">
            <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase tracking-wider font-semibold">
              Last Cloud Backup
            </div>
            <div className="mt-1 font-medium text-xs text-[#20232A] dark:text-[#F6F3EC] flex items-center gap-1.5 truncate">
              <Clock className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
              <span className="truncate">{formatDate(state.settings.lastCloudBackupDate)}</span>
            </div>
          </div>

          {/* Metric 2: Result & Verification */}
          <div className="rounded-xl bg-white/40 dark:bg-black/25 p-3 border border-black/[0.04] dark:border-white/[0.05]">
            <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase tracking-wider font-semibold">
              Integrity & Verification
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
                <span className="text-[#858A93] dark:text-[#777F8C] truncate">No backup yet</span>
              )}
            </div>
          </div>

          {/* Metric 3: Size & Restore Check */}
          <div className="rounded-xl bg-white/40 dark:bg-black/25 p-3 border border-black/[0.04] dark:border-white/[0.05]">
            <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] uppercase tracking-wider font-semibold">
              Latest Size & Mode
            </div>
            <div className="mt-1 font-medium text-xs text-[#20232A] dark:text-[#F6F3EC] flex items-center gap-1.5 truncate">
              <HardDrive className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A] shrink-0" />
              <span className="font-mono">{formatBytes(state.settings.lastCloudBackupSize)}</span>
              <span className="text-[10px] text-[#858A93] dark:text-[#777F8C] truncate">
                • {state.settings.autoCloudBackupEnabled ? 'Auto-Sync' : 'Manual'}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons: "Back Up Now" and "Restore Now" placed directly beside each other */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
          {/* Button 1: Back Up Now */}
          <button
            onClick={handleBackupNow}
            disabled={
              isManualBackingUp ||
              isRestoring ||
              connectionInfo.state === 'initializing'
            }
            className="btn-gold-primary rounded-xl px-4 py-2.5 font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            {isManualBackingUp ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Backing up...</span>
              </>
            ) : (
              <>
                <CloudUpload className="h-3.5 w-3.5" />
                <span>Back Up Now</span>
              </>
            )}
          </button>

          {/* Button 2: Restore Now (Directly beside Back Up Now with consistent hierarchy) */}
          <button
            onClick={handleRestoreNowClick}
            disabled={
              isManualBackingUp ||
              isRestoring ||
              isLoadingBackups ||
              connectionInfo.state === 'initializing'
            }
            className="btn-glass-secondary rounded-xl px-4 py-2.5 font-semibold text-xs flex items-center justify-center gap-2 transition text-[#20232A] dark:text-[#FFE6AD] border border-[#E6C27A]/30 hover:bg-[#E6C27A]/15 shadow-xs"
          >
            {isLoadingBackups ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Retrieving Backups...</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5 text-[#A97B32] dark:text-[#E6C27A]" />
                <span>Restore Now</span>
              </>
            )}
          </button>

          {/* Button 3: View Backup History */}
          <button
            onClick={() => {
              const nextState = !isHistoryOpen;
              setIsHistoryOpen(nextState);
              if (nextState) loadHistory();
            }}
            disabled={connectionInfo.state !== 'connected'}
            className="btn-glass-secondary rounded-xl px-3.5 py-2.5 font-medium text-xs flex items-center justify-center gap-1.5 transition sm:ml-auto"
          >
            <History className="h-3.5 w-3.5" />
            <span>{isHistoryOpen ? 'Hide History' : 'Backup History'}</span>
            {isHistoryOpen ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* 5. Backup History Drawer / Accordion */}
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
            Up to 5 recent snapshots are retained automatically on Google Drive with verified SHA-256
            integrity checksums.
          </p>

          {isLoadingHistory ? (
            <div className="py-8 text-center text-xs text-[#858A93]">
              <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#A97B32] dark:text-[#E6C27A]" />
              Fetching backups from Google Drive...
            </div>
          ) : backups.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#858A93] dark:text-[#777F8C]">
              No cloud backups found on Google Drive yet. Tap &quot;Back Up Now&quot; to create your
              first cloud snapshot.
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
                          {b.metadata.topicsCount} topics • {b.metadata.subjectsCount} subjects •{' '}
                          {b.metadata.streakDays}d streak
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <button
                      onClick={() => {
                        setSelectedBackupId(b.id);
                        setIsRestoreModalOpen(true);
                        fetchCandidateDetails(b.id);
                      }}
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

      {/* 6. Restore Confirmation & Selection Modal */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl glass-premium border border-white/20 dark:border-white/10 p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-[#A97B32] dark:text-[#E6C27A]" />
                <h3 className="font-semibold text-sm text-[#20232A] dark:text-[#F6F3EC]">
                  Restore Study Data
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setDownloadedBackup(null);
                }}
                className="p-1 text-[#858A93] hover:text-[#20232A] dark:hover:text-white rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Select Restore Point if multiple */}
              {backups.length > 1 && (
                <div>
                  <label className="text-[11px] font-semibold text-[#20232A] dark:text-[#F6F3EC] block mb-1">
                    Select Restore Point:
                  </label>
                  <select
                    value={selectedBackupId || ''}
                    onChange={(e) => handleSelectRestorePoint(e.target.value)}
                    className="w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
                  >
                    {backups.map((b, idx) => (
                      <option key={b.id} value={b.id}>
                        {formatDate(b.createdTime)} {idx === 0 ? '(Latest)' : ''} —{' '}
                        {formatBytes(b.size)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Downloading Candidate Status */}
              {isDownloadingCandidate ? (
                <div className="py-6 text-center text-xs text-[#858A93]">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2 text-[#A97B32] dark:text-[#E6C27A]" />
                  Retrieving and verifying backup data from Google Drive...
                </div>
              ) : downloadedBackup ? (
                <>
                  <p className="text-xs text-[#858A93] dark:text-[#777F8C]">
                    Review the side-by-side comparison below. Restoring will apply this cloud
                    snapshot to your study workspace.
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

                    {/* Cloud Backup To Restore */}
                    <div className="rounded-2xl bg-[#E6C27A]/10 border border-[#E6C27A]/30 p-3.5">
                      <div className="text-[10px] uppercase font-semibold text-[#A97B32] dark:text-[#FFE6AD] flex items-center justify-between">
                        <span>Selected Cloud Backup</span>
                        {downloadedBackup.verified && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">
                            ✓ SHA-256 OK
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1 font-mono text-[11px] text-[#20232A] dark:text-[#FFE6AD]">
                        <div>
                          {downloadedBackup.backup.metadata?.topicsCount ??
                            downloadedBackup.backup.data?.topics?.length ??
                            0}{' '}
                          topics
                        </div>
                        <div>
                          {downloadedBackup.backup.metadata?.subjectsCount ??
                            downloadedBackup.backup.data?.subjects?.length ??
                            0}{' '}
                          subjects
                        </div>
                        <div>
                          {downloadedBackup.backup.metadata?.weeklyTestsCount ??
                            downloadedBackup.backup.data?.weeklyTests?.length ??
                            0}{' '}
                          tests
                        </div>
                        <div>
                          {downloadedBackup.backup.metadata?.errorLogsCount ??
                            downloadedBackup.backup.data?.errorLogs?.length ??
                            0}{' '}
                          error logs
                        </div>
                        <div>
                          {downloadedBackup.backup.metadata?.streakDays ?? 0}d streak
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Safety Guarantee */}
                  <div className="flex items-start gap-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3 text-[11px] text-blue-600 dark:text-blue-400">
                    <ShieldCheck className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      <strong>Safety Snapshot Guarantee:</strong> A rollback copy of your current
                      local study state will be created automatically before applying this backup.
                      You can undo this restoration at any time with one click.
                    </span>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] shrink-0">
              <button
                onClick={() => {
                  setIsRestoreModalOpen(false);
                  setDownloadedBackup(null);
                }}
                disabled={isRestoring}
                className="btn-glass-secondary rounded-xl px-4 py-2 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                disabled={isRestoring || isDownloadingCandidate || !downloadedBackup}
                className="btn-gold-primary rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                {isRestoring ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Restoring Workspace...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Confirm & Restore Now</span>
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
