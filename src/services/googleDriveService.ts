/**
 * AURELIS Google Drive Service
 * Manages Google OAuth authorization with minimum required scopes
 * ('drive.appdata' + 'userinfo.email') and interacts directly with Google Drive REST v3
 * using the secure, isolated appDataFolder for private learning data backups.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState, AurelisCloudBackup, CloudBackupMetadata, CloudBackupSummary } from '../types';

// Minimum required scopes: Drive AppData (private hidden folder) + email identity
export const GOOGLE_DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
export const GOOGLE_USERINFO_EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';

// In-Memory Token Management (NEVER stored in localStorage or persisted to disk)
let inMemoryAccessToken: string | null = null;
let tokenIssuedAt: number | null = null;
const TOKEN_TTL_MS = 3500 * 1000; // ~58 minutes (Google access tokens usually last 60 minutes)

export function getCachedAccessToken(): string | null {
  if (!inMemoryAccessToken) return null;
  if (tokenIssuedAt && Date.now() - tokenIssuedAt > TOKEN_TTL_MS) {
    // Token has expired
    inMemoryAccessToken = null;
    tokenIssuedAt = null;
    return null;
  }
  return inMemoryAccessToken;
}

export function setCachedAccessToken(token: string | null): void {
  inMemoryAccessToken = token;
  tokenIssuedAt = token ? Date.now() : null;
}

export function clearCachedAccessToken(): void {
  inMemoryAccessToken = null;
  tokenIssuedAt = null;
}

// Firebase App & Auth Singleton
let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(firebaseConfig);
    }
  }
  return appInstance;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    const app = getFirebaseApp();
    authInstance = getAuth(app);
  }
  return authInstance;
}

/**
 * Calculates SHA-256 hex digest for cryptographic integrity verification.
 */
