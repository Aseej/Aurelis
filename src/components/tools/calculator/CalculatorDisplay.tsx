import React, { useRef, useEffect } from 'react';
import { CalculatorMode, AngleMode, ShiftAlphaState, BaseNRadix } from '../../../utils/calculator/types';

interface CalculatorDisplayProps {
  mode: CalculatorMode;
  angleMode: AngleMode;
  shiftAlpha: ShiftAlphaState;
  radix?: BaseNRadix;
  hasMemory: boolean;
  canScrollHistoryUp: boolean;
  canScrollHistoryDown: boolean;
  expression: string;
  cursorPos: number;
  result: string;
  fractionResult: { num: number; den: number } | null;
  showFraction: boolean;
  isError: boolean;
  errorMessage?: string;
  onScreenClick?: () => void;
  onSelectRadix?: (radix: BaseNRadix) => void;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  mode,
  angleMode,
  shiftAlpha,
  radix = 'DEC',
  hasMemory,
  canScrollHistoryUp,
  canScrollHistoryDown,
  expression,
  cursorPos,
  result,
  fractionResult,
  showFraction,
  isError,
  errorMessage,
  onScreenClick,
  onSelectRadix,
}) => {
  const exprContainerRef = useRef<HTMLDivElement>(null);

  // Keep cursor in view during editing
  useEffect(() => {
    if (exprContainerRef.current) {
      const el = exprContainerRef.current;
      el.scrollLeft = el.scrollWidth;
    }
  }, [expression, cursorPos]);

  // Render expression with cursor
  const renderExpressionWithCursor = () => {
    const basePrefix = mode === 'BASE-N' ? (
      <span className="font-mono text-xs sm:text-sm font-bold opacity-75 mr-1 select-none">
        {radix === 'DEC' ? 'd' : radix === 'HEX' ? 'h' : radix === 'BIN' ? 'b' : 'o'}
      </span>
    ) : null;

    if (!expression) {
      return (
        <span className="relative inline-flex items-center">
          {basePrefix}
          <span className="w-2 h-4.5 bg-black/80 dark:bg-[#C2CDAE] animate-pulse inline-block" />
        </span>
      );
    }

    const before = expression.slice(0, cursorPos);
    const at = expression.slice(cursorPos, cursorPos + 1) || ' ';
    const after = expression.slice(cursorPos + 1);

    return (
      <span className="font-mono tracking-tight text-black/90 dark:text-[#25321E] select-none text-base sm:text-lg flex items-center">
        {basePrefix}
        <span>{before}</span>
        <span className="relative inline-block bg-black/80 dark:bg-[#344627] text-white dark:text-[#D5E1BE] px-0.5 rounded-xs animate-pulse">
          {at === ' ' ? '\u00A0' : at}
        </span>
        <span>{after}</span>
      </span>
    );
  };

  return (
    <div
      onClick={onScreenClick}
      className="relative w-full rounded-xl p-3 sm:p-4 bg-[#BACBB0] dark:bg-[#8F9E82] shadow-inner border-2 border-[#6E7B64] dark:border-[#5C6752] font-mono text-[#1E2718] dark:text-[#182213] select-none overflow-hidden transition-all"
      style={{
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(255, 255, 255, 0.2)',
      }}
    >
      {/* Subtle Dot Matrix & Glare Texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15 bg-[radial-gradient(#1A2514_1px,transparent_1px)] [background-size:6px_6px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 bg-white/20 rounded-full blur-xl transform -rotate-12"
        aria-hidden="true"
      />

      {/* 1. Status Indicators Row (Casio fx-991ES style annunciators) */}
      <div className="relative z-10 flex items-center justify-between text-[10px] sm:text-[11px] font-semibold tracking-wider border-b border-[#5B6651]/30 pb-1 mb-1.5 opacity-90">
        <div className="flex items-center gap-2">
          {/* Shift Indicator */}
          <span
            className={`px-1 py-0.2 rounded-xs font-bold transition-opacity ${
              shiftAlpha === 'SHIFT'
                ? 'bg-[#1E2718] text-[#DCE7CA]'
                : 'opacity-15'
            }`}
          >
            S
          </span>

          {/* Alpha Indicator */}
          <span
            className={`px-1 py-0.2 rounded-xs font-bold transition-opacity ${
              shiftAlpha === 'ALPHA'
                ? 'bg-[#1E2718] text-[#DCE7CA]'
                : 'opacity-15'
            }`}
          >
            A
          </span>

          {/* Memory Indicator */}
          <span
            className={`font-bold transition-opacity ${
              hasMemory ? 'opacity-100' : 'opacity-15'
            }`}
          >
            M
          </span>
        </div>

        {/* Center: Angle & Math Mode OR Base-N Radix Annunciators */}
        {mode === 'BASE-N' ? (
          <div className="flex items-center gap-1 sm:gap-1.5">
            {(['DEC', 'HEX', 'BIN', 'OCT'] as const).map((b) => {
              const isCur = radix === b;
              const label = b === 'DEC' ? 'Dec' : b === 'HEX' ? 'Hex' : b === 'BIN' ? 'Bin' : 'Oct';
              return (
                <button
                  key={b}
                  type="button"
                  onClick={(e) => {
                    if (onSelectRadix) {
                      e.stopPropagation();
                      onSelectRadix(b);
                    }
                  }}
                  className={`px-1 sm:px-1.5 py-0.2 rounded-xs text-[9px] sm:text-[10px] font-mono tracking-tight transition-all ${
                    isCur
                      ? 'bg-[#1E2718] text-[#DCE7CA] font-extrabold shadow-xs'
                      : 'opacity-30 hover:opacity-80'
                  }`}
                  title={`Switch to Base ${b === 'DEC' ? '10 (Dec)' : b === 'HEX' ? '16 (Hex)' : b === 'BIN' ? '2 (Bin)' : '8 (Oct)'}`}
                >
                  {label}
                </button>
              );
            })}
            <span className="text-[8.5px] uppercase tracking-wider font-extrabold px-1 rounded bg-[#1E2718]/15 text-[#1E2718] ml-1">
              BASE-N
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Angle Mode: D / R / G */}
            <span className="font-bold underline tracking-widest">
              {angleMode === 'DEG' ? 'D' : angleMode === 'RAD' ? 'R' : 'G'}
            </span>

            <span className="text-[9px] uppercase tracking-wider font-bold">
              {mode}
            </span>
          </div>
        )}

        {/* Right: History Navigation Arrows */}
        <div className="flex items-center gap-1">
          <span
            className={`transition-opacity ${
              canScrollHistoryUp ? 'opacity-100 text-[#1E2718]' : 'opacity-20'
            }`}
            title="History Up"
          >
            ▲
          </span>
          <span
            className={`transition-opacity ${
              canScrollHistoryDown ? 'opacity-100 text-[#1E2718]' : 'opacity-20'
            }`}
            title="History Down"
          >
            ▼
          </span>
        </div>
      </div>

      {/* 2. Natural Expression Input Area */}
      <div
        ref={exprContainerRef}
        className="relative z-10 min-h-[34px] sm:min-h-[40px] flex items-center overflow-x-auto whitespace-nowrap scrollbar-none py-1"
      >
        {renderExpressionWithCursor()}
      </div>

      {/* 3. Result Output Area (Right-aligned, Natural fraction, decimal, or Base-N) */}
      <div className="relative z-10 flex items-end justify-between pt-1 border-t border-[#5B6651]/20 min-h-[38px] sm:min-h-[44px]">
        {/* Left side: Base badge or Fraction / S<=>D representation hint */}
        <div className="text-[10px] text-[#424F3A] font-medium flex items-center gap-1.5">
          {mode === 'BASE-N' ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1E2718] text-[#DCE7CA] text-[9.5px] font-mono font-bold tracking-wider shadow-xs">
              <span>{radix}</span>
              <span className="opacity-70">(Base {radix === 'DEC' ? '10' : radix === 'HEX' ? '16' : radix === 'BIN' ? '2' : '8'})</span>
            </span>
          ) : fractionResult ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/10 text-[9px] font-mono">
              <span>S⇔D</span>
            </span>
          ) : null}
        </div>

        {/* Right side: Evaluated value or error */}
        <div className="text-right">
          {isError ? (
            <div className="text-sm sm:text-base font-bold text-red-900 dark:text-red-950 tracking-tight">
              {errorMessage || 'Math ERROR'}
            </div>
          ) : mode === 'BASE-N' ? (
            <div className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-[#161F10] truncate max-w-[260px] sm:max-w-xs flex items-baseline justify-end gap-1.5">
              <span>{result || '0'}</span>
              <span className="text-xs sm:text-sm font-bold opacity-70">
                {radix === 'DEC' ? 'd' : radix === 'HEX' ? 'h' : radix === 'BIN' ? 'b' : 'o'}
              </span>
            </div>
          ) : showFraction && fractionResult && fractionResult.den !== 1 ? (
            /* True stacked fraction representation */
            <div className="inline-flex flex-col items-center justify-center font-bold font-mono text-xs sm:text-sm">
              <span className="px-1 border-b border-[#1E2718] leading-tight">
                {fractionResult.num}
              </span>
              <span className="px-1 leading-tight">
                {fractionResult.den}
              </span>
            </div>
          ) : (
            <div className="text-lg sm:text-2xl font-bold font-mono tracking-tight text-[#161F10] truncate max-w-[260px] sm:max-w-xs">
              {result || '0'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
