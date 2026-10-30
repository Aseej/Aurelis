/**
 * AURELIS Google Drive Service
 * Manages Google OAuth authorization with minimum required scopes
 * ('drive.appdata' + 'userinfo.email') and interacts directly with Google Drive REST v3
 * using the secure, isolated appDataFolder for private learning data backups.
 *
 * Implements reliable session persistence, separate lifecycles for Firebase Auth
 * vs Google OAuth access tokens, silent token reacquisition, and explicit connection states.
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AppState,
  AurelisCloudBackup,
  CloudBackupMetadata,
  CloudBackupSummary,
  CloudConnectionState,
} from '../types';

// Minimum required scopes: Drive AppData (private hidden folder) + email identity
export const GOOGLE_DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
export const GOOGLE_USERINFO_EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email';

const DRIVE_SESSION_STORAGE_KEY = 'aurelis_drive_session_v1';
const CONNECTED_ACCOUNT_STORAGE_KEY = 'aurelis_drive_connected_account';

// Token state management with sessionStorage and backend session synchronization
let inMemoryAccessToken: string | null = null;
let tokenExpiresAt: number | null = null;

// Initialize from persistent browser session storage on module load (zero flash on refresh)
if (typeof window !== 'undefined') {
  try {
    const saved = sessionStorage.getItem(DRIVE_SESSION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.accessToken && parsed.expiresAt && Date.now() < parsed.expiresAt) {
        inMemoryAccessToken = parsed.accessToken;
        tokenExpiresAt = parsed.expiresAt;
      }
    }
  } catch (e) {
    console.warn('Could not restore drive session from sessionStorage:', e);
  }
}

export function getCachedAccessToken(): string | null {
  if (!inMemoryAccessToken) {
    if (typeof window !== 'undefined') {
      try {
        const saved = sessionStorage.getItem(DRIVE_SESSION_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.accessToken && parsed.expiresAt && Date.now() < parsed.expiresAt) {
            inMemoryAccessToken = parsed.accessToken;
            tokenExpiresAt = parsed.expiresAt;
            return inMemoryAccessToken;
          }
        }
      } catch {}
    }
    return null;
  }

  if (tokenExpiresAt && Date.now() >= tokenExpiresAt) {
    inMemoryAccessToken = null;
    tokenExpiresAt = null;
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(DRIVE_SESSION_STORAGE_KEY);
      } catch {}
    }
    return null;
  }

  return inMemoryAccessToken;
}

export function setCachedAccessToken(
  token: string | null,
  expiresAt?: number | null,
  user?: { uid?: string; email?: string | null; displayName?: string | null } | null
): void {
  inMemoryAccessToken = token;
  tokenExpiresAt = token ? (expiresAt || Date.now() + 3500 * 1000) : null;

  if (typeof window !== 'undefined') {
    try {
      if (token && tokenExpiresAt) {
        sessionStorage.setItem(
          DRIVE_SESSION_STORAGE_KEY,
          JSON.stringify({
            accessToken: token,
            expiresAt: tokenExpiresAt,
            email: user?.email,
            uid: user?.uid,
          })
        );
        if (user?.email) {
          localStorage.setItem(
            CONNECTED_ACCOUNT_STORAGE_KEY,
            JSON.stringify({ email: user.email, uid: user.uid })
          );
        }
      } else {
        sessionStorage.removeItem(DRIVE_SESSION_STORAGE_KEY);
      }
    } catch {}
  }

  // Synchronize to secure backend session storage
  if (token && user?.uid) {
    fetch('/api/drive/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        accessToken: token,
        expiresAt: tokenExpiresAt,
        scope: GOOGLE_DRIVE_APPDATA_SCOPE,
      }),
    }).catch((err) => console.warn('Non-fatal error syncing drive session to backend:', err));
  }
}

export function clearCachedAccessToken(): void {
  inMemoryAccessToken = null;
  tokenExpiresAt = null;
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(DRIVE_SESSION_STORAGE_KEY);
    } catch {}
  }
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
    // Explicitly configure browser persistence
    setPersistence(authInstance, browserLocalPersistence).catch((err) => {
      console.warn('Failed to set browserLocalPersistence on Firebase Auth:', err);
    });
  }
  return authInstance;
}

/**
 * Waits for Firebase's initial authentication-state resolution before
 * deciding whether a user is signed out or a session has expired.
 */
