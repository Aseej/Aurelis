import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useI18n } from '../../i18n';
import { X, BookOpen, Sparkles, Check } from 'lucide-react';

const PRESET_COLORS = [
  { hex: '#E6C27A', name: 'Champagne Gold' },
  { hex: '#60A5FA', name: 'Celestial Blue' },
  { hex: '#34D399', name: 'Emerald' },
  { hex: '#A78BFA', name: 'Violet' },
  { hex: '#F472B6', name: 'Rose' },
  { hex: '#FB923C', name: 'Amber Glow' },
];

export const AddSubjectModal: React.FC = () => {
  const { isAddSubjectOpen, setIsAddSubjectOpen, addSubject, setSelectedSubjectId } = useApp();
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0].hex);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAddSubjectOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a subject title');
      return;
    }

    addSubject({
      name: name.trim(),
      description: description.trim() || 'Core syllabus and spaced revisions',
      color,
      iconName: 'BookOpen',
    });

    setName('');
    setDescription('');
    setErrorMsg('');
    setIsAddSubjectOpen(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
    >
      <div className="relative w-full max-w-md rounded-3xl glass-premium shadow-2xl overflow-hidden border border-white/20 dark:border-white/10 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-3.5 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6C27A]/15 text-[#A97B32] dark:text-[#E6C27A] border border-[#E6C27A]/30">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-[#20232A] dark:text-[#F6F3EC]">
                {t('addSubjectModal.title', 'Add New Subject')}
              </h2>
              <p className="text-[11px] text-[#858A93] dark:text-[#777F8C]">
                {t('addSubjectModal.subtitle', 'Create a new subject branch in your study curriculum')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddSubjectOpen(false)}
            className="rounded-xl p-1 text-[#858A93] hover:text-[#20232A] dark:text-[#777F8C] dark:hover:text-[#F6F3EC] transition-colors"
            aria-label={t('common.close', 'Close')}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-2.5 text-xs text-red-600 dark:text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Subject Name */}
          <div>
            <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('addSubjectModal.nameLabel', 'Subject Name')} *
            </label>
            <input
              type="text"
              autoFocus
              placeholder={t('addSubjectModal.namePlaceholder', 'e.g. Physics, Macroeconomics, Organic Chemistry')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('addSubjectModal.descLabel', 'Description / Syllabus Scope (Optional)')}
            </label>
            <input
              type="text"
              placeholder={t('addSubjectModal.descPlaceholder', 'e.g. Board Exam Syllabus, Entrance Prep')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-black/[0.08] bg-white/70 px-3 py-2 text-xs text-[#20232A] focus:border-[#E6C27A] focus:outline-none dark:border-white/[0.08] dark:bg-black/30 dark:text-[#F6F3EC]"
            />
          </div>

          {/* Color Tag Selection */}
          <div>
            <label className="font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              {t('addSubjectModal.accentTheme', 'Accent Material Theme')}
            </label>
            <div className="mt-2 flex items-center gap-2.5">
              {PRESET_COLORS.map((item) => (
                <button
                  key={item.hex}
                  type="button"
                  title={item.name}
                  onClick={() => setColor(item.hex)}
                  className={`relative flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                    color === item.hex
                      ? 'ring-2 ring-offset-2 ring-[#E6C27A] dark:ring-offset-[#12141A] scale-110'
                      : 'border-white/20 hover:scale-105 opacity-80'
                  }`}
                  style={{ backgroundColor: item.hex }}
                >
                  {color === item.hex && <Check className="h-3.5 w-3.5 text-black stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsAddSubjectOpen(false)}
              className="rounded-xl border border-black/[0.08] bg-white/60 px-4 py-2 text-xs font-semibold text-[#20232A] hover:bg-black/[0.04] dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-[#F6F3EC] dark:hover:bg-white/[0.08] transition-all"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="btn-gold-primary rounded-xl px-5 py-2 text-xs font-semibold shadow-md active:scale-95 transition-all"
            >
              {t('addSubjectModal.submit', 'Create Subject')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
