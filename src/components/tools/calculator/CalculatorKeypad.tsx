import React from 'react';
import { ShiftAlphaState, CalculatorMode, BaseNRadix } from '../../../utils/calculator/types';

interface CalculatorKeypadProps {
  shiftAlpha: ShiftAlphaState;
  mode?: CalculatorMode;
  radix?: BaseNRadix;
  onKeyPress: (key: string) => void;
  onDpad: (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => void;
  onShiftToggle: () => void;
  onAlphaToggle: () => void;
  onModePress: () => void;
  onClear: () => void;
  onDelete: () => void;
  onCalculate: () => void;
}

export const CalculatorKeypad: React.FC<CalculatorKeypadProps> = ({
  shiftAlpha,
  mode = 'COMP',
  radix = 'DEC',
  onKeyPress,
  onDpad,
  onShiftToggle,
  onAlphaToggle,
  onModePress,
  onClear,
  onDelete,
  onCalculate,
}) => {
  // Key press handler taking SHIFT, ALPHA, and BASE-N mode into account
  const handleKeyClick = (base: string, shiftVal?: string, alphaVal?: string) => {
    // In BASE-N mode, handle direct base switching and hex inputs
    if (mode === 'BASE-N') {
      if (base === '^2') {
        onKeyPress('DEC');
        return;
      }
      if (base === '^') {
        onKeyPress('HEX');
        return;
      }
      if (base === 'log') {
        onKeyPress('BIN');
        return;
      }
      if (base === 'ln') {
        onKeyPress('OCT');
        return;
      }
      // In HEX base, Row 2 buttons directly input hex letters A-F unless SHIFT is active
      if (radix === 'HEX' && alphaVal && shiftAlpha !== 'SHIFT') {
        onKeyPress(alphaVal);
        return;
      }
      // Decimal dot is disabled in Base-N
      if (base === '.') {
        return;
      }
    }

    if (shiftAlpha === 'SHIFT' && shiftVal) {
      onKeyPress(shiftVal);
    } else if (shiftAlpha === 'ALPHA' && alphaVal) {
      onKeyPress(alphaVal);
    } else {
      onKeyPress(base);
    }
  };

  return (
    <div className="w-full space-y-2 select-none">
      {/* 1. TOP CONTROL CLUSTER: SHIFT, ALPHA, REPLAY D-PAD, MODE, ON */}
      <div className="flex items-center justify-between gap-1.5 px-0.5">
        {/* Left: SHIFT and ALPHA */}
        <div className="flex flex-col gap-1.5 w-[72px] sm:w-20">
          {/* SHIFT KEY */}
          <button
            type="button"
            onClick={onShiftToggle}
            className={`h-7 sm:h-8 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shadow-xs flex items-center justify-center border ${
              shiftAlpha === 'SHIFT'
                ? 'bg-[#E6C27A] text-black border-[#A97B32] shadow-inner font-extrabold ring-1 ring-[#A97B32]'
                : 'bg-[#403B2A] text-[#FFE8A3] border-[#5A533C] hover:bg-[#4E4734] active:scale-95'
            }`}
          >
            SHIFT
          </button>

          {/* ALPHA KEY */}
          <button
            type="button"
            onClick={onAlphaToggle}
            className={`h-7 sm:h-8 rounded-lg font-bold text-[10px] sm:text-xs tracking-wider transition-all shadow-xs flex items-center justify-center border ${
              shiftAlpha === 'ALPHA'
                ? 'bg-[#F87171] text-white border-[#DC2626] shadow-inner font-extrabold ring-1 ring-[#DC2626]'
                : 'bg-[#402A2A] text-[#FFA8A8] border-[#5A3C3C] hover:bg-[#4E3434] active:scale-95'
            }`}
          >
            ALPHA
          </button>
        </div>

        {/* Center: Concentric REPLAY 4-Way D-Pad */}
        <div className="relative flex items-center justify-center">
          <div className="relative h-20 w-20 sm:h-22 sm:w-22 rounded-full bg-gradient-to-b from-[#2E3642] to-[#161C24] p-1.5 shadow-md border border-white/10 dark:border-white/5 flex items-center justify-center">
            {/* Inner concentric ring */}
            <div className="relative h-full w-full rounded-full bg-gradient-to-br from-[#1C222B] to-[#12161D] flex items-center justify-center border border-black/40">
              <span className="text-[8px] font-sans font-bold text-[#858A93] tracking-widest uppercase pointer-events-none">
                REPLAY
              </span>

              {/* D-Pad Up */}
              <button
                type="button"
                onClick={() => onDpad('UP')}
                aria-label="Replay Up"
                className="absolute top-0 inset-x-0 h-6 flex items-start justify-center pt-0.5 text-[#A7ABB5] hover:text-[#FFE6AD] active:text-[#E6C27A] transition"
              >
                <span className="text-xs">▲</span>
              </button>

              {/* D-Pad Down */}
              <button
                type="button"
                onClick={() => onDpad('DOWN')}
                aria-label="Replay Down"
                className="absolute bottom-0 inset-x-0 h-6 flex items-end justify-center pb-0.5 text-[#A7ABB5] hover:text-[#FFE6AD] active:text-[#E6C27A] transition"
              >
                <span className="text-xs">▼</span>
              </button>

              {/* D-Pad Left */}
              <button
                type="button"
                onClick={() => onDpad('LEFT')}
                aria-label="Replay Left"
                className="absolute left-0 inset-y-0 w-6 flex items-center justify-start pl-0.5 text-[#A7ABB5] hover:text-[#FFE6AD] active:text-[#E6C27A] transition"
              >
                <span className="text-xs">◀</span>
              </button>

              {/* D-Pad Right */}
              <button
                type="button"
                onClick={() => onDpad('RIGHT')}
                aria-label="Replay Right"
                className="absolute right-0 inset-y-0 w-6 flex items-center justify-end pr-0.5 text-[#A7ABB5] hover:text-[#FFE6AD] active:text-[#E6C27A] transition"
              >
                <span className="text-xs">▶</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: MODE/SETUP and ON */}
        <div className="flex flex-col gap-1.5 w-[72px] sm:w-20">
          {/* MODE / SETUP */}
          <button
            type="button"
            onClick={onModePress}
            className="h-7 sm:h-8 rounded-lg bg-[#252A34] text-[#E0E2EC] border border-[#3A404E] hover:bg-[#303642] active:scale-95 font-medium text-[9px] sm:text-[10px] tracking-tight transition-all shadow-xs flex flex-col items-center justify-center"
          >
            <span className="text-[7.5px] text-[#FFE8A3] leading-none font-bold">SETUP</span>
            <span className="leading-none mt-0.5 font-semibold">MODE</span>
          </button>

          {/* ON Key */}
          <button
            type="button"
            onClick={onClear}
            className="h-7 sm:h-8 rounded-lg bg-[#252A34] text-[#E0E2EC] border border-[#3A404E] hover:bg-[#303642] active:scale-95 font-semibold text-[10px] sm:text-xs tracking-wider transition-all shadow-xs flex items-center justify-center"
          >
            ON
          </button>
        </div>
      </div>

      {/* 2. FUNCTION ROWS (fx-991ES Scientific Buttons with dual labels) */}
      <div className="space-y-1.5 pt-1">
        {/* Function Row 1: Fraction, sqrt, x^2 (DEC), x^y (HEX), log (BIN), ln (OCT) */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {[
            { base: 'frac', label: 'a b/c', shift: 'd/c', shiftLabel: 'd/c' },
            { base: 'sqrt', label: '√', shift: 'cbrt', shiftLabel: '³√' },
            { base: '^2', label: 'x²', shift: '^3', shiftLabel: 'x³', baseN: 'DEC' },
            { base: '^', label: 'xʸ', shift: 'xroot', shiftLabel: 'ʸ√x', baseN: 'HEX' },
            { base: 'log', label: 'log', shift: '10^', shiftLabel: '10ˣ', baseN: 'BIN' },
            { base: 'ln', label: 'ln', shift: 'e^', shiftLabel: 'eˣ', baseN: 'OCT' },
          ].map((k) => {
            const isBaseNKey = mode === 'BASE-N' && k.baseN;
            const isBaseNActive = mode === 'BASE-N' && radix === k.baseN;
            return (
              <div key={k.base} className="flex flex-col items-center">
                <span
                  className={`h-3 text-[8.5px] font-bold truncate transition-colors ${
                    isBaseNKey
                      ? 'text-cyan-400 font-extrabold'
                      : 'text-[#D4AF37] dark:text-[#E6C27A]'
                  }`}
                >
                  {isBaseNKey ? k.baseN : k.shiftLabel}
                </span>
                <button
                  type="button"
                  onClick={() => handleKeyClick(k.base, k.shift)}
                  className={`w-full h-8 sm:h-9 rounded-lg text-[#F0F2F6] active:scale-95 text-[11px] sm:text-xs font-semibold shadow-xs flex items-center justify-center transition border ${
                    isBaseNActive
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400 font-bold'
                      : 'bg-[#242933] border-[#363E4D] hover:bg-[#2F3644]'
                  }`}
                >
                  {k.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* Function Row 2: (-), degree, hyp, sin, cos, tan (Hex Digits A, B, C, D, E, F) */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {[
            { base: 'neg', label: '(-)', alpha: 'A', alphaLabel: 'A' },
            { base: 'dms', label: '° \' "', alpha: 'B', alphaLabel: 'B', shift: 'dms_inv', shiftLabel: '←' },
            { base: 'hyp', label: 'hyp', alpha: 'C', alphaLabel: 'C', shift: 'abs', shiftLabel: 'Abs' },
            { base: 'sin', label: 'sin', shift: 'asin', shiftLabel: 'sin⁻¹', alpha: 'D', alphaLabel: 'D' },
            { base: 'cos', label: 'cos', shift: 'acos', shiftLabel: 'cos⁻¹', alpha: 'E', alphaLabel: 'E' },
            { base: 'tan', label: 'tan', shift: 'atan', shiftLabel: 'tan⁻¹', alpha: 'F', alphaLabel: 'F' },
          ].map((k) => {
            const isHexActive = mode === 'BASE-N' && radix === 'HEX';
            return (
              <div key={k.base} className="flex flex-col items-center">
                <div className="h-3 flex items-center justify-between w-full px-1 text-[8px] font-bold">
                  <span className="text-[#D4AF37] dark:text-[#E6C27A] truncate">
                    {mode === 'BASE-N' ? '' : k.shiftLabel || ''}
                  </span>
                  <span
                    className={`truncate ${
                      isHexActive
                        ? 'text-red-400 font-extrabold text-[9px]'
                        : 'text-[#EF4444] dark:text-[#F87171]'
                    }`}
                  >
                    {k.alphaLabel || ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleKeyClick(k.base, k.shift, k.alpha)}
                  className={`w-full h-8 sm:h-9 rounded-lg text-[#F0F2F6] active:scale-95 text-[11px] sm:text-xs font-semibold shadow-xs flex items-center justify-center transition border ${
                    isHexActive
                      ? 'bg-[#2E2025] border-red-500/50 hover:bg-[#3B262E]'
                      : 'bg-[#242933] border-[#363E4D] hover:bg-[#2F3644]'
                  }`}
                >
                  {k.label}
                </button>
              </div>
            );
          })}
        </div>

        {/* Function Row 3: RCL, ENG, (, ), S<=>D, M+ */}
        <div className="grid grid-cols-6 gap-1 sm:gap-1.5">
          {[
            { base: 'rcl', label: 'RCL', shift: 'sto', shiftLabel: 'STO' },
            { base: 'eng', label: 'ENG', shift: 'eng_inv', shiftLabel: '←' },
            { base: '(', label: '(', alpha: 'X', alphaLabel: 'X' },
            { base: ')', label: ')', alpha: 'Y', alphaLabel: 'Y' },
            { base: 'sd', label: 'S⇔D' },
            { base: 'm_plus', label: 'M+', shift: 'm_minus', shiftLabel: 'M-', alpha: 'M', alphaLabel: 'M' },
          ].map((k) => (
            <div key={k.base} className="flex flex-col items-center">
              <div className="h-3 flex items-center justify-between w-full px-1 text-[8px] font-bold">
                <span className="text-[#D4AF37] dark:text-[#E6C27A] truncate">
                  {k.shiftLabel || ''}
                </span>
                <span className="text-[#EF4444] dark:text-[#F87171] truncate">
                  {k.alphaLabel || ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleKeyClick(k.base, k.shift, k.alpha)}
                className="w-full h-8 sm:h-9 rounded-lg bg-[#242933] text-[#F0F2F6] border border-[#363E4D] hover:bg-[#2F3644] active:scale-95 text-[10.5px] sm:text-xs font-semibold shadow-xs flex items-center justify-center transition"
              >
                {k.label}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PRIMARY NUMERIC & OPERATION KEYPAD */}
      <div className="space-y-1.5 pt-1 border-t border-black/[0.08] dark:border-white/[0.08]">
        {/* Row 4: 7, 8, 9, DEL, AC */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {['7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => onKeyPress(digit)}
              className="h-10 sm:h-11 rounded-xl bg-[#EBECEF] dark:bg-[#222730] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#2B313C] active:scale-95 text-base sm:text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
            >
              {digit}
            </button>
          ))}
          {/* DEL (Navy Blue) */}
          <button
            type="button"
            onClick={onDelete}
            className="h-10 sm:h-11 rounded-xl bg-[#1E3A8A] text-white border border-[#2563EB]/40 hover:bg-[#2563EB] active:scale-95 text-xs sm:text-sm font-bold tracking-wider shadow-xs flex items-center justify-center transition"
          >
            DEL
          </button>
          {/* AC (Orange/Coral) */}
          <button
            type="button"
            onClick={onClear}
            className="h-10 sm:h-11 rounded-xl bg-[#DC2626] text-white border border-[#EF4444]/40 hover:bg-[#EF4444] active:scale-95 text-xs sm:text-sm font-bold tracking-wider shadow-xs flex items-center justify-center transition"
          >
            AC
          </button>
        </div>

        {/* Row 5: 4, 5, 6, ×, ÷ */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {['4', '5', '6'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => onKeyPress(digit)}
              className="h-10 sm:h-11 rounded-xl bg-[#EBECEF] dark:bg-[#222730] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#2B313C] active:scale-95 text-base sm:text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
            >
              {digit}
            </button>
          ))}
          {/* × (Multiplication, Shift: nPr) */}
          <button
            type="button"
            onClick={() => handleKeyClick('×', 'npr')}
            className="h-10 sm:h-11 rounded-xl bg-[#D6D9E0] dark:bg-[#2A313E] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-[#E2E4EB] dark:hover:bg-[#343D4D] active:scale-95 text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
          >
            ×
          </button>
          {/* ÷ (Division, Shift: nCr) */}
          <button
            type="button"
            onClick={() => handleKeyClick('÷', 'ncr')}
            className="h-10 sm:h-11 rounded-xl bg-[#D6D9E0] dark:bg-[#2A313E] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-[#E2E4EB] dark:hover:bg-[#343D4D] active:scale-95 text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
          >
            ÷
          </button>
        </div>

        {/* Row 6: 1, 2, 3, +, - */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {['1', '2', '3'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => onKeyPress(digit)}
              className="h-10 sm:h-11 rounded-xl bg-[#EBECEF] dark:bg-[#222730] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#2B313C] active:scale-95 text-base sm:text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
            >
              {digit}
            </button>
          ))}
          {/* + (Addition, Shift: Pol) */}
          <button
            type="button"
            onClick={() => handleKeyClick('+', 'pol')}
            className="h-10 sm:h-11 rounded-xl bg-[#D6D9E0] dark:bg-[#2A313E] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-[#E2E4EB] dark:hover:bg-[#343D4D] active:scale-95 text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
          >
            +
          </button>
          {/* - (Subtraction, Shift: Rec) */}
          <button
            type="button"
            onClick={() => handleKeyClick('-', 'rec')}
            className="h-10 sm:h-11 rounded-xl bg-[#D6D9E0] dark:bg-[#2A313E] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-[#E2E4EB] dark:hover:bg-[#343D4D] active:scale-95 text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
          >
            -
          </button>
        </div>

        {/* Row 7: 0, ., ×10ˣ, Ans, = */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {/* 0 */}
          <button
            type="button"
            onClick={() => onKeyPress('0')}
            className="h-10 sm:h-11 rounded-xl bg-[#EBECEF] dark:bg-[#222730] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#2B313C] active:scale-95 text-base sm:text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
          >
            0
          </button>
          {/* Decimal dot (.) (Shift: Ran#) */}
          <button
            type="button"
            onClick={() => handleKeyClick('.', 'ran#')}
            className="h-10 sm:h-11 rounded-xl bg-[#EBECEF] dark:bg-[#222730] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-white dark:hover:bg-[#2B313C] active:scale-95 text-base sm:text-lg font-bold font-mono shadow-xs flex items-center justify-center transition"
          >
            .
          </button>
          {/* ×10ˣ (Scientific notation, Shift: π, Alpha: e) */}
          <button
            type="button"
            onClick={() => handleKeyClick('×10^', 'π', 'e')}
            className="h-10 sm:h-11 rounded-xl bg-[#D6D9E0] dark:bg-[#2A313E] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-[#E2E4EB] dark:hover:bg-[#343D4D] active:scale-95 text-[11px] sm:text-xs font-bold font-mono shadow-xs flex items-center justify-center transition"
          >
            ×10ˣ
          </button>
          {/* Ans (Previous result) */}
          <button
            type="button"
            onClick={() => onKeyPress('Ans')}
            className="h-10 sm:h-11 rounded-xl bg-[#D6D9E0] dark:bg-[#2A313E] text-[#1E2430] dark:text-[#F0F2F6] border border-black/10 dark:border-white/10 hover:bg-[#E2E4EB] dark:hover:bg-[#343D4D] active:scale-95 text-xs sm:text-sm font-bold font-mono shadow-xs flex items-center justify-center transition"
          >
            Ans
          </button>
          {/* = (Calculate, Gold Accent) */}
          <button
            type="button"
            onClick={onCalculate}
            className="h-10 sm:h-11 rounded-xl bg-[#E6C27A] text-black border border-[#A97B32] hover:bg-[#F3D798] active:scale-95 text-lg font-bold font-mono shadow-sm flex items-center justify-center transition cursor-pointer"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
