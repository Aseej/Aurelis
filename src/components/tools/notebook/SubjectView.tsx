import React, { useState } from 'react';
import {
  NotebookSubject,
  NotebookTopic,
  NotebookPage,
} from '../../../services/captureNotebookService';
import {
  FolderPlus,
  Plus,
  Trash2,
  Edit2,
  FileText,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useI18n } from '../../../i18n';

interface SubjectViewProps {
  subject: NotebookSubject;
  topics: NotebookTopic[];
  pages: NotebookPage[];
  onSelectTopic: (topic: NotebookTopic) => void;
  onAddTopic: (subjectId: string, topicName: string) => Promise<void>;
  onRenameSubject: (subjectId: string, newName: string) => Promise<void>;
  onDeleteSubject: (subjectId: string) => Promise<void>;
  onRenameTopic: (topicId: string, newName: string) => Promise<void>;
  onDeleteTopic: (topicId: string) => Promise<void>;
}

export const SubjectView: React.FC<SubjectViewProps> = ({
  subject,
  topics,
  pages,
  onSelectTopic,
  onAddTopic,
  onRenameSubject,
  onDeleteSubject,
  onRenameTopic,
  onDeleteTopic,
}) => {
  const { t } = useI18n();
  // Add Topic Modal
  const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');

  // Edit / Delete Subject Modal
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [editSubjectName, setEditSubjectName] = useState(subject.name);
  const [isConfirmDeleteSubjectOpen, setIsConfirmDeleteSubjectOpen] = useState(false);

  // Edit Topic inline modal
  const [editingTopic, setEditingTopic] = useState<NotebookTopic | null>(null);
  const [editingTopicName, setEditingTopicName] = useState('');
  const [isConfirmDeleteTopicOpen, setIsConfirmDeleteTopicOpen] = useState(false);

  const [isProcessing, setIsProcessing] = useState(false);

  // Filter topics and pages belonging to this subject
  const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
  const subjectTopicIds = new Set(subjectTopics.map((t) => t.id));
  const subjectPages = pages.filter((p) => subjectTopicIds.has(p.topicId));

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    setIsProcessing(true);
    try {
      await onAddTopic(subject.id, newTopicName.trim());
      setNewTopicName('');
      setIsAddTopicOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveSubjectRename = async () => {
    if (!editSubjectName.trim() || editSubjectName.trim() === subject.name) {
      setIsEditSubjectOpen(false);
      return;
    }
    setIsProcessing(true);
    try {
      await onRenameSubject(subject.id, editSubjectName.trim());
      setIsEditSubjectOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteSubjectDelete = async () => {
    setIsProcessing(true);
    try {
      await onDeleteSubject(subject.id);
      setIsConfirmDeleteSubjectOpen(false);
      setIsEditSubjectOpen(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveTopicRename = async () => {
    if (!editingTopic || !editingTopicName.trim()) return;
    setIsProcessing(true);
    try {
      await onRenameTopic(editingTopic.id, editingTopicName.trim());
      setEditingTopic(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExecuteTopicDelete = async () => {
    if (!editingTopic) return;
    setIsProcessing(true);
    try {
      await onDeleteTopic(editingTopic.id);
      setIsConfirmDeleteTopicOpen(false);
      setEditingTopic(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Subject Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/[0.06] dark:border-white/[0.08] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#20232A] dark:text-[#F6F3EC]">
              {subject.name}
            </h2>
            <button
              onClick={() => {
                setEditSubjectName(subject.name);
                setIsEditSubjectOpen(true);
              }}
              className="p-1 rounded-lg text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
              title="Edit or Delete Subject"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <span className="text-xs font-mono text-[#858A93] dark:text-[#777F8C]">
            {subjectTopics.length} {subjectTopics.length === 1 ? 'topic' : 'topics'} · {subjectPages.length} {subjectPages.length === 1 ? 'page' : 'pages'} total
          </span>
        </div>

        <button
          onClick={() => setIsAddTopicOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t('notebook.newTopic', 'New Topic')}</span>
        </button>
      </div>

      {/* 2. Topics Grid */}
      {subjectTopics.length === 0 ? (
        <div className="rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-8 text-center space-y-4 max-w-md mx-auto my-8">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/20">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC]">
              {t('notebook.noTopics', 'No Topics')}
            </h3>
            <p className="text-xs text-[#858A93] dark:text-[#A0A5B0] mt-1">
              Add your first topic to organize your handwritten pages (e.g. &ldquo;Rotational Motion&rdquo; or &ldquo;Chemical Bonding&rdquo;).
            </p>
          </div>
          <button
            onClick={() => setIsAddTopicOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('notebook.createTopic', 'Create Topic')}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {subjectTopics.map((topic) => {
            const topicPages = pages.filter((p) => p.topicId === topic.id);
            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic)}
                className="group rounded-2xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-4.5 hover:border-amber-500/50 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC] group-hover:text-amber-500 transition-colors">
                      {topic.name}
                    </h3>
                    <span className="text-xs font-mono text-[#858A93] dark:text-[#777F8C] block">
                      {topicPages.length} {topicPages.length === 1 ? 'page' : 'pages'} digitized
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTopic(topic);
                      setEditingTopicName(topic.name);
                    }}
                    className="p-1 rounded-lg text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC] opacity-70 group-hover:opacity-100 transition-opacity"
                    title="Edit Topic"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-black/[0.04] dark:border-white/[0.06]">
                  <span className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                    View Notes
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Add Topic Modal */}
      {isAddTopicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC]">
              Create New Topic in {subject.name}
            </h3>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#858A93] dark:text-[#A0A5B0]">
                  Topic Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  placeholder="e.g. Simple Harmonic Motion, Alcohols..."
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full px-3 py-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-sm text-[#20232A] dark:text-[#F6F3EC] focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsAddTopicOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !newTopicName.trim()}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                >
                  {isProcessing ? 'Creating...' : 'Create Topic'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Edit Subject Modal */}
      {isEditSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC]">
              Edit Subject
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#858A93] dark:text-[#A0A5B0]">
                Subject Name
              </label>
              <input
                type="text"
                value={editSubjectName}
                onChange={(e) => setEditSubjectName(e.target.value)}
                className="w-full px-3 py-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-sm text-[#20232A] dark:text-[#F6F3EC] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteSubjectOpen(true)}
                className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('notebook.deleteSubject', 'Delete Subject')}</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditSubjectOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC]"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSaveSubjectRename}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                >
                  {t('common.save', 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Confirm Delete Subject Modal */}
      {isConfirmDeleteSubjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-semibold text-sm">{t('notebook.deleteSubjectTitle', 'Delete Subject & All Notes?')}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deleting <strong className="text-white">&ldquo;{subject.name}&rdquo;</strong> will permanently remove it along with its <strong className="text-amber-400">{subjectTopics.length} topics</strong> and all <strong className="text-amber-400">{subjectPages.length} captured notebook pages</strong> from your Google Drive.
            </p>
            <p className="text-[11px] text-slate-400">
              {t('notebook.cannotUndo', 'This action cannot be undone.')}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsConfirmDeleteSubjectOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteSubjectDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{t('notebook.deleteSubject', 'Delete Subject')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Edit Topic Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl space-y-4">
            <h3 className="font-serif font-bold text-base text-[#20232A] dark:text-[#F6F3EC]">
              {t('notebook.editTopic', 'Edit Topic')}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#858A93] dark:text-[#A0A5B0]">
                {t('notebook.topicName', 'Topic Name')}
              </label>
              <input
                type="text"
                value={editingTopicName}
                onChange={(e) => setEditingTopicName(e.target.value)}
                className="w-full px-3 py-2 bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.08] rounded-xl text-sm text-[#20232A] dark:text-[#F6F3EC] focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteTopicOpen(true)}
                className="text-xs text-rose-500 hover:text-rose-400 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('notebook.deleteTopic', 'Delete Topic')}</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTopic(null)}
                  className="px-3 py-1.5 text-xs text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC]"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleSaveTopicRename}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold rounded-xl transition-colors disabled:opacity-40"
                >
                  {t('common.save', 'Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Confirm Delete Topic Modal */}
      {isConfirmDeleteTopicOpen && editingTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-5 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="font-semibold text-sm">{t('notebook.deleteTopicTitle', 'Delete Topic?')}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Deleting <strong className="text-white">&ldquo;{editingTopic.name}&rdquo;</strong> will permanently remove it and all of its captured pages from your Google Drive.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsConfirmDeleteTopicOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleExecuteTopicDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{t('notebook.deleteTopic', 'Delete Topic')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
