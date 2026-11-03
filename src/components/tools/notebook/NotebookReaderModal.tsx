import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Download,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { NotebookPage, getNotebookPageImageUrl } from '../../../services/captureNotebookService';

interface NotebookReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: NotebookPage[];
  initialPageIndex: number;
  topicName: string;
}

export const NotebookReaderModal: React.FC<NotebookReaderModalProps> = ({
  isOpen,
  onClose,
  pages,
  initialPageIndex,
  topicName,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialPageIndex);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Current page image URL and loading state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync index on open
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(pages.length - 1, initialPageIndex)));
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [isOpen, initialPageIndex, pages.length]);

  // Load current page image
  const currentPage = pages[currentIndex];

  useEffect(() => {
    if (!isOpen || !currentPage) return;

    let isMounted = true;
    setIsLoadingImage(true);
    setLoadError(null);

    getNotebookPageImageUrl(currentPage.driveFileId)
      .then((url) => {
        if (isMounted) {
          setImageUrl(url);
          setIsLoadingImage(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Failed to load notebook page:', err);
          setLoadError(err.message || 'Could not load notebook page from Google Drive.');
          setIsLoadingImage(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentPage?.driveFileId]);

  const handlePrevPage = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [currentIndex]);

  const handleNextPage = useCallback(() => {
    if (currentIndex < pages.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
    }
  }, [currentIndex, pages.length]);

  // Keyboard navigation: Left/Right arrows, Escape, + / -
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevPage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoomLevel((z) => Math.min(4, z + 0.25));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoomLevel((z) => Math.max(0.5, z - 0.25));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrevPage, handleNextPage, onClose]);

  // Touch Swipe & Mouse Pan Handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch drag & swipe
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDistRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (zoomLevel > 1) {
        setIsDragging(true);
        setDragStart({
          x: e.touches[0].clientX - panOffset.x,
          y: e.touches[0].clientY - panOffset.y,
        });
      }
    } else if (e.touches.length === 2) {
      // Pinch to zoom start
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchDistRef.current = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      setPanOffset({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / touchDistRef.current;
      setZoomLevel((prev) => Math.max(0.75, Math.min(4, prev * factor)));
      touchDistRef.current = dist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    touchDistRef.current = null;

    // Horizontal swipe detection if zoom is 1
    if (zoomLevel === 1 && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
      if (Math.abs(deltaX) > 60 && Math.abs(deltaY) < 50) {
        if (deltaX < 0) {
          handleNextPage();
        } else {
          handlePrevPage();
        }
      }
    }
  };

  if (!isOpen || !currentPage) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#050608]/95 backdrop-blur-xl animate-fade-in select-none text-slate-100">
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/60 border-b border-white/10 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            title="Return to notebook collection (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold truncate max-w-[200px] sm:max-w-md text-slate-100">
              {topicName}
            </h3>
            <span className="text-[11px] font-mono text-amber-400">
              Page {currentIndex + 1} of {pages.length}
            </span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/50 text-slate-300">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(4, z + 0.25))}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
            title="Reset Zoom (0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Reading Canvas */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative flex-1 overflow-hidden flex items-center justify-center p-2 sm:p-4 ${
          zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {isLoadingImage ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
            <span className="text-xs font-mono">Loading page from your Google Drive...</span>
          </div>
        ) : loadError ? (
          <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800 text-center max-w-sm space-y-2">
            <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
            <p className="text-xs text-rose-200 font-medium">{loadError}</p>
          </div>
        ) : imageUrl ? (
          <div
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
            className="max-w-full max-h-full flex items-center justify-center"
          >
            <img
              src={imageUrl}
              alt={`Page ${currentIndex + 1}`}
              className="max-h-[82vh] max-w-[94vw] object-contain rounded-lg shadow-2xl pointer-events-none select-none"
            />
          </div>
        ) : null}

        {/* Previous Page Arrow (Left) */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrevPage();
            }}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-xl border border-white/15 transition-transform active:scale-90"
            title="Previous Page (Left Arrow)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Next Page Arrow (Right) */}
        {currentIndex < pages.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNextPage();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md shadow-xl border border-white/15 transition-transform active:scale-90"
            title="Next Page (Right Arrow)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Floating Thumbnails / Page Strip */}
      <div className="px-4 py-2 bg-black/60 border-t border-white/10 flex items-center justify-center gap-2 overflow-x-auto scrollbar-none z-20">
        {pages.map((p, idx) => (
          <button
            key={p.id}
            onClick={() => {
              setCurrentIndex(idx);
              setZoomLevel(1);
              setPanOffset({ x: 0, y: 0 });
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
              currentIndex === idx
                ? 'bg-amber-500 text-black font-bold shadow-md ring-1 ring-amber-300'
                : 'bg-white/10 hover:bg-white/20 text-slate-300'
            }`}
          >
            P.{idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
