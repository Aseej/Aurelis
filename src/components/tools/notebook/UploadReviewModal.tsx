import React, { useState, useEffect } from 'react';
import { Cloud, X, ArrowUpRight, Check, AlertCircle, RefreshCw, Trash2, ArrowUp, ArrowDown, LogIn } from 'lucide-react';
import { uploadNotebookImageFile } from '../../../services/captureNotebookService';
import { connectGoogleDrive } from '../../../services/googleDriveService';
import { useI18n } from '../../../i18n';

interface UploadReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicName: string;
  filesToUpload: File[];
  startingPageNumber: number;
  onUploadSuccess: (
    uploadedPages: Array<{
      id: string;
      topicId: string;
      pageNumber: number;
      driveFileId: string;
      fileName: string;
      createdAt: string;
    }>
  ) => void;
}

export const UploadReviewModal: React.FC<UploadReviewModalProps> = ({
  isOpen,
  onClose,
  topicId,
  topicName,
  filesToUpload: initialFiles,
  startingPageNumber,
  onUploadSuccess,
}) => {
  const { t } = useI18n();
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState<boolean>(false);

  // Sync initial files
  React.useEffect(() => {
    setFiles(initialFiles);
    setUploadError(null);
    setCurrentUploadIndex(0);
  }, [initialFiles]);

  if (!isOpen) return null;

  const removeFile = (idx: number) => {
    if (isUploading) return;
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveFile = (idx: number, direction: 'UP' | 'DOWN') => {
    if (isUploading) return;
    const targetIdx = direction === 'UP' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= files.length) return;

    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleReconnect = async () => {
    setIsReconnecting(true);
    setUploadError(null);
    try {
      await connectGoogleDrive();
      setIsReconnecting(false);
      // Auto-retry upload once reconnected
      handleStartUpload();
    } catch (err: any) {
      setIsReconnecting(false);
      setUploadError(err.message || 'Reauthorization failed. Please try again.');
    }
  };

  const handleStartUpload = async () => {
    if (files.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadError(null);
    const successfullyUploaded: Array<{
      id: string;
      topicId: string;
      pageNumber: number;
      driveFileId: string;
      fileName: string;
      createdAt: string;
    }> = [];

    try {
      for (let i = 0; i < files.length; i++) {
        setCurrentUploadIndex(i + 1);
        const file = files[i];
        const pageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const pageNumber = startingPageNumber + i;

        const res = await uploadNotebookImageFile(file, topicId, pageId, pageNumber);

        successfullyUploaded.push({
          id: pageId,
          topicId,
          pageNumber,
          driveFileId: res.driveFileId,
          fileName: res.fileName,
          createdAt: new Date().toISOString(),
        });
      }

      setIsUploading(false);
      onUploadSuccess(successfullyUploaded);
      onClose();
    } catch (err: any) {
      console.error('Error during notebook page upload:', err);
      setIsUploading(false);
      if (successfullyUploaded.length > 0) {
        onUploadSuccess(successfullyUploaded);
        setFiles((prev) => prev.slice(successfullyUploaded.length));
      }
      setUploadError(
        err.message || 'Failed to upload pages to Google Drive. Please check your connection and retry.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-amber-400" />
              <span>{t('notebook.reviewPagesBeforeSaving', 'Review Pages before Saving')}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {t('notebook.topicLabel', 'Topic:')} <span className="text-amber-400 font-medium">{topicName}</span>
            </p>
          </div>
          {!isUploading && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content: Pages List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="font-semibold">{t('notebook.uploadNotice', 'Upload Notice')}</p>
                <p className="text-[11px] text-rose-300">{uploadError}</p>
                {uploadError.includes('AUTH_REQUIRED') && (
                  <button
                    onClick={handleReconnect}
                    disabled={isReconnecting}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg inline-flex items-center gap-1.5 text-xs transition-colors"
                  >
                    {isReconnecting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <LogIn className="w-3.5 h-3.5" />}
                    <span>{t('drive.reconnectGoogleDrive', 'Reconnect Google Drive')}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {isUploading && (
            <div className="p-4 bg-slate-950 rounded-2xl border border-amber-500/30 space-y-2 text-center animate-pulse">
              <span className="text-xs font-mono text-amber-400 font-semibold">
                {t('notebook.uploadingProgress', 'Uploading page {current} of {total} to Google Drive...', { current: currentUploadIndex, total: files.length })}
              </span>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${(currentUploadIndex / files.length) * 100}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                {t('notebook.storingSecurely', 'Storing securely in your Google Drive appDataFolder')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {files.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              const targetPageNum = startingPageNumber + idx;
              return (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 flex flex-col group"
                >
                  <div className="relative aspect-[3/4] bg-slate-900 overflow-hidden">
                    <img
                      src={previewUrl}
                      alt={`Page ${targetPageNum}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-[10px] font-mono px-1.5 py-0.5 rounded text-amber-300 font-bold border border-white/10">
                      {t('notebook.pageNumber', 'Page {number}', { number: targetPageNum })}
                    </div>

                    {!isUploading && (
                      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1 rounded bg-black/80 hover:bg-rose-600 text-white transition-colors"
                          title={t('notebook.removePage', 'Remove this page')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!isUploading && (
                    <div className="flex items-center justify-between p-1 bg-slate-900/90 text-xs border-t border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[80px]">
                        {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveFile(idx, 'UP')}
                          className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-20"
                          title={t('notebook.moveEarlier', 'Move Earlier')}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === files.length - 1}
                          onClick={() => moveFile(idx, 'DOWN')}
                          className="p-1 text-slate-400 hover:text-slate-100 disabled:opacity-20"
                          title={t('notebook.moveLater', 'Move Later')}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-slate-400">
            {t('notebook.pagesSelected', '{count} pages selected', { count: files.length })}
          </span>

          <div className="flex items-center gap-2">
            {!isUploading && (
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {t('common.cancel', 'Cancel')}
              </button>
            )}

            <button
              type="button"
              disabled={files.length === 0 || isUploading}
              onClick={handleStartUpload}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{t('notebook.uploading', 'Saving to Drive...')}</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>{t('notebook.startUpload', 'Save to Drive')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
