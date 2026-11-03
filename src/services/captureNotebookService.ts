/**
 * AURELIS Capture Notebook Service
 * Manages handwritten notebook digitization stored securely in the student's
 * own Google Drive account using the private appDataFolder.
 *
 * Uses robust proxy routes (/api/drive/*) to eliminate browser CORS preflight blocks,
 * with automatic resumable upload fallback.
 */

import { ensureValidAccessToken, clearCachedAccessToken } from './googleDriveService';

export interface NotebookPage {
  id: string; // Unique page UUID
  topicId: string;
  pageNumber: number; // 1, 2, 3...
  driveFileId: string; // Google Drive file ID
  fileName: string;
  createdAt: string;
  mimeType?: string;
}

export interface NotebookTopic {
  id: string; // Unique topic UUID
  subjectId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotebookSubject {
  id: string; // Unique subject UUID
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CaptureNotebookIndex {
  format: 'aurelis_capture_notebook_index';
  version: '1.0.0';
  lastUpdated: string;
  subjects: NotebookSubject[];
  topics: NotebookTopic[];
  pages: NotebookPage[];
}

const INDEX_FILE_NAME = 'aurelis_capture_notebook_index.json';
const LOCAL_CACHE_KEY_PREFIX = 'aurelis_notebook_cache_';

// In-memory image blob URL cache to ensure instant full-screen page transitions
const imageBlobUrlCache = new Map<string, string>();

/**
 * Converts a Blob or File to a Base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Gets cached notebook index from localStorage for instant rendering
 */
export function getLocalCachedIndex(userEmail?: string | null): CaptureNotebookIndex | null {
  if (typeof window === 'undefined') return null;
  try {
    const key = LOCAL_CACHE_KEY_PREFIX + (userEmail || 'default');
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Saves notebook index to local cache
 */
export function setLocalCachedIndex(index: CaptureNotebookIndex, userEmail?: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const key = LOCAL_CACHE_KEY_PREFIX + (userEmail || 'default');
    localStorage.setItem(key, JSON.stringify(index));
  } catch {}
}

/**
 * Finds or loads the notebook index from user's Google Drive appDataFolder.
 */
export async function loadNotebookIndexFromDrive(): Promise<{
  index: CaptureNotebookIndex;
  indexFileId: string | null;
}> {
  const accessToken = await ensureValidAccessToken();
  const query = `trashed = false and name = '${INDEX_FILE_NAME}'`;

  let listData: any = null;

  // 1. Try server proxy route first
  try {
    const proxyListUrl = `/api/drive/files?spaces=appDataFolder&q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&pageSize=1`;
    const proxyRes = await fetch(proxyListUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (proxyRes.ok) {
      listData = await proxyRes.json();
    } else if (proxyRes.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
    }
  } catch (err: any) {
    if (err.message?.includes('AUTH_REQUIRED')) throw err;
  }

  // 2. Direct fallback if proxy is unavailable
  if (!listData) {
    const directUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&pageSize=1`;
    const directRes = await fetch(directUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!directRes.ok) {
      if (directRes.status === 401) {
        clearCachedAccessToken();
        throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
      }
      throw new Error(`Failed to check Drive notebook index (${directRes.status})`);
    }
    listData = await directRes.json();
  }

  const file = listData.files && listData.files[0];

  if (!file) {
    // Fresh index
    const initialIndex: CaptureNotebookIndex = {
      format: 'aurelis_capture_notebook_index',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      subjects: [],
      topics: [],
      pages: [],
    };
    return { index: initialIndex, indexFileId: null };
  }

  // Download content
  let rawJson: any = null;

  try {
    const proxyDownUrl = `/api/drive/files/${file.id}/media`;
    const downRes = await fetch(proxyDownUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (downRes.ok) {
      rawJson = await downRes.json();
    }
  } catch {}

  if (!rawJson) {
    const directDownUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
    const directDownRes = await fetch(directDownUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!directDownRes.ok) {
      throw new Error(`Failed to download notebook index (${directDownRes.status})`);
    }
    rawJson = await directDownRes.json();
  }

  if (rawJson?.format === 'aurelis_capture_notebook_index') {
    return { index: rawJson as CaptureNotebookIndex, indexFileId: file.id };
  }

  const initialIndex: CaptureNotebookIndex = {
    format: 'aurelis_capture_notebook_index',
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    subjects: [],
    topics: [],
    pages: [],
  };
  return { index: initialIndex, indexFileId: file.id };
}

/**
 * Saves the notebook index to the user's Google Drive appDataFolder.
 */
export async function saveNotebookIndexToDrive(
  index: CaptureNotebookIndex,
  existingFileId: string | null
): Promise<string> {
  const accessToken = await ensureValidAccessToken();
  const indexWithTimestamp: CaptureNotebookIndex = {
    ...index,
    lastUpdated: new Date().toISOString(),
  };

  const payloadString = JSON.stringify(indexWithTimestamp, null, 2);

  // If updating existing file
  if (existingFileId) {
    try {
      const proxyPatchRes = await fetch(`/api/drive/files/${existingFileId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: indexWithTimestamp }),
      });

      if (proxyPatchRes.ok) {
        return existingFileId;
      }
      if (proxyPatchRes.status === 401) {
        clearCachedAccessToken();
        throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
      }
    } catch (err: any) {
      if (err.message?.includes('AUTH_REQUIRED')) throw err;
    }

    // Direct patch fallback
    const directPatchUrl = `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`;
    const directRes = await fetch(directPatchUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: payloadString,
    });

