/**
 * AURELIS Safety Snapshot Service
 * Protects student learning data by taking an atomic pre-restore snapshot
 * before importing or restoring from cloud backups, allowing immediate safe rollback.
 */

import { AppState, SafetySnapshot } from '../types';

const SNAPSHOT_STORAGE_KEY = 'aurelis_safety_snapshot_before_restore';

export function createSafetySnapshot(state: AppState, reason: string): SafetySnapshot {
  const snapshot: SafetySnapshot = {
    snapshotId: `snapshot_${Date.now()}`,
    timestamp: new Date().toISOString(),
    state: JSON.parse(JSON.stringify(state)),
    reason,
  };

  try {
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('Failed to store safety snapshot to localStorage:', err);
  }

  return snapshot;
}

export function getSafetySnapshot(): SafetySnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.snapshotId && parsed.state && parsed.timestamp) {
      return parsed as SafetySnapshot;
    }
  } catch (err) {
    console.warn('Error reading safety snapshot:', err);
  }
  return null;
}

export function clearSafetySnapshot(): void {
  try {
    localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear safety snapshot:', err);
  }
}
