/**
 * AURELIS Centralized Cloud Backup Manager
 *
 * Implements:
 * 1. Automatic detection of all persistent data changes across the entire app.
 * 2. Intelligent debouncing (2.5s) and batching of rapid sequences.
 * 3. Local-first guarantee: local persistence is never blocked or dependent on cloud availability.
 * 4. Offline queueing: marks pending in localStorage across page reloads and retries on reconnection/focus.
 * 5. Concurrency control: mutex lock prevents conflicting overlapping uploads.
 * 6. Hash-based diffing: prevents duplicate uploads when state has not actually changed.
 */

import { AppState, AutoBackupSyncStatus, UserSettings } from '../types';
import {
  uploadBackupToDrive,
  getCachedAccessToken,
  ensureValidAccessToken,
} from './googleDriveService';

const PENDING_BACKUP_STORAGE_KEY = 'aurelis_pending_cloud_backup';
const LAST_BACKUP_HASH_STORAGE_KEY = 'aurelis_last_cloud_backup_hash';

type SyncSubscriber = (status: AutoBackupSyncStatus, message: string) => void;

class CloudBackupManager {
  private isBackingUp = false;
  private debounceTimer: any = null;
  private currentStatus: AutoBackupSyncStatus = 'idle';
  private currentMessage = 'All changes saved locally.';
  private subscribers: Set<SyncSubscriber> = new Set();
  private lastBackedUpHash: string | null = null;
  private latestStateRef: { state: AppState; streakDays: number } | null = null;
  private onSettingsUpdatedCallback?: (updates: Partial<UserSettings>) => void;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.lastBackedUpHash = localStorage.getItem(LAST_BACKUP_HASH_STORAGE_KEY);
      } catch {
        this.lastBackedUpHash = null;
      }

      // Check for pending backup from previous session
      if (this.hasPendingBackup()) {
        this.currentStatus = 'pending';
        this.currentMessage = 'Pending cloud sync from previous session.';
      }

      // Setup network listener for automatic reconnect sync
      window.addEventListener('online', () => {
        this.handleNetworkReconnect();
      });
    }
  }

  public setSettingsUpdateHandler(handler: (updates: Partial<UserSettings>) => void) {
    this.onSettingsUpdatedCallback = handler;
  }

  public subscribe(callback: SyncSubscriber): () => void {
    this.subscribers.add(callback);
    callback(this.currentStatus, this.currentMessage);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private notify(status: AutoBackupSyncStatus, message: string) {
    this.currentStatus = status;
    this.currentMessage = message;
    this.subscribers.forEach((cb) => {
      try {
        cb(status, message);
      } catch (err) {
        console.error('Error in backup sync subscriber:', err);
      }
    });
  }

  public getStatus(): { status: AutoBackupSyncStatus; message: string } {
    return { status: this.currentStatus, message: this.currentMessage };
  }

  public hasPendingBackup(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(PENDING_BACKUP_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private setPendingBackup(isPending: boolean) {
    if (typeof window === 'undefined') return;
    try {
      if (isPending) {
        localStorage.setItem(PENDING_BACKUP_STORAGE_KEY, 'true');
      } else {
        localStorage.removeItem(PENDING_BACKUP_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to update pending backup flag in localStorage:', err);
    }
  }

  public setLastBackedUpHash(hash: string | null) {
    this.lastBackedUpHash = hash;
    if (typeof window !== 'undefined') {
      try {
        if (hash) {
          localStorage.setItem(LAST_BACKUP_HASH_STORAGE_KEY, hash);
        } else {
          localStorage.removeItem(LAST_BACKUP_HASH_STORAGE_KEY);
        }
      } catch {}
    }
  }

  /**
   * Deterministic hash/string of persistent data to prevent unnecessary identical uploads.
   */
  public computeStateHash(state: AppState): string {
    const dataToCompare = {
      subjects: state.subjects,
      topics: state.topics,
      weeklyTests: state.weeklyTests,
      errorLogs: state.errorLogs,
      settings: {
        studentName: state.settings.studentName,
        targetExam: state.settings.targetExam,
        targetDailyTopics: state.settings.targetDailyTopics,
        revisionIntervals: state.settings.revisionIntervals,
        language: state.settings.language,
      },
      studyDaysHistory: state.studyDaysHistory,
    };
    return JSON.stringify(dataToCompare);
  }

  /**
   * Central entry point called whenever persistent state changes.
   * Debounces by 2.5 seconds to batch rapid edits together.
   */
  public notifyDataChanged(state: AppState, streakDays: number): void {
    this.latestStateRef = { state, streakDays };

    // If auto backup is disabled by user, only maintain local-first state
    if (!state.settings.autoCloudBackupEnabled) {
      this.notify('idle', 'All changes saved locally.');
      return;
    }

    const stateHash = this.computeStateHash(state);
    if (this.lastBackedUpHash && stateHash === this.lastBackedUpHash) {
      // Content has not changed compared to last cloud upload
      if (!this.hasPendingBackup()) {
        this.notify('success', 'All changes saved locally & synced to cloud.');
      }
      return;
    }

    // Mark pending in localStorage for crash/reload resilience
    this.setPendingBackup(true);
    this.notify('preparing', 'All changes saved locally. Preparing automatic backup...');

    // Debounce timer (2500ms)
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.debounceTimer = null;
      if (this.latestStateRef) {
        this.executeBackup(this.latestStateRef.state, this.latestStateRef.streakDays, false);
      }
    }, 2500);
  }

  /**
   * Performs an immediate or scheduled cloud backup with full error handling and offline queueing.
   */
  public async executeBackup(
    state: AppState,
    streakDays: number,
    isManual = false
  ): Promise<boolean> {
    if (this.isBackingUp) {
      // Avoid concurrent uploads; mark pending so it queues
      this.setPendingBackup(true);
      return false;
    }

    // Check internet connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setPendingBackup(true);
      this.notify('offline', 'Internet unavailable. Backup will retry when connected.');
      return false;
    }

    // Check active token or obtain refreshed token from backend / silent renewal
    let token = getCachedAccessToken();
    if (!token) {
      token = await ensureValidAccessToken().catch(() => null);
    }

    if (!token) {
      this.setPendingBackup(true);
      this.notify('reauth_required', 'Google Drive authorization required to sync changes.');
      return false;
    }

    this.isBackingUp = true;
    this.notify('uploading', isManual ? 'Backing up to Google Drive...' : 'Uploading changes to Google Drive...');

    try {
      const { summary } = await uploadBackupToDrive(state, streakDays);
      const newHash = this.computeStateHash(state);

      this.setLastBackedUpHash(newHash);
      this.setPendingBackup(false);
      this.notify('success', 'Backup completed and verified on Google Drive.');

      if (this.onSettingsUpdatedCallback) {
        this.onSettingsUpdatedCallback({
          lastCloudBackupDate: summary.createdTime,
          lastCloudBackupStatus: 'success',
          lastCloudBackupSize: summary.size,
          lastCloudBackupError: undefined,
          lastCloudBackupId: summary.id,
        });
      }

      return true;
    } catch (err: any) {
      console.warn('Cloud backup execution error:', err);
      const isAuthError = err.message?.includes('AUTH_REQUIRED') || err.message?.includes('401');

      this.setPendingBackup(true);

      if (isAuthError) {
        this.notify('reauth_required', 'Google Drive authorization required to sync.');
      } else {
        this.notify('error', `Cloud backup error: ${err.message || 'Network issue'}. Retrying later.`);
      }

      if (this.onSettingsUpdatedCallback) {
        this.onSettingsUpdatedCallback({
          lastCloudBackupStatus: 'failed',
          lastCloudBackupError: err.message || 'Backup failed',
        });
      }

      return false;
    } finally {
      this.isBackingUp = false;
    }
  }

  /**
   * Re-triggers pending backups when network returns or user reconnects Google Drive.
   */
  public triggerPendingBackup(): void {
    if (this.latestStateRef && this.hasPendingBackup()) {
      this.executeBackup(this.latestStateRef.state, this.latestStateRef.streakDays, false);
    }
  }

  private handleNetworkReconnect() {
    if (this.hasPendingBackup()) {
      this.notify('preparing', 'Internet restored. Retrying pending cloud backup...');
      setTimeout(() => this.triggerPendingBackup(), 1500);
    }
  }
}

export const cloudBackupManager = new CloudBackupManager();