    if (!directRes.ok) {
      if (directRes.status === 401) {
        clearCachedAccessToken();
        throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
      }
      throw new Error(`Failed to update notebook index (${directRes.status})`);
    }

    return existingFileId;
  }

  // Create new index file
  try {
    const proxyCreateRes = await fetch('/api/drive/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: INDEX_FILE_NAME,
        parents: ['appDataFolder'],
        properties: { type: 'aurelis_notebook_index', version: '1.0.0' },
        description: 'AURELIS Capture Notebook Master Index',
        content: indexWithTimestamp,
        mimeType: 'application/json; charset=UTF-8',
      }),
    });

    if (proxyCreateRes.ok) {
      const data = await proxyCreateRes.json();
      return data.id;
    }
    if (proxyCreateRes.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
    }
  } catch (err: any) {
    if (err.message?.includes('AUTH_REQUIRED')) throw err;
  }

  // Resumable creation fallback
  const blob = new Blob([payloadString], { type: 'application/json; charset=UTF-8' });
  const res = await uploadViaResumable(
    blob,
    INDEX_FILE_NAME,
    { type: 'aurelis_notebook_index', version: '1.0.0' },
    accessToken
  );
  return res.driveFileId;
}

/**
 * Resumable upload fallback for browser environments
 */
