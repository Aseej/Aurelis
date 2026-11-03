import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, Check, Trash2, SwitchCamera, ImagePlus } from 'lucide-react';

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
  const [capturedPhotos, setCapturedPhotos] = useState<File[]>([]);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCapturing, setIsCapturing] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      setCameraError(null);
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        err.message || 'Unable to access camera. You can still use the native device camera below.'
      );
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode);
    } else {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
        setCameraStream(null);
      }
      setCapturedPhotos([]);
      setCameraError(null);
    }

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen]);

  const toggleCameraFacing = () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    startCamera(next);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        setIsCapturing(false);
        if (blob) {
          const fileName = `page_photo_${Date.now()}_${capturedPhotos.length + 1}.jpg`;
          const file = new File([blob], fileName, { type: 'image/jpeg' });
          setCapturedPhotos((prev) => [...prev, file]);
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
      setCapturedPhotos((prev) => [...prev, ...newFiles]);
    }
  };

  const removePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDone = () => {
    if (capturedPhotos.length > 0) {
      onAcceptPhotos(capturedPhotos);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/60 z-10">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Capture Notebook Pages</h3>
            {capturedPhotos.length > 0 && (
              <span className="text-xs bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/30">
                {capturedPhotos.length} snapped
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder / Camera Feed */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-3">
              <Camera className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 max-w-sm">{cameraError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
              >
                <ImagePlus className="w-4 h-4" />
                <span>Snap with Device Camera</span>
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[55vh]"
              />

              {/* Shutter flash animation */}
              {isCapturing && <div className="absolute inset-0 bg-white/40 animate-pulse pointer-events-none" />}

              {/* Switch camera button */}
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-slate-200 hover:bg-black/80 backdrop-blur-xs transition-colors"
                title="Switch Camera"
              >
                <SwitchCamera className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Hidden Canvas & File Picker */}
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

        {/* Snapped Photos Preview Strip */}
        {capturedPhotos.length > 0 && (
          <div className="p-3 bg-slate-950/80 border-t border-slate-800 overflow-x-auto flex items-center gap-2 scrollbar-none">
            {capturedPhotos.map((file, idx) => {
              const previewUrl = URL.createObjectURL(file);
              return (
                <div key={idx} className="relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-slate-700">
                  <img src={previewUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-mono text-center text-slate-300 py-0.5">
                    P.{idx + 1}
                  </span>
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-0.5 right-0.5 p-0.5 bg-black/70 hover:bg-rose-600 rounded text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            <span className="hidden sm:inline">Use Native Camera</span>
          </button>

          {/* Shutter Trigger Button */}
          {!cameraError && (
            <button
              type="button"
              onClick={capturePhoto}
              className="w-14 h-14 rounded-full border-4 border-amber-400 p-1 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              title="Snap Page Photo"
            >
              <div className="w-full h-full rounded-full bg-amber-500 shadow-md" />
            </button>
          )}

          {/* Done / Review Button */}
          <button
            type="button"
            onClick={handleDone}
            disabled={capturedPhotos.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>Accept ({capturedPhotos.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
