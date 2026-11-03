import React from 'react';
import { CalculatorMode, AngleMode } from '../../../utils/calculator/types';
import { X, Check } from 'lucide-react';

interface ModeSelectorModalProps {
  isOpen: boolean;
  isSetup: boolean; // true for SHIFT+MODE (SETUP), false for MODE
  currentMode: CalculatorMode;
  currentAngleMode: AngleMode;
  onSelectMode: (mode: CalculatorMode) => void;
  onSelectAngleMode: (angle: AngleMode) => void;
  onClose: () => void;
}

export const ModeSelectorModal: React.FC<ModeSelectorModalProps> = ({
  isOpen,
  isSetup,
  currentMode,
  currentAngleMode,
  onSelectMode,
  onSelectAngleMode,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 shadow-2xl space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs font-bold px-2 py-0.5 rounded bg-[#E6C27A]/20 text-[#A97B32] dark:text-[#FFE6AD] border border-[#E6C27A]/30">
              {isSetup ? 'SETUP' : 'MODE'}
            </span>
            <h3 className="font-semibold text-sm text-[#20232A] dark:text-[#F6F3EC]">
              {isSetup ? 'Calculator Setup' : 'Select Calculation Mode'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#858A93] hover:text-[#20232A] dark:hover:text-[#F6F3EC]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isSetup ? (
          /* SETUP: Angle Modes & Display Formats */
          <div className="space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
              Angle Mode
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['DEG', 'RAD', 'GRA'] as AngleMode[]).map((ang, idx) => (
                <button
                  key={ang}
                  onClick={() => {
                    onSelectAngleMode(ang);
                    onClose();
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-xs font-semibold transition-all ${
                    currentAngleMode === ang
                      ? 'bg-[#E6C27A]/20 border-[#E6C27A] text-[#8C6221] dark:text-[#FFE6AD]'
                      : 'border-black/[0.06] dark:border-white/[0.08] text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="text-[10px] text-[#858A93] font-mono mb-0.5">{idx + 1}</span>
                  <span>{ang === 'DEG' ? 'Degree' : ang === 'RAD' ? 'Radian' : 'Gradian'}</span>
                  <span className="text-[10px] opacity-70">({ang})</span>
                </button>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] text-[11px] text-[#686D77] dark:text-[#A7ABB5] border border-black/[0.04] dark:border-white/[0.05]">
              💡 Tap or press number <kbd className="font-mono font-bold">1</kbd>, <kbd className="font-mono font-bold">2</kbd>, or <kbd className="font-mono font-bold">3</kbd> to change angle units.
            </div>
          </div>
        ) : (
          /* MODES: fx-991ES PLUS 8 Modes */
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C] mb-1">
              fx-991ES PLUS Modes
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { mode: 'COMP', num: '1', name: 'COMP', desc: 'General arithmetic' },
                { mode: 'CMPLX', num: '2', name: 'CMPLX', desc: 'Complex numbers' },
                { mode: 'STAT', num: '3', name: 'STAT', desc: 'Statistics & Reg' },
                { mode: 'BASE-N', num: '4', name: 'BASE-N', desc: 'Dec, Hex, Bin, Oct' },
                { mode: 'EQN', num: '5', name: 'EQN', desc: 'Equation solver' },
                { mode: 'MATRIX', num: '6', name: 'MATRIX', desc: 'Matrix operations' },
                { mode: 'VECTOR', num: '7', name: 'VECTOR', desc: 'Vector operations' },
                { mode: 'TABLE', num: '8', name: 'TABLE', desc: 'f(x) value tables' },
              ].map((item) => {
                const isSelected = currentMode === item.mode;
                return (
                  <button
                    key={item.mode}
                    onClick={() => {
                      onSelectMode(item.mode as CalculatorMode);
                      onClose();
                    }}
                    className={`flex items-start gap-2.5 p-2.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-[#E6C27A]/20 border-[#E6C27A] text-[#8C6221] dark:text-[#FFE6AD] font-semibold'
                        : 'border-black/[0.06] dark:border-white/[0.08] text-[#20232A] dark:text-[#F6F3EC] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10 font-mono text-[11px] shrink-0 font-bold">
                      {item.num}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-xs leading-snug flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {isSelected && <Check className="h-3 w-3 text-[#A97B32] dark:text-[#E6C27A]" />}
                      </div>
                      <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] truncate">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
