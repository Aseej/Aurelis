import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Camera, X, Check, Trash2, SwitchCamera, ImagePlus, AlertCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';
import { useApp } from '../../../context/AppContext';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptPhotos: (files: File[]) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onAcceptPhotos,
}) => {
  const { t } = useI18n();
  const { setIsCameraMode } = useApp();

  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Helper to completely stop the camera stream tracks
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {
          // ignore
        }
      });
      streamRef.current = null;
    }
    setCameraStream(null);
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async (mode: 'environment' | 'user') => {
    try {
      setCameraError(null);
      stopCameraStream();

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera hardware access is not supported on this browser/environment.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {
          // Auto-play was interrupted or waiting for user interaction
        });
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.message || 'Unable to access camera feed. You can still use the native device camera below.'
      );
    }
  }, [stopCameraStream]);

  // Manage Fullscreen Camera Mode & LifeCycle
  useEffect(() => {
    if (isOpen) {
      setIsCameraMode(true);
      startCamera(facingMode);
    } else {
      setIsCameraMode(false);
      stopCameraStream();
      // Revoke any created preview URLs
      setPreviewUrls((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });
      setCapturedPhotos([]);
      setCameraError(null);
      setIsConfirmDiscardOpen(false);
    }

    return () => {
      setIsCameraMode(false);
      stopCameraStream();
    };
  }, [isOpen, startCamera, stopCameraStream, setIsCameraMode]);

  // Keep video source synced if video element mounts
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  // Keyboard navigation / Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isConfirmDiscardOpen) {
          setIsConfirmDiscardOpen(false);
        } else if (capturedPhotos.length > 0) {
          setIsConfirmDiscardOpen(true);
        } else {
          handleCleanExit();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isConfirmDiscardOpen, capturedPhotos.length]);

  const toggleCameraFacing = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsCapturing(false);
      return;
    }

    // Mirror image if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setTimeout(() => setIsCapturing(false), 150);
        if (blob) {
          const fileName = `notebook_page_${Date.now()}_${capturedPhotos.length + 1}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          const url = URL.createObjectURL(file);
          setCapturedPhotos((prev) => [...prev, file]);
          setPreviewUrls((prev) => [...prev, url]);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  // Fallback for native camera file picker
  const handleNativeCameraPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const newUrls = newFiles.map((f) => URL.createObjectURL(f));
      setCapturedPhotos((prev) => [...prev, ...newFiles]);
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, idx) => idx !== index));
    setPreviewUrls((prev) => {
      const urlToRevoke = prev[index];
      if (urlToRevoke) {
        URL.revokeObjectURL(urlToRevoke);
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleCleanExit = () => {
    stopCameraStream();
    setIsCameraMode(false);
    onClose();
  };

  const handleRequestClose = () => {
    if (capturedPhotos.length > 0) {
      setIsConfirmDiscardOpen(true);
    } else {
      handleCleanExit();
    }
  };

  const handleConfirmDiscard = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setCapturedPhotos([]);
    setIsConfirmDiscardOpen(false);
    handleCleanExit();
  };

  const handleDone = () => {
    if (capturedPhotos.length > 0) {
      onAcceptPhotos(capturedPhotos);
    }
    handleCleanExit();
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('notebook.cameraTitle', 'Capture Notebook Pages')}
      className="fixed inset-0 z-[100] h-[100dvh] w-full bg-black text-white flex flex-col overflow-hidden select-none"
      style={{ touchAction: 'manipulation' }}
    >
      {/* 1. Header Section */}
      <header
        className="shrink-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-gradient-to-b from-black/95 via-black/80 to-transparent border-b border-white/10"
        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0px))' }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <Camera className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-white tracking-wide truncate">
              {t('notebook.cameraTitle', 'Capture Notebook Pages')}
            </h2>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              {capturedPhotos.length === 0
                ? t('notebook.readyToSnap', 'Position page within frame')
                : t('notebook.photosCount', '{count} page(s) ready to accept', { count: capturedPhotos.length })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {capturedPhotos.length > 0 && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {capturedPhotos.length}
            </span>
          )}
          <button
            type="button"
            onClick={handleRequestClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all focus:outline-none focus:ring-2 focus:ring-amber-400"
            aria-label={t('common.close', 'Close camera')}
            title={t('common.close', 'Close camera')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Camera Preview / Viewfinder Section */}
      <div className="relative flex-1 min-h-0 w-full bg-black flex items-center justify-center overflow-hidden">
        {cameraError ? (
          <div className="p-6 text-center max-w-sm mx-auto space-y-4 z-10 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-200">
                {t('notebook.cameraError', 'Live camera stream unavailable')}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">{cameraError}</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 active:scale-95 text-black text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-lg transition-all"
            >
              <ImagePlus className="w-4 h-4" />
              <span>{t('notebook.nativeCamera', 'Snap with Device Camera')}</span>
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain md:object-cover"
            />

            {/* Document / Page Framing Guide Overlay */}
            <div className="pointer-events-none absolute inset-6 sm:inset-10 border border-white/20 rounded-2xl shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]">
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-amber-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-amber-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-amber-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-amber-400 rounded-br-lg" />
            </div>

            {/* Switch Camera Button (Front / Rear) */}
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/60 hover:bg-black/80 active:scale-90 text-white backdrop-blur-md border border-white/20 transition-all shadow-lg"
              title={t('notebook.switchCamera', 'Switch Camera')}
              aria-label={t('notebook.switchCamera', 'Switch Camera')}
            >
              <SwitchCamera className="w-5 h-5" />
            </button>

            {/* Shutter Flash Effect */}
            {isCapturing && (
              <div className="absolute inset-0 bg-white/70 animate-pulse pointer-events-none z-30" />
            )}
          </>
        )}

        {/* Hidden Canvas & Device Camera Input */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleNativeCameraPick}
          className="hidden"
        />
      </div>

      {/* 3. Captured Photographs Thumbnail Strip */}
      {capturedPhotos.length > 0 && (
        <div className="shrink-0 z-30 bg-black/90 backdrop-blur-md border-t border-white/10 px-4 py-2.5 overflow-x-auto flex items-center gap-3 scrollbar-none">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
            {t('notebook.pagesSnapped', 'Pages')} ({capturedPhotos.length}):
          </div>
          <div className="flex items-center gap-2.5 min-w-0">
            {capturedPhotos.map((file, idx) => {
              const url = previewUrls[idx];
              return (
                <div
                  key={`${file.name}-${idx}`}
                  className="relative shrink-0 w-14 h-18 sm:w-16 sm:h-20 rounded-xl overflow-hidden border-2 border-amber-500/40 shadow-md bg-slate-900 group"
                >
                  {url && (
                    <img
                      src={url}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent text-[9px] font-mono text-center text-slate-200 py-0.5 font-bold">
                    P.{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(idx);
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow active:scale-95 transition-all"
                    title={t('common.delete', 'Remove photo')}
                    aria-label={t('common.delete', 'Remove photo')}
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Bottom Camera Controls Section */}
      <div
        className="shrink-0 z-30 bg-black/95 backdrop-blur-xl border-t border-white/10 px-4 sm:px-6 pt-3 flex items-center justify-between gap-3"
        style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 20px))' }}
      >
        {/* Left: Device Camera / Picker Fallback */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="h-11 px-3 sm:px-3.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-slate-300 text-xs font-medium flex items-center gap-2 border border-white/10 transition-all shrink-0"
          title={t('notebook.nativeCamera', 'Snap with Device Camera')}
        >
          <ImagePlus className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">{t('notebook.nativeCamera', 'Device Camera')}</span>
        </button>

        {/* Center: Large Shutter Capture Trigger */}
        <div className="flex-1 flex justify-center">
          {!cameraError ? (
            <button
              type="button"
              onClick={capturePhoto}
              disabled={isCapturing}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-4 border-amber-400 p-1 flex items-center justify-center hover:scale-105 active:scale-90 transition-transform shadow-[0_0_24px_rgba(245,158,11,0.4)] focus:outline-none focus:ring-4 focus:ring-amber-400/50"
              title={t('notebook.snapPhoto', 'Snap Page Photo')}
              aria-label={t('notebook.snapPhoto', 'Snap Page Photo')}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 active:opacity-80 transition-opacity" />
            </button>
          ) : (
            <span className="text-xs text-slate-500 italic">
              {t('notebook.cameraUnavailable', 'Use device camera')}
            </span>
          )}
        </div>

        {/* Right: Accept Photographs Button */}
        <button
          type="button"
          onClick={handleDone}
          disabled={capturedPhotos.length === 0}
          className="h-11 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg active:scale-95 shrink-0"
        >
          <Check className="w-4 h-4 stroke-[2.5]" />
          <span>{t('notebook.acceptPhotos', 'Accept ({count})', { count: capturedPhotos.length })}</span>
        </button>
      </div>

      {/* Discard Confirmation Dialog */}
      {isConfirmDiscardOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  {t('notebook.discardPromptTitle', 'Discard Captured Photos?')}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {t(
                    'notebook.discardPromptDesc',
                    'You have {count} unsaved photo(s). They will not be saved if you exit now.',
                    { count: capturedPhotos.length }
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsConfirmDiscardOpen(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-white/10 active:scale-95 transition-all"
              >
                {t('notebook.keepSnapping', 'Continue Snapping')}
              </button>
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-semibold shadow transition-all"
              >
                {t('notebook.discardAndExit', 'Discard & Exit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};