async function uploadViaResumable(
  blob: Blob,
  fileName: string,
  properties: Record<string, string>,
  accessToken: string
): Promise<{ driveFileId: string; fileName: string }> {
  const metadataUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
  const fileMetadata = {
    name: fileName,
    parents: ['appDataFolder'],
    properties,
  };

  const initRes = await fetch(metadataUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': blob.type || 'image/jpeg',
      'X-Upload-Content-Length': String(blob.size),
    },
    body: JSON.stringify(fileMetadata),
  });

  if (!initRes.ok) {
    if (initRes.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
    }
    throw new Error(`Failed to initiate upload session (${initRes.status})`);
  }

  const sessionUri = initRes.headers.get('Location');
  if (!sessionUri) {
    throw new Error('Upload session location header missing.');
  }

  const uploadRes = await fetch(sessionUri, {
    method: 'PUT',
    headers: {
      'Content-Type': blob.type || 'image/jpeg',
    },
    body: blob,
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload failed with status (${uploadRes.status})`);
  }

  const data = await uploadRes.json();
  return { driveFileId: data.id, fileName };
}

/**
 * Uploads a single captured notebook image file directly to the user's Google Drive appDataFolder.
 */
export async function uploadNotebookImageFile(
  blob: Blob,
  topicId: string,
  pageId: string,
  pageNumber: number
): Promise<{ driveFileId: string; fileName: string }> {
  const accessToken = await ensureValidAccessToken();
  const fileName = `aurelis_nb_${topicId}_p${pageNumber}_${pageId}.jpg`;
  const base64Data = await blobToBase64(blob);

  // 1. Try Server-Side Proxy First
  // Bypasses browser CORS constraints completely!
  try {
    const proxyRes = await fetch('/api/drive/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: fileName,
        parents: ['appDataFolder'],
        properties: {
          type: 'aurelis_notebook_page',
          topicId,
          pageId,
          pageNumber: String(pageNumber),
        },
        mimeType: blob.type || 'image/jpeg',
        base64Data,
      }),
    });

    if (proxyRes.ok) {
      const data = await proxyRes.json();
      try {
        const objectUrl = URL.createObjectURL(blob);
        imageBlobUrlCache.set(data.id, objectUrl);
      } catch {}
      return { driveFileId: data.id, fileName };
    }

    if (proxyRes.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
    }

    const errJson = await proxyRes.json().catch(() => null);
    console.warn('Proxy upload responded with error:', proxyRes.status, errJson);
  } catch (err: any) {
    if (err.message?.includes('AUTH_REQUIRED')) throw err;
    console.warn('Proxy upload failed, attempting resumable direct upload:', err);
  }

  // 2. Direct Resumable Upload Fallback
  const res = await uploadViaResumable(
    blob,
    fileName,
    {
      type: 'aurelis_notebook_page',
      topicId,
      pageId,
      pageNumber: String(pageNumber),
    },
    accessToken
  );

  try {
    const objectUrl = URL.createObjectURL(blob);
    imageBlobUrlCache.set(res.driveFileId, objectUrl);
  } catch {}

  return res;
}

/**
 * Downloads or retrieves a cached object URL for a notebook page image from Google Drive.
 */
export async function getNotebookPageImageUrl(driveFileId: string): Promise<string> {
  // Check memory cache first
  if (imageBlobUrlCache.has(driveFileId)) {
    return imageBlobUrlCache.get(driveFileId)!;
  }

  const accessToken = await ensureValidAccessToken();

  // 1. Try server proxy route first
  try {
    const proxyMediaUrl = `/api/drive/files/${driveFileId}/media`;
    const proxyRes = await fetch(proxyMediaUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (proxyRes.ok) {
      const blob = await proxyRes.blob();
      const objectUrl = URL.createObjectURL(blob);
      imageBlobUrlCache.set(driveFileId, objectUrl);
      return objectUrl;
    }

    if (proxyRes.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
    }
  } catch (err: any) {
    if (err.message?.includes('AUTH_REQUIRED')) throw err;
  }

  // 2. Direct Google Drive API fallback
  const directUrl = `https://www.googleapis.com/drive/v3/files/${driveFileId}?alt=media`;
  const res = await fetch(directUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    if (res.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
    }
    throw new Error(`Failed to load page image from Google Drive (${res.status})`);
  }

  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  imageBlobUrlCache.set(driveFileId, objectUrl);
  return objectUrl;
}

/**
 * Permanently deletes a single image file from the user's Google Drive.
 */
export async function deleteNotebookImageFromDrive(driveFileId: string): Promise<void> {
  const accessToken = await ensureValidAccessToken();

  // Clear memory cache
  if (imageBlobUrlCache.has(driveFileId)) {
    try {
      URL.revokeObjectURL(imageBlobUrlCache.get(driveFileId)!);
    } catch {}
    imageBlobUrlCache.delete(driveFileId);
  }

  // 1. Try server proxy delete
  try {
    const proxyDelRes = await fetch(`/api/drive/files/${driveFileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (proxyDelRes.ok || proxyDelRes.status === 404) {
      return;
    }

    if (proxyDelRes.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
    }
  } catch (err: any) {
    if (err.message?.includes('AUTH_REQUIRED')) throw err;
  }

  // 2. Direct Google Drive API fallback
  const directUrl = `https://www.googleapis.com/drive/v3/files/${driveFileId}`;
  const res = await fetch(directUrl, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 404) {
    if (res.status === 401) {
      clearCachedAccessToken();
      throw new Error('AUTH_REQUIRED: Google Drive authorization expired.');
    }
    throw new Error(`Failed to delete notebook image file (${res.status})`);
  }
}

/**
 * Deletes multiple files in batch from Google Drive.
 */
export async function deleteMultipleNotebookImages(driveFileIds: string[]): Promise<void> {
  for (const id of driveFileIds) {
    try {
      await deleteNotebookImageFromDrive(id);
    } catch (e) {
      console.warn(`Could not delete notebook file ${id}:`, e);
    }
  }
}