export async function waitForAuthReady(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (typeof (auth as any).authStateReady === 'function') {
    await (auth as any).authStateReady();
    return auth.currentUser;
  }
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
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
 * In-memory and backend token reacquisition helper.
 * Strictly non-interactive: never prompts or triggers popup windows.
 * Google OAuth popups are ONLY initiated when the user explicitly clicks 'Connect' or 'Reauthorize'.
 */
export async function attemptSilentTokenReacquisition(email?: string): Promise<string | null> {
  const cached = getCachedAccessToken();
  if (cached) return cached;

  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  let uid = user?.uid;
  if (!uid && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CONNECTED_ACCOUNT_STORAGE_KEY);
      if (saved) uid = JSON.parse(saved).uid;
    } catch {}
  }

  // Try backend token endpoint
  if (uid) {
    try {
      const res = await fetch(`/api/drive/token?uid=${encodeURIComponent(uid)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.accessToken && data.expiresAt && Date.now() < data.expiresAt) {
          setCachedAccessToken(data.accessToken, data.expiresAt, user || { uid, email: data.email || email });
          return data.accessToken;
        }
      }
    } catch {}

    // Try backend silent refresh endpoint if available
    try {
      const refreshRes = await fetch('/api/drive/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.accessToken && data.expiresAt && Date.now() < data.expiresAt) {
          setCachedAccessToken(data.accessToken, data.expiresAt, user || { uid, email: data.email || email });
          return data.accessToken;
        }
      }
    } catch {}
  }

  // Strictly non-interactive: never launch any popup, modal, or iframe prompt
  return null;
}

/**
 * Connect or re-authorize Google Drive using standard popup authorization.
 * Handles both new sign-in and re-acquiring an expired OAuth access token.
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

  const expiresAt = Date.now() + 3500 * 1000;
  setCachedAccessToken(accessToken, expiresAt, result.user);
  return { user: result.user, accessToken };
}

/**
 * Disconnect Google Drive and clear all tokens and sessions.
 */
export async function disconnectGoogleDrive(): Promise<void> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  const uid = user?.uid;

  clearCachedAccessToken();
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(CONNECTED_ACCOUNT_STORAGE_KEY);
    } catch {}
  }

  if (uid) {
    fetch('/api/drive/disconnect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid }),
    }).catch(() => {});
  }

  await firebaseSignOut(auth);
}

export interface CloudConnectionInfo {
  state: CloudConnectionState;
  user: User | null;
  email: string | null;
  hasValidToken: boolean;
  errorMessage?: string;
}

/**
 * Subscribes to truthful Google connection changes, respecting Firebase initialization,
 * backend session verification, and persistent access token caching.
 */
export function subscribeToCloudConnection(
  callback: (info: CloudConnectionInfo) => void
): () => void {
  const auth = getFirebaseAuth();
  let isMounted = true;

  // 1. Initial State: Initializing
  callback({
    state: 'initializing',
    user: null,
    email: null,
    hasValidToken: false,
  });

  const evaluateConnection = async (user: User | null) => {
    if (!isMounted) return;

    let savedAccount: any = null;
    try {
      const saved = localStorage.getItem(CONNECTED_ACCOUNT_STORAGE_KEY);
      if (saved) savedAccount = JSON.parse(saved);
    } catch {}

    const email = user?.email || savedAccount?.email || null;
    const uid = user?.uid || savedAccount?.uid || null;

    if (!user && !savedAccount?.uid) {
      callback({
        state: 'signed_out',
        user: null,
        email: null,
        hasValidToken: false,
      });
      return;
    }

    let token = getCachedAccessToken();

    // If not in memory, check backend token or refresh endpoint
    if (!token && uid) {
      token = await attemptSilentTokenReacquisition(email || undefined);
    }

    if (!isMounted) return;

    if (token) {
      callback({
        state: 'connected',
        user,
        email,
        hasValidToken: true,
      });
    } else {
      callback({
        state: 'reauth_required',
        user,
        email,
        hasValidToken: false,
      });
    }
  };

  // 2. Resolve initial auth readiness
  waitForAuthReady().then((initialUser) => {
    evaluateConnection(initialUser);
  });

  // 3. Listen to subsequent auth state changes
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    evaluateConnection(user);
  });

  return () => {
    isMounted = false;
    unsubscribe();
  };
}

/**
 * Ensures an active access token is available with automatic renewal.
 * Never initiates popups; throws AUTH_REQUIRED if user needs to connect/reauthorize.
 */
export async function ensureValidAccessToken(): Promise<string> {
  let token = getCachedAccessToken();
  if (token) return token;

  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  let uid = user?.uid;
  let email = user?.email || undefined;

  if (!uid && typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CONNECTED_ACCOUNT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        uid = parsed.uid;
        email = email || parsed.email;
      }
    } catch {}
  }

  // Try silent backend token/refresh retrieval
  if (uid || email) {
    token = await attemptSilentTokenReacquisition(email);
    if (token) return token;
  }

  throw new Error('AUTH_REQUIRED: Google Drive authorization expired or required. Please reconnect in Settings.');
}


/**
 * Uploads a complete encrypted/integrity-checked backup payload to Google Drive's appDataFolder.
 */
export async function uploadBackupToDrive(
  state: AppState,
  streakDays: number
): Promise<{ summary: CloudBackupSummary; backup: AurelisCloudBackup }> {
  const accessToken = await ensureValidAccessToken();

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
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired. Please reconnect.');
    }
    const errText = await response.text();
    throw new Error(`Google Drive backup upload failed (${response.status}): ${errText}`);
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
  const accessToken = await ensureValidAccessToken();

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
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired. Please reconnect.');
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
  const accessToken = await ensureValidAccessToken();

  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired. Please reconnect.');
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

  throw new Error('Invalid AURELIS backup format. The file appears to be corrupted or incompatible.');
}

/**
 * Deletes a single backup file from Google Drive.
 */
export async function deleteBackupFromDrive(fileId: string): Promise<boolean> {
  const accessToken = await ensureValidAccessToken();

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
      return 0;
    }

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