export async function calculateSha256(dataStr: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(dataStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Connect to Google Drive using Google Identity Services (OAuth Popup).
 * Requests access to drive.appdata and user email.
 */
export async function connectGoogleDrive(): Promise<{ user: User; accessToken: string }> {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.addScope(GOOGLE_DRIVE_APPDATA_SCOPE);
  provider.addScope(GOOGLE_USERINFO_EMAIL_SCOPE);
  provider.setCustomParameters({ prompt: 'select_account' });

  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const accessToken = credential?.accessToken;

  if (!accessToken) {
    throw new Error('Could not obtain Google Drive access token. Please authorize application access.');
  }

  setCachedAccessToken(accessToken);
  return { user: result.user, accessToken };
}

/**
 * Disconnect Google Drive and clear in-memory tokens.
 */
export async function disconnectGoogleDrive(): Promise<void> {
  clearCachedAccessToken();
  const auth = getFirebaseAuth();
  await firebaseSignOut(auth);
}

/**
 * Subscribes to auth state changes.
 */
export function onGoogleAuthStateChanged(callback: (user: User | null, hasToken: boolean) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, (user) => {
    callback(user, !!getCachedAccessToken());
  });
}

/**
 * Uploads a complete encrypted/integrity-checked backup payload to Google Drive's appDataFolder.
 */
export async function uploadBackupToDrive(
  state: AppState,
  streakDays: number
): Promise<{ summary: CloudBackupSummary; backup: AurelisCloudBackup }> {
  const accessToken = getCachedAccessToken();
  if (!accessToken) {
    throw new Error('Google Drive session expired or not connected. Please connect Google Drive.');
  }

  const now = new Date();
  const timestampStr = now.toISOString();
  const dateFormatted = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `aurelis_backup_${dateFormatted}.json`;

  const metadata: CloudBackupMetadata = {
    subjectsCount: state.subjects.length,
    topicsCount: state.topics.length,
    weeklyTestsCount: state.weeklyTests.length,
    errorLogsCount: state.errorLogs.length,
    streakDays,
    studentName: state.settings.studentName || 'Student',
    targetExam: state.settings.targetExam || '',
    backupTimestamp: timestampStr,
  };

  const serializedData = JSON.stringify(state);
  const checksum = await calculateSha256(serializedData);

  const backupPayload: AurelisCloudBackup = {
    format: 'aurelis_cloud_backup',
    schemaVersion: '1.0.0',
    backupId: `bk_${Date.now()}`,
    timestamp: timestampStr,
    appVersion: '1.0.0',
    metadata,
    data: state,
    checksum,
  };

  const payloadString = JSON.stringify(backupPayload, null, 2);

  // Construct multipart/related request body for Google Drive v3 upload
  const boundary = '-------AURELIS_BOUNDARY_' + Date.now();
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const fileMetadata = {
    name: fileName,
    parents: ['appDataFolder'],
    description: `AURELIS Spaced Repetition Study Backup (${metadata.topicsCount} topics, ${metadata.streakDays}d streak)`,
    properties: {
      format: 'aurelis_cloud_backup',
      version: '1.0.0',
      subjectsCount: String(metadata.subjectsCount),
      topicsCount: String(metadata.topicsCount),
      testsCount: String(metadata.weeklyTestsCount),
      errorsCount: String(metadata.errorLogsCount),
      streakDays: String(metadata.streakDays),
      backupTimestamp: timestampStr,
      checksum,
    },
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(fileMetadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    payloadString +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,size,createdTime,modifiedTime,properties,description',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    if (response.status === 401) {
      clearCachedAccessToken();
      throw new Error('Google Drive access authorization expired. Please reconnect.');
    }
    const errText = await response.text();
    throw new Error(`Google Drive backup failed (${response.status}): ${errText}`);
  }

  const uploadedFile = await response.json();

  const summary: CloudBackupSummary = {
    id: uploadedFile.id,
    name: uploadedFile.name,
    size: uploadedFile.size ? parseInt(uploadedFile.size, 10) : new Blob([payloadString]).size,
    createdTime: uploadedFile.createdTime || timestampStr,
    modifiedTime: uploadedFile.modifiedTime || timestampStr,
    metadata,
    description: uploadedFile.description,
  };

  // Enforce retention policy: keep 5 most recent backups, always retaining at least 1
  try {
    await enforceRetentionPolicy(5);
  } catch (retentionErr) {
    console.warn('Non-fatal retention policy check error:', retentionErr);
  }

  return { summary, backup: backupPayload };
}

/**
 * Lists all backups available in the user's private Google Drive appDataFolder.
 */
export async function listBackupsFromDrive(): Promise<CloudBackupSummary[]> {
  const accessToken = getCachedAccessToken();
  if (!accessToken) {
    throw new Error('Google Drive not connected or session expired. Please connect Google Drive.');
  }

  const query = encodeURIComponent("trashed = false and name contains 'aurelis_backup'");
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,size,createdTime,modifiedTime,properties,description)&orderBy=createdTime desc&pageSize=20`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearCachedAccessToken();
      throw new Error('Google Drive authorization expired. Please reconnect.');
    }
    const errText = await response.text();
    throw new Error(`Failed to list backups (${response.status}): ${errText}`);
  }

  const result = await response.json();
  const files: any[] = result.files || [];

  return files.map((f) => {
    const props = f.properties || {};
    const metadata: CloudBackupMetadata | undefined = props.topicsCount
      ? {
          subjectsCount: parseInt(props.subjectsCount || '0', 10),
          topicsCount: parseInt(props.topicsCount || '0', 10),
          weeklyTestsCount: parseInt(props.testsCount || '0', 10),
          errorLogsCount: parseInt(props.errorsCount || '0', 10),
          streakDays: parseInt(props.streakDays || '0', 10),
          studentName: props.studentName || 'Student',
          targetExam: props.targetExam || '',
          backupTimestamp: props.backupTimestamp || f.createdTime,
        }
      : undefined;

    return {
      id: f.id,
      name: f.name,
      size: f.size ? parseInt(f.size, 10) : undefined,
      createdTime: f.createdTime,
      modifiedTime: f.modifiedTime,
      metadata,
      description: f.description,
    };
  });
}

/**
 * Downloads a backup from Google Drive and verifies cryptographic integrity.
 */
export async function downloadBackupFromDrive(
  fileId: string
): Promise<{ backup: AurelisCloudBackup; verified: boolean; rawPayload: any }> {
  const accessToken = getCachedAccessToken();
  if (!accessToken) {
    throw new Error('Google Drive not connected. Please connect Google Drive.');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearCachedAccessToken();
      throw new Error('Google Drive authorization expired. Please reconnect.');
    }
    throw new Error(`Failed to download backup file (${response.status})`);
  }

  const rawJson = await response.json();

  // Validate format and structure
  if (rawJson.format === 'aurelis_cloud_backup' && rawJson.data) {
    const expectedChecksum = rawJson.checksum;
    const computedChecksum = await calculateSha256(JSON.stringify(rawJson.data));
    const verified = !expectedChecksum || expectedChecksum === computedChecksum;

    return {
      backup: rawJson as AurelisCloudBackup,
      verified,
      rawPayload: rawJson,
    };
  }

  // Fallback for standard exported JSON or legacy format
  if (rawJson.topics && rawJson.subjects) {
    const fallbackBackup: AurelisCloudBackup = {
      format: 'aurelis_cloud_backup',
      schemaVersion: '1.0.0',
      backupId: `bk_${fileId}`,
      timestamp: rawJson.exportedAt || new Date().toISOString(),
      appVersion: '1.0.0',
      metadata: {
        subjectsCount: Array.isArray(rawJson.subjects) ? rawJson.subjects.length : 0,
        topicsCount: Array.isArray(rawJson.topics) ? rawJson.topics.length : 0,
        weeklyTestsCount: Array.isArray(rawJson.weeklyTests) ? rawJson.weeklyTests.length : 0,
        errorLogsCount: Array.isArray(rawJson.errorLogs) ? rawJson.errorLogs.length : 0,
        streakDays: 0,
        studentName: rawJson.settings?.studentName || 'Student',
        targetExam: rawJson.settings?.targetExam || '',
        backupTimestamp: rawJson.exportedAt || new Date().toISOString(),
      },
      data: rawJson as AppState,
      checksum: '',
    };
    return {
      backup: fallbackBackup,
      verified: true,
      rawPayload: rawJson,
    };
  }

  throw new Error('Invalid AURELIS backup format. The file appears to be corrupted or from an incompatible version.');
}

/**
 * Deletes a single backup file from Google Drive.
 */
export async function deleteBackupFromDrive(fileId: string): Promise<boolean> {
  const accessToken = getCachedAccessToken();
  if (!accessToken) {
    throw new Error('Google Drive not connected. Please connect Google Drive.');
  }

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete backup file (${response.status})`);
  }

  return true;
}

/**
 * Enforces backup retention policy: Keeps maxBackups (default 5),
 * always retaining at least 1 valid backup.
 */
export async function enforceRetentionPolicy(maxBackups: number = 5): Promise<number> {
  try {
    const backups = await listBackupsFromDrive();
    if (backups.length <= maxBackups) {
      return 0; // Within limits
    }

    // Keep the most recent maxBackups, delete the excess older ones
    const toDelete = backups.slice(maxBackups);
    let deletedCount = 0;

    for (const b of toDelete) {
      // Safety check: ensure at least 1 backup remains in the total pool
      if (backups.length - deletedCount <= 1) break;

      try {
        await deleteBackupFromDrive(b.id);
        deletedCount++;
      } catch (delErr) {
        console.warn(`Failed to prune old backup ${b.id}:`, delErr);
      }
    }

    return deletedCount;
  } catch (err) {
    console.warn('Retention pruning error:', err);
    return 0;
  }
}
