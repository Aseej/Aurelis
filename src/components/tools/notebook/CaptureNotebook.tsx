import React, { useState, useEffect, useCallback } from 'react';
import {
  NotebookSubject,
  NotebookTopic,
  NotebookPage,
  CaptureNotebookIndex,
  loadNotebookIndexFromDrive,
  saveNotebookIndexToDrive,
  getLocalCachedIndex,
  setLocalCachedIndex,
  deleteMultipleNotebookImages,
} from '../../../services/captureNotebookService';
import {
  subscribeToCloudConnection,
  connectGoogleDrive,
  CloudConnectionInfo,
} from '../../../services/googleDriveService';
import { SubjectView } from './SubjectView';
import { TopicView } from './TopicView';
import {
  Cloud,
  ShieldCheck,
  FolderPlus,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Search,
  Lock,
} from 'lucide-react';

export const CaptureNotebook: React.FC = () => {
  // Cloud Connection State
  const [cloudInfo, setCloudInfo] = useState<CloudConnectionInfo>({
    state: 'initializing',
    user: null,
    email: null,
    hasValidToken: false,
  });
  const [isConnectingDrive, setIsConnectingDrive] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

  // Notebook Data State
  const [indexFileId, setIndexFileId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<NotebookSubject[]>([]);
  const [topics, setTopics] = useState<NotebookTopic[]>([]);
  const [pages, setPages] = useState<NotebookPage[]>([]);

  // Navigation Drilldown State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Loading & Sync States
  const [isLoadingIndex, setIsLoadingIndex] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Add Subject Modal
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Subscribe to Google Drive Connection State
  useEffect(() => {
    const unsubscribe = subscribeToCloudConnection((info) => {
      setCloudInfo(info);
      if (info.hasValidToken && info.state === 'connected') {
        // Load initial cached data first for instant render
        const cached = getLocalCachedIndex(info.email);
        if (cached) {
          setSubjects(cached.subjects || []);
          setTopics(cached.topics || []);
          setPages(cached.pages || []);
        }
        // Then fetch latest from Drive
        fetchIndexFromDrive(info.email);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch Index from Google Drive
  const fetchIndexFromDrive = async (userEmail?: string | null) => {
    setIsLoadingIndex(true);
    setSyncError(null);
    try {
      const { index, indexFileId: fileId } = await loadNotebookIndexFromDrive();
      setIndexFileId(fileId);
      setSubjects(index.subjects || []);
      setTopics(index.topics || []);
      setPages(index.pages || []);
      setLocalCachedIndex(index, userEmail);
    } catch (err: any) {
      console.warn('Could not sync notebook index from Drive:', err);
      if (err.message && err.message.includes('AUTH_REQUIRED')) {
        setCloudInfo((prev) => ({ ...prev, hasValidToken: false, state: 'reauth_required' }));
      } else {
        setSyncError(err.message || 'Unable to sync notebook data from Google Drive.');
      }
    } finally {
      setIsLoadingIndex(false);
    }
  };

  // 3. Connect Google Drive Handler
  const handleConnectGoogleDrive = async () => {
    setIsConnectingDrive(true);
    setConnectError(null);
    try {
      const { user } = await connectGoogleDrive();
      await fetchIndexFromDrive(user.email);
    } catch (err: any) {
      console.error('Google Drive connection error:', err);
      setConnectError(err.message || 'Failed to connect Google Drive.');
    } finally {
      setIsConnectingDrive(false);
    }
  };

  // Helper to commit and persist index updates
  const commitIndexUpdates = async (
    newSubjects: NotebookSubject[],
    newTopics: NotebookTopic[],
    newPages: NotebookPage[]
  ) => {
    const updatedIndex: CaptureNotebookIndex = {
      format: 'aurelis_capture_notebook_index',
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      subjects: newSubjects,
      topics: newTopics,
      pages: newPages,
    };

    // Update local state and cache immediately
    setSubjects(newSubjects);
    setTopics(newTopics);
    setPages(newPages);
    setLocalCachedIndex(updatedIndex, cloudInfo.email);

    // Save to Google Drive in background
    try {
      const savedFileId = await saveNotebookIndexToDrive(updatedIndex, indexFileId);
      if (!indexFileId) setIndexFileId(savedFileId);
    } catch (err: any) {
      console.error('Failed to save notebook index to Google Drive:', err);
      setSyncError('Failed to sync changes to Google Drive. Will retry on next operation.');
    }
  };

  // ==========================================
  // SUBJECT CRUD
  // ==========================================
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;

    setIsProcessing(true);
    try {
      const newSub: NotebookSubject = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: newSubjectName.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await commitIndexUpdates([newSub, ...subjects], topics, pages);
      setNewSubjectName('');
      setIsAddSubjectOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRenameSubject = async (subjectId: string, newName: string) => {
    const updatedSubjects = subjects.map((s) =>
      s.id === subjectId ? { ...s, name: newName, updatedAt: new Date().toISOString() } : s
    );
    await commitIndexUpdates(updatedSubjects, topics, pages);
  };

  const handleDeleteSubject = async (subjectId: string) => {
    // 1. Find all topics and pages belonging to this subject
    const subjectTopicIds = new Set(topics.filter((t) => t.subjectId === subjectId).map((t) => t.id));
    const pagesToDelete = pages.filter((p) => subjectTopicIds.has(p.topicId));
    const driveIdsToDelete = pagesToDelete.map((p) => p.driveFileId);

    // 2. Delete files from Google Drive
    await deleteMultipleNotebookImages(driveIdsToDelete);

    // 3. Update index
    const remainingSubjects = subjects.filter((s) => s.id !== subjectId);
    const remainingTopics = topics.filter((t) => t.subjectId !== subjectId);
    const remainingPages = pages.filter((p) => !subjectTopicIds.has(p.topicId));

    await commitIndexUpdates(remainingSubjects, remainingTopics, remainingPages);

    if (selectedSubjectId === subjectId) {
      setSelectedSubjectId(null);
      setSelectedTopicId(null);
    }
  };

  // ==========================================
  // TOPIC CRUD
  // ==========================================
  const handleAddTopic = async (subjectId: string, topicName: string) => {
    const newTopic: NotebookTopic = {
      id: `top_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      subjectId,
      name: topicName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await commitIndexUpdates(subjects, [newTopic, ...topics], pages);
  };

  const handleRenameTopic = async (topicId: string, newName: string) => {
    const updatedTopics = topics.map((t) =>
      t.id === topicId ? { ...t, name: newName, updatedAt: new Date().toISOString() } : t
    );
    await commitIndexUpdates(subjects, updatedTopics, pages);
  };

  const handleDeleteTopic = async (topicId: string) => {
    // 1. Find all pages in this topic
    const pagesToDelete = pages.filter((p) => p.topicId === topicId);
    const driveIdsToDelete = pagesToDelete.map((p) => p.driveFileId);

    // 2. Delete files from Google Drive
    await deleteMultipleNotebookImages(driveIdsToDelete);

    // 3. Update index
    const remainingTopics = topics.filter((t) => t.id !== topicId);
    const remainingPages = pages.filter((p) => p.topicId !== topicId);

    await commitIndexUpdates(subjects, remainingTopics, remainingPages);

    if (selectedTopicId === topicId) {
      setSelectedTopicId(null);
    }
  };

  // ==========================================
  // PAGE CRUD
  // ==========================================
  const handleAddPages = async (newPages: NotebookPage[]) => {
    const combinedPages = [...pages, ...newPages];
    await commitIndexUpdates(subjects, topics, combinedPages);
  };

  const handleDeletePage = async (pageId: string) => {
    const target = pages.find((p) => p.id === pageId);
    if (target) {
      await deleteMultipleNotebookImages([target.driveFileId]);
      const remainingPages = pages.filter((p) => p.id !== pageId);
      await commitIndexUpdates(subjects, topics, remainingPages);
    }
  };

  const handleDeleteMultiplePages = async (pageIds: string[]) => {
    const targets = pages.filter((p) => pageIds.includes(p.id));
    const driveIds = targets.map((p) => p.driveFileId);

    await deleteMultipleNotebookImages(driveIds);
    const remainingPages = pages.filter((p) => !pageIds.includes(p.id));
    await commitIndexUpdates(subjects, topics, remainingPages);
  };

  // Active Subject & Topic
  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || null;
  const activeTopic = topics.find((t) => t.id === selectedTopicId) || null;

  // Filtered subjects for search
  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSubject = s.name.toLowerCase().includes(q);
    const matchesTopic = topics.some((t) => t.subjectId === s.id && t.name.toLowerCase().includes(q));
    return matchesSubject || matchesTopic;
  });

  // ==========================================
  // RENDER: GOOGLE DRIVE CONNECTION REQUIRED SCREEN
  // ==========================================
  if (!cloudInfo.hasValidToken || cloudInfo.state !== 'connected') {
    return (
      <div className="w-full max-w-xl mx-auto py-8 px-4 animate-fade-in">
        <div className="rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-6 sm:p-8 text-center space-y-6 shadow-2xl">
          {/* Visual Icon Badge */}
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Cloud className="w-8 h-8" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-black shadow-md">
              <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#20232A] dark:text-[#F6F3EC]">
              Connect Google Drive
            </h2>
            <p className="text-xs sm:text-sm text-[#858A93] dark:text-[#A0A5B0] max-w-md mx-auto leading-relaxed">
              Your personal digital notebook library lives in your Google Drive. Connect your account to capture, organize and access your handwritten notes securely across your devices.
            </p>
          </div>

          {/* Value Props Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left pt-2">
            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <div className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Private</span>
              </div>
              <p className="text-[10px] text-[#858A93] dark:text-[#777F8C]">
                Saved exclusively in your own private Google Drive storage.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <div className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" />
                <span>Device Sync</span>
              </div>
              <p className="text-[10px] text-[#858A93] dark:text-[#777F8C]">
                Access handwritten notes on your phone, tablet, and laptop.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] space-y-1">
              <div className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Organized Library</span>
              </div>
              <p className="text-[10px] text-[#858A93] dark:text-[#777F8C]">
                Subject and topic folders keep your syllabus orderly.
              </p>
            </div>
          </div>

          {connectError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 justify-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{connectError}</span>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-2">
            <button
              onClick={handleConnectGoogleDrive}
              disabled={isConnectingDrive}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 mx-auto transition-all disabled:opacity-50"
            >
              {isConnectingDrive ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting to Google Drive...</span>
                </>
              ) : (
                <>
                  <Cloud className="w-4 h-4" />
                  <span>Connect Google Drive</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: CONNECTED CAPTURE NOTEBOOK
  // ==========================================
  return (
    <div className="w-full space-y-5 animate-fade-in">
      {/* 1. Breadcrumb Bar & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] p-3 rounded-2xl">
        {/* Breadcrumb Path */}
        <div className="flex items-center gap-1.5 text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => {
              setSelectedSubjectId(null);
              setSelectedTopicId(null);
            }}
            className={`hover:text-amber-500 transition-colors ${
              !selectedSubjectId ? 'text-amber-500 font-bold' : 'text-[#858A93] dark:text-[#A0A5B0]'
            }`}
          >
            Capture Notebook
          </button>

          {activeSubject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#858A93] shrink-0" />
              <button
                onClick={() => setSelectedTopicId(null)}
                className={`hover:text-amber-500 transition-colors truncate max-w-[140px] ${
                  !selectedTopicId ? 'text-amber-500 font-bold' : 'text-[#858A93] dark:text-[#A0A5B0]'
                }`}
              >
                {activeSubject.name}
              </button>
            </>
          )}

          {activeTopic && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-[#858A93] shrink-0" />
              <span className="text-amber-500 font-bold truncate max-w-[140px]">
                {activeTopic.name}
              </span>
            </>
          )}
        </div>

        {/* Connected Account Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isLoadingIndex && (
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-500">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Syncing...</span>
            </span>
          )}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] text-[11px] font-mono text-[#858A93] dark:text-[#A0A5B0]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Cloud className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[120px] sm:max-w-[180px]">{cloudInfo.email}</span>
          </div>
        </div>
      </div>

      {syncError && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center justify-between">
          <span>{syncError}</span>
          <button
            onClick={() => fetchIndexFromDrive(cloudInfo.email)}
            className="text-[11px] font-semibold underline ml-2"
          >
            Retry Sync
          </button>
        </div>
      )}

      {/* 2. SUB-VIEW DRILLDOWNS */}
      {/* LEVEL 3: Topic View (Captured pages inside active topic) */}
      {activeSubject && activeTopic ? (
        <TopicView
          subject={activeSubject}
          topic={activeTopic}
          pages={pages.filter((p) => p.topicId === activeTopic.id)}
          onRenameTopic={handleRenameTopic}
          onDeleteTopic={handleDeleteTopic}
          onAddPages={handleAddPages}
          onDeletePage={handleDeletePage}
          onDeleteMultiplePages={handleDeleteMultiplePages}
        />
      ) : activeSubject ? (
        /* LEVEL 2: Subject View (Topics inside active subject) */
        <SubjectView
          subject={activeSubject}
          topics={topics}
          pages={pages}
          onSelectTopic={(topic) => setSelectedTopicId(topic.id)}
          onAddTopic={handleAddTopic}
          onRenameSubject={handleRenameSubject}
          onDeleteSubject={handleDeleteSubject}
          onRenameTopic={handleRenameTopic}
          onDeleteTopic={handleDeleteTopic}
        />
      ) : (
        /* LEVEL 1: Subjects Overview (All Subjects in notebook library) */
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#858A93]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notebook subjects and topics..."
                className="w-full pl-10 pr-4 py-2 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-xs sm:text-sm text-[#20232A] dark:text-[#F6F3EC] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              onClick={() => setIsAddSubjectOpen(true)}
              className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Subject</span>
            </button>
          </div>

          {/* Subjects Grid */}
          {filteredSubjects.length === 0 ? (
            <div className="rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-8 text-center space-y-4 max-w-md mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC]">
                  Your Digital Notebook Library is Empty
                </h3>
                <p className="text-xs text-[#858A93] dark:text-[#A0A5B0] mt-1">
                  Create your first subject (e.g. Physics, Chemistry, Biology, or History) to begin digitizing your handwritten notes.
                </p>
              </div>
              <button
                onClick={() => setIsAddSubjectOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Subject</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSubjects.map((sub) => {
                const subTopics = topics.filter((t) => t.subjectId === sub.id);
                const subTopicIds = new Set(subTopics.map((t) => t.id));
                const subPages = pages.filter((p) => subTopicIds.has(p.topicId));

                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className="group rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 hover:border-amber-500/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-105 transition-transform">
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-mono text-amber-500 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          {subPages.length} {subPages.length === 1 ? 'page' : 'pages'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#20232A] dark:text-[#F6F3EC] group-hover:text-amber-500 transition-colors">
                          {sub.name}
                        </h3>
                        <span className="text-xs font-mono text-[#858A93] dark:text-[#777F8C]">
                          {subTopics.length} {subTopics.length === 1 ? 'topic' : 'topics'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
                      <span className="text-[11px] font-semibold text-[#858A93] dark:text-[#777F8C]">
                        Open Subject
                      </span>
                      <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. Add Subject Modal */}
      {isAddSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC]">
              Create New Subject
            </h3>

            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#858A93] dark:text-[#A0A5B0]">
                  Subject Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Physics, Chemistry, Biology..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-sm text-[#20232A] dark:text-[#F6F3EC] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddSubjectOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !newSubjectName.trim()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                >
                  {isProcessing ? 'Creating...' : 'Create Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
