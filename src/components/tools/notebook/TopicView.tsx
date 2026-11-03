import React, { useState } from 'react';
import {
  NotebookSubject,
  NotebookTopic,
  NotebookPage,
  getNotebookPageImageUrl,
} from '../../../services/captureNotebookService';
import { CameraCaptureModal } from './CameraCaptureModal';
import { UploadReviewModal } from './UploadReviewModal';
import { NotebookReaderModal } from './NotebookReaderModal';
import {
  Camera,
  Upload,
  Plus,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  BookOpen,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface TopicViewProps {
  subject: NotebookSubject;
  topic: NotebookTopic;
  pages: NotebookPage[];
  onRenameTopic: (topicId: string, newName: string) => Promise<void>;
  onDeleteTopic: (topicId: string) => Promise<void>;
  onAddPages: (newPages: NotebookPage[]) => Promise<void>;
  onDeletePage: (pageId: string) => Promise<void>;
  onDeleteMultiplePages: (pageIds: string[]) => Promise<void>;
}

export const TopicView: React.FC<TopicViewProps> = ({
  subject,
  topic,
  pages,
  onRenameTopic,
  onDeleteTopic,
  onAddPages,
  onDeletePage,
  onDeleteMultiplePages,
}) => {
  // Modals state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isUploadReviewOpen, setIsUploadReviewOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [activeReaderIndex, setActiveReaderIndex] = useState<number | null>(null);

  // Edit / Delete Topic Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTopicName, setEditTopicName] = useState(topic.name);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Multi-select page deletion mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedPageIds, setSelectedPageIds] = useState<Set<string>>(new Set());
  const [isConfirmMultiDeleteOpen, setIsConfirmMultiDeleteOpen] = useState(false);

  // Gallery image thumbnails URL cache
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});

  // Hidden file input for uploading images
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sort pages by pageNumber ascending
  const sortedPages = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);

  // Fetch thumbnails lazily as needed
  React.useEffect(() => {
    sortedPages.forEach((p) => {
      if (!thumbnailUrls[p.driveFileId]) {
        getNotebookPageImageUrl(p.driveFileId)
          .then((url) => {
            setThumbnailUrls((prev) => ({ ...prev, [p.driveFileId]: url }));
          })
          .catch(() => {});
      }
    });
  }, [sortedPages]);

  // Handle gallery files selected from input
  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setStagedFiles(files);
      setIsUploadReviewOpen(true);
    }
  };

  const handleAcceptCameraPhotos = (files: File[]) => {
    setStagedFiles(files);
    setIsUploadReviewOpen(true);
  };

  const toggleSelectPage = (pageId: string) => {
    setSelectedPageIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) next.delete(pageId);
      else next.add(pageId);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedPageIds.size === sortedPages.length) {
      setSelectedPageIds(new Set());
    } else {
      setSelectedPageIds(new Set(sortedPages.map((p) => p.id)));
    }
  };

  const handleExecuteMultiDelete = async () => {
    if (selectedPageIds.size === 0) return;
    setIsProcessing(true);
    try {
      await onDeleteMultiplePages(Array.from(selectedPageIds));
      setSelectedPageIds(new Set());
      setIsSelectMode(false);
      setIsConfirmMultiDeleteOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveRename = async () => {
    if (!editTopicName.trim() || editTopicName.trim() === topic.name) {
      setIsEditModalOpen(false);
      return;
    }
    setIsProcessing(true);
    try {
      await onRenameTopic(topic.id, editTopicName.trim());
      setIsEditModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteTopicDelete = async () => {
    setIsProcessing(true);
    try {
      await onDeleteTopic(topic.id);
      setIsConfirmDeleteOpen(false);
      setIsEditModalOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Topic Bar & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#20232A] dark:text-[#F6F3EC]">
              {topic.name}
            </h2>
            <button
              onClick={() => {
                setEditTopicName(topic.name);
                setIsEditModalOpen(true);
              }}
              className="p-1 rounded-lg text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title="Edit or Delete Topic"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-xs font-mono text-[#858A93] dark:text-[#777F8C]">
            {sortedPages.length} {sortedPages.length === 1 ? 'page' : 'pages'} digitized in Google Drive
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {sortedPages.length > 0 && (
            <button
              onClick={() => {
                setIsSelectMode((prev) => !prev);
                setSelectedPageIds(new Set());
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                isSelectMode
                  ? 'bg-amber-500/20 text-amber-500 border-amber-500/40 font-semibold'
                  : 'bg-black/[0.04] dark:bg-white/[0.06] border-black/[0.06] dark:border-white/[0.08] text-[#6E737D] dark:text-[#A0A5B0]'
              }`}
            >
              {isSelectMode ? 'Cancel Selection' : 'Select'}
            </button>
          )}

          <button
            onClick={() => setIsCameraOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Take Picture</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black/[0.06] dark:bg-white/[0.08] hover:bg-amber-500 hover:text-black text-[#20232A] dark:text-[#F6F3EC] text-xs font-semibold rounded-xl transition-colors border border-black/[0.06] dark:border-white/[0.08]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Images</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFilesSelected}
            className="hidden"
          />
        </div>
      </div>

      {/* Multi-Select Toolbar if active */}
      {isSelectMode && (
        <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-amber-500 hover:underline"
            >
              {selectedPageIds.size === sortedPages.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>Select All</span>
            </button>
            <span className="text-[#858A93] dark:text-[#A0A5B0]">
              {selectedPageIds.size} of {sortedPages.length} selected
            </span>
          </div>

          <button
            disabled={selectedPageIds.size === 0}
            onClick={() => setIsConfirmMultiDeleteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Selected</span>
          </button>
        </div>
      )}

      {/* 2. Page Gallery Grid */}
      {sortedPages.length === 0 ? (
        <div className="rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-8 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC]">
              No Pages in this Topic Yet
            </h3>
            <p className="text-xs text-[#858A93] dark:text-[#A0A5B0] mt-1">
              Capture or upload handwritten notes to start building your digital notebook for {topic.name}.
            </p>
          </div>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={() => setIsCameraOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Camera className="w-4 h-4" />
              <span>Take Picture</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-[#20232A] dark:text-[#F6F3EC] text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors border border-black/[0.06] dark:border-white/[0.08]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {sortedPages.map((page, idx) => {
            const isSelected = selectedPageIds.has(page.id);
            const thumbUrl = thumbnailUrls[page.driveFileId];

            return (
              <div
                key={page.id}
                onClick={() => {
                  if (isSelectMode) {
                    toggleSelectPage(page.id);
                  } else {
                    setActiveReaderIndex(idx);
                  }
                }}
                className={`group relative rounded-2xl overflow-hidden glass-premium border transition-all cursor-pointer flex flex-col ${
                  isSelected
                    ? 'ring-2 ring-amber-500 border-amber-500 shadow-md'
                    : 'border-black/[0.08] dark:border-white/[0.12] hover:border-amber-500/50 hover:shadow-lg'
                }`}
              >
                {/* Thumbnail Display */}
                <div className="relative aspect-[3/4] bg-slate-900/60 overflow-hidden flex items-center justify-center">
                  {thumbUrl ? (
                    <img
                      src={thumbUrl}
                      alt={`Page ${page.pageNumber}`}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-[#858A93]">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-[10px] font-mono">Loading...</span>
                    </div>
                  )}

                  {/* Page Badge */}
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-[10px] font-mono px-2 py-0.5 rounded-lg text-amber-300 font-bold border border-white/10">
                    Page {page.pageNumber}
                  </div>

                  {/* Multi-Select Checkbox Overlay */}
                  {isSelectMode ? (
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-amber-500 text-black'
                            : 'bg-black/60 border border-white/40 text-transparent'
                        }`}
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    /* Hover Quick Actions */
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="p-2 rounded-full bg-black/70 text-white backdrop-blur-xs hover:bg-amber-500 hover:text-black transition-colors">
                        <Eye className="w-4 h-4" />
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete Page ${page.pageNumber}? It will be removed from your Google Drive.`)) {
                            onDeletePage(page.id);
                          }
                        }}
                        className="p-2 rounded-full bg-black/70 text-white backdrop-blur-xs hover:bg-rose-600 transition-colors"
                        title="Delete this page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onAcceptPhotos={handleAcceptCameraPhotos}
      />

      {/* 4. Upload Review Modal */}
      <UploadReviewModal
        isOpen={isUploadReviewOpen}
        onClose={() => {
          setIsUploadReviewOpen(false);
          setStagedFiles([]);
        }}
        topicId={topic.id}
        topicName={topic.name}
        filesToUpload={stagedFiles}
        startingPageNumber={sortedPages.length + 1}
        onUploadSuccess={async (newPages) => {
          await onAddPages(newPages);
        }}
      />

      {/* 5. Full-Screen Reader Modal */}
      {activeReaderIndex !== null && (
        <NotebookReaderModal
          isOpen={activeReaderIndex !== null}
          onClose={() => setActiveReaderIndex(null)}
          pages={sortedPages}
          initialPageIndex={activeReaderIndex}
          topicName={topic.name}
        />
      )}

      {/* 6. Edit / Delete Topic Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC]">
              Edit Topic
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#858A93] dark:text-[#A0A5B0]">
                Topic Name
              </label>
              <input
                type="text"
                value={editTopicName}
                onChange={(e) => setEditTopicName(e.target.value)}
                className="w-full px-3 py-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-sm text-[#20232A] dark:text-[#F6F3EC] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(true)}
                className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Topic</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSaveRename}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Confirm Delete Topic Confirmation Dialog */}
      {isConfirmDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-semibold text-sm">Delete Topic & Captured Pages?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deleting <strong className="text-white">&ldquo;{topic.name}&rdquo;</strong> will permanently remove it along with all <strong className="text-amber-400">{sortedPages.length} captured pages</strong> from your Google Drive.
            </p>
            <p className="text-[11px] text-slate-400">
              This action cannot be undone. Its parent subject will not be deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteTopicDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete Topic</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Confirm Multiple Pages Deletion Dialog */}
      {isConfirmMultiDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-semibold text-sm">Delete Selected Pages?</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Permanently delete <strong className="text-amber-400">{selectedPageIds.size} selected pages</strong> from your Google Drive?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsConfirmMultiDeleteOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteMultiDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Delete {selectedPageIds.size} Pages</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
