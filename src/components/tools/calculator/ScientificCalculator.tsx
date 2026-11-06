import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CalculatorMode,
  AngleMode,
  ShiftAlphaState,
  BaseNRadix,
  CalculationHistoryItem,
} from '../../../utils/calculator/types';
import {
  evaluateExpression,
  decimalToFraction,
  formatResultNicely,
  evaluateComplexExpression,
  formatComplex,
  evaluateBaseNExpression,
  convertBase,
} from '../../../utils/calculator/mathEngine';
import { CalculatorDisplay } from './CalculatorDisplay';
import { CalculatorKeypad } from './CalculatorKeypad';
import { ModeSelectorModal } from './ModeSelectorModal';
import { EqnSolverView } from './EqnSolverView';
import { MatrixVectorView } from './MatrixVectorView';
import { StatEditorView } from './StatEditorView';
import { TableGeneratorView } from './TableGeneratorView';
import { CalculationHistoryDrawer } from './CalculationHistoryDrawer';
import { History, Sparkles, HelpCircle } from 'lucide-react';
import { useI18n } from '../../../i18n';

const STORAGE_KEY_HISTORY = 'aurelis_scientific_calc_history';
const MAX_HISTORY = 50;

export const ScientificCalculator: React.FC = () => {
  const { t } = useI18n();
  // Modes & Settings
  const [mode, setMode] = useState<CalculatorMode>('COMP');
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');
  const [radix, setRadix] = useState<BaseNRadix>('DEC');
  const [shiftAlpha, setShiftAlpha] = useState<ShiftAlphaState>('NONE');

  // Input & Evaluation
  const [expression, setExpression] = useState<string>('');
  const [cursorPos, setCursorPos] = useState<number>(0);
  const [result, setResult] = useState<string>('');
  const [rawNumericResult, setRawNumericResult] = useState<number | null>(null);
  const [fractionResult, setFractionResult] = useState<{ num: number; den: number } | null>(null);
  const [showFraction, setShowFraction] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [engExponentOffset, setEngExponentOffset] = useState<number>(0);

  // Memory & Variables
  const [ans, setAns] = useState<number>(0);
  const [memoryM, setMemoryM] = useState<number>(0);
  const [variables, setVariables] = useState<Record<string, number>>({
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
    X: 0,
    Y: 0,
    M: 0,
  });

  // History
  const [history, setHistory] = useState<CalculationHistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Modals
  const [isModeModalOpen, setIsModeModalOpen] = useState<boolean>(false);
  const [isSetupModal, setIsSetupModal] = useState<boolean>(false);
  const [showHelpGuide, setShowHelpGuide] = useState<boolean>(false);

  // Focus container ref for keyboard navigation
  const calcContainerRef = useRef<HTMLDivElement>(null);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // ignore
    }
  }, [history]);

  // Insert string at current cursor position
  const insertAtCursor = useCallback(
    (textToInsert: string) => {
      setExpression((prev) => {
        const before = prev.slice(0, cursorPos);
        const after = prev.slice(cursorPos);
        return before + textToInsert + after;
      });
      setCursorPos((prev) => prev + textToInsert.length);
      setIsError(false);
      setErrorMessage(undefined);
    },
    [cursorPos]
  );

  // Handle D-pad navigation
  const handleDpad = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (direction === 'LEFT') {
      setCursorPos((prev) => Math.max(0, prev - 1));
    } else if (direction === 'RIGHT') {
      setCursorPos((prev) => Math.min(expression.length, prev + 1));
    } else if (direction === 'UP') {
      // Step backwards into calculation history
      if (history.length > 0) {
        const nextIdx = Math.min(history.length - 1, historyIndex + 1);
        setHistoryIndex(nextIdx);
        const item = history[nextIdx];
        if (item) {
          setExpression(item.expression);
          setCursorPos(item.expression.length);
          setResult(item.result);
        }
      }
    } else if (direction === 'DOWN') {
      // Step forwards towards latest
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        const item = history[nextIdx];
        if (item) {
          setExpression(item.expression);
          setCursorPos(item.expression.length);
          setResult(item.result);
        }
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setExpression('');
        setCursorPos(0);
        setResult('');
      }
    }
  };

  // Toggle S<=>D (fraction vs decimal)
  const toggleStandardDecimal = () => {
    let num = rawNumericResult;
    if (num === null && result) {
      const p = parseFloat(result.replace(/×10\^.*$/, ''));
      if (!Number.isNaN(p)) num = p;
    }

    if (num !== null && Number.isFinite(num)) {
      if (!fractionResult) {
        const frac = decimalToFraction(num);
        if (frac && frac.den > 1) {
          setFractionResult(frac);
          setShowFraction(true);
        }
      } else {
        setShowFraction((prev) => !prev);
      }
    }
  };

  // ENG Button: shift decimal place by powers of 10 in multiples of 3 (Casio fx-991ES behavior)
  const handleEng = (isInverse = false) => {
    let num = rawNumericResult;
    if (num === null && result) {
      const p = parseFloat(result.replace(/×10\^.*$/, ''));
      if (!Number.isNaN(p)) num = p;
    }

    if (num !== null && Number.isFinite(num)) {
      if (num === 0) {
        setResult('0×10^0');
        setShowFraction(false);
        return;
      }

      const step = isInverse ? 3 : -3;
      const newOffset = engExponentOffset + step;
      setEngExponentOffset(newOffset);

      const baseExp = Math.floor(Math.log10(Math.abs(num)) / 3) * 3;
      const targetExp = baseExp + newOffset;
      const mantissa = num / Math.pow(10, targetExp);
      const roundedMantissa = Math.round(mantissa * 1e8) / 1e8;

      setResult(`${roundedMantissa}×10^${targetExp}`);
      setShowFraction(false);
    }
  };

  // Evaluate Expression
  const handleCalculate = () => {
    if (!expression.trim()) return;

    try {
      setIsError(false);
      setErrorMessage(undefined);

      let calcResultStr = '';
      let numericVal: number | null = null;
      let frac: { num: number; den: number } | null = null;

      if (mode === 'CMPLX') {
        const cRes = evaluateComplexExpression(expression, {
          angleMode,
          variables: { ...variables, M: memoryM },
          ans,
        });
        calcResultStr = formatComplex(cRes);
        if (Math.abs(cRes.im) < 1e-12) {
          numericVal = cRes.re;
          frac = decimalToFraction(cRes.re);
        }
      } else if (mode === 'BASE-N') {
        const bnRes = evaluateBaseNExpression(expression, radix);
        calcResultStr = bnRes;
      } else {
        // COMP Mode
        const evaluated = evaluateExpression(expression, {
          angleMode,
          variables: { ...variables, M: memoryM },
          ans,
        });

        numericVal = evaluated;
        calcResultStr = formatResultNicely(evaluated);
        frac = decimalToFraction(evaluated);
      }

      setResult(calcResultStr);
      setRawNumericResult(numericVal);
      setFractionResult(frac);
      setShowFraction(frac !== null && frac.den > 1);

      if (numericVal !== null && Number.isFinite(numericVal)) {
        setAns(numericVal);
      }
      setEngExponentOffset(0);

      // Add to history
      const historyItem: CalculationHistoryItem = {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        expression,
        result: calcResultStr,
        mode,
        angleMode,
        timestamp: new Date().toISOString(),
      };

      setHistory((prev) => [historyItem, ...prev.slice(0, MAX_HISTORY - 1)]);
      setHistoryIndex(-1);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Math ERROR');
      setResult('Syntax ERROR');
    }
  };

  // Switch active Base-N Radix and convert current value/result on the fly
  const handleSwitchRadix = (newRadix: BaseNRadix) => {
    if (newRadix === radix) return;
    const radixMap: Record<BaseNRadix, number> = { DEC: 10, HEX: 16, BIN: 2, OCT: 8 };
    const fromR = radixMap[radix];
    const toR = radixMap[newRadix];

    // If there is an existing calculated result, immediately convert it to the new base!
    if (result && !isError) {
      try {
        const cleanVal = result.replace(/\s*[bdho]$/i, '').trim();
        const converted = convertBase(cleanVal, fromR, toR);
        setResult(converted);
        const parsed = parseInt(converted, toR);
        if (!Number.isNaN(parsed)) setAns(parsed);
      } catch {
        // ignore
      }
    } else if (expression.trim() && !/[+\-*/×÷−]/.test(expression)) {
      // If user typed a single number in the expression without result yet, convert it!
      try {
        const cleanExpr = expression.trim();
        const converted = convertBase(cleanExpr, fromR, toR);
        setExpression(converted);
        setCursorPos(converted.length);
      } catch {
        // ignore
      }
    }

    setRadix(newRadix);
    setIsError(false);
    setErrorMessage(undefined);
  };

  // Clear / All Clear (AC)
  const handleClear = () => {
    setExpression('');
    setCursorPos(0);
    setResult('');
    setRawNumericResult(null);
    setFractionResult(null);
    setShowFraction(false);
    setIsError(false);
    setErrorMessage(undefined);
    setShiftAlpha('NONE');
    setEngExponentOffset(0);
  };

  // Delete (DEL)
  const handleDelete = () => {
    if (cursorPos > 0) {
      setExpression((prev) => {
        const before = prev.slice(0, cursorPos - 1);
        const after = prev.slice(cursorPos);
        return before + after;
      });
      setCursorPos((prev) => Math.max(0, prev - 1));
    }
  };

  // Key press dispatcher
  const handleKeyPress = (key: string) => {
    // Reset Shift/Alpha after normal key
    const currentShiftAlpha = shiftAlpha;
    if (currentShiftAlpha !== 'NONE') {
      setShiftAlpha('NONE');
    }

    // 1. S<=>D (Toggle Fraction vs Decimal)
    if (key === 'SD_TOGGLE' || key === 'sd' || key === 'SD') {
      toggleStandardDecimal();
      return;
    }

    // 2. ENG (Engineering Notation & Shift+ENG for reverse shift)
    if (key === 'ENG' || key === 'eng') {
      handleEng(false);
      return;
    }
    if (key === 'eng_inv' || key === 'ENG_INV') {
      handleEng(true);
      return;
    }

    // 3. Fraction Key (a b/c and d/c)
    if (key === 'frac' || key === 'd/c' || key === 'FRAC') {
      insertAtCursor('⌟');
      return;
    }

    // 4. Memory Operations
    if (key === 'm_plus' || key === 'M_PLUS') {
      if (rawNumericResult !== null) {
        setMemoryM((prev) => prev + rawNumericResult);
      }
      return;
    }
    if (key === 'm_minus' || key === 'M_MINUS') {
      if (rawNumericResult !== null) {
        setMemoryM((prev) => prev - rawNumericResult);
      }
      return;
    }
    if (key === 'rcl' || key === 'RECALL_M') {
      insertAtCursor('M');
      return;
    }
    if (key === 'sto') {
      if (rawNumericResult !== null) {
        setMemoryM(rawNumericResult);
      }
      return;
    }

    // 5. Base-N Radix Switching
    if (key === 'DEC') {
      handleSwitchRadix('DEC');
      return;
    }
    if (key === 'HEX') {
      handleSwitchRadix('HEX');
      return;
    }
    if (key === 'BIN') {
      handleSwitchRadix('BIN');
      return;
    }
    if (key === 'OCT') {
      handleSwitchRadix('OCT');
      return;
    }

    // 6. Scientific Functions Auto-Parentheses
    if (key === 'sqrt') {
      insertAtCursor('√(');
      return;
    }
    if (key === 'cbrt') {
      insertAtCursor('³√(');
      return;
    }
    if (key === 'xroot') {
      insertAtCursor('^(1/');
      return;
    }
    if (key === '10^') {
      insertAtCursor('10^(');
      return;
    }
    if (key === 'e^') {
      insertAtCursor('e^(');
      return;
    }
    if (key === 'neg') {
      insertAtCursor('−');
      return;
    }
    if (key === 'abs') {
      insertAtCursor('abs(');
      return;
    }
    if (['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln'].includes(key)) {
      insertAtCursor(`${key}(`);
      return;
    }

    // 7. Random Generators
    if (key === 'Ran#' || key === 'ran#') {
      const rnd = Math.round(Math.random() * 1000) / 1000;
      insertAtCursor(rnd.toString());
      return;
    }
    if (key === 'RanInt#' || key === 'ranint#') {
      const rndInt = Math.floor(Math.random() * 100) + 1;
      insertAtCursor(rndInt.toString());
      return;
    }

    // 8. Standard character / function insertion
    insertAtCursor(key);
  };

  // Shift and Alpha toggles
  const handleShiftToggle = () => {
    setShiftAlpha((prev) => (prev === 'SHIFT' ? 'NONE' : 'SHIFT'));
  };

  const handleAlphaToggle = () => {
    setShiftAlpha((prev) => (prev === 'ALPHA' ? 'NONE' : 'ALPHA'));
  };

  const handleModePress = () => {
    if (shiftAlpha === 'SHIFT') {
      setShiftAlpha('NONE');
      setIsSetupModal(true);
    } else {
      setIsSetupModal(false);
    }
    setIsModeModalOpen(true);
  };

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        insertAtCursor(e.key);
      } else if (e.key === '.') {
        insertAtCursor('.');
      } else if (e.key === '+') {
        insertAtCursor('+');
      } else if (e.key === '-') {
        insertAtCursor('−');
      } else if (e.key === '*') {
        insertAtCursor('×');
      } else if (e.key === '/') {
        e.preventDefault();
        insertAtCursor('÷');
      } else if (e.key === '(' || e.key === ')') {
        insertAtCursor(e.key);
      } else if (e.key === '^') {
        insertAtCursor('^');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleDpad('LEFT');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleDpad('RIGHT');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleDpad('UP');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleDpad('DOWN');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [insertAtCursor, handleCalculate, handleDelete, handleClear, handleDpad]);

  return (
    <div
      ref={calcContainerRef}
      className="w-full max-w-md mx-auto transition-all select-none"
    >
      {/* 1. Specialized Mode Views (EQN, MATRIX, VECTOR, STAT, TABLE) */}
      {mode === 'EQN' && (
        <EqnSolverView onBackToComp={() => setMode('COMP')} />
      )}

      {(mode === 'MATRIX' || mode === 'VECTOR') && (
        <MatrixVectorView
          type={mode}
          angleMode={angleMode}
          onClose={() => setMode('COMP')}
        />
      )}

      {mode === 'STAT' && (
        <StatEditorView onClose={() => setMode('COMP')} />
      )}

      {mode === 'TABLE' && (
        <TableGeneratorView
          angleMode={angleMode}
          onClose={() => setMode('COMP')}
        />
      )}

      {/* 2. Primary Calculator Body (COMP, CMPLX, BASE-N) */}
      {['COMP', 'CMPLX', 'BASE-N'].includes(mode) && (
        <div className="relative rounded-3xl bg-gradient-to-b from-[#2A2E38] via-[#1E222A] to-[#14161C] p-3 sm:p-5 shadow-2xl border border-white/[0.08] dark:border-white/[0.12] space-y-3">
          {/* Subtle Outer Bezel Rim */}
          <div className="flex items-center justify-between px-1 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-serif tracking-wider font-bold text-xs sm:text-sm text-slate-200">
                AURELIS
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-medium px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                fx-991ES PLUS
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Solar Cell Mockup */}
              <div
                className="w-16 sm:w-20 h-4 sm:h-5 rounded bg-gradient-to-r from-[#2B1B15] via-[#432318] to-[#2B1B15] border border-[#6D3F28]/60 shadow-inner grid grid-cols-4 gap-0.5 p-0.5 opacity-80"
                title={t('calc.twoWayPower', 'TWO WAY POWER (Solar & Battery)')}
              >
                <div className="border-r border-[#6D3F28]/40" />
                <div className="border-r border-[#6D3F28]/40" />
                <div className="border-r border-[#6D3F28]/40" />
                <div />
              </div>

              {/* History Button */}
              <button
                type="button"
                onClick={() => setIsHistoryOpen(true)}
                className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                title={t('calc.viewHistory', 'View Calculation History')}
              >
                <History className="w-4 h-4" />
              </button>

              {/* Help Button */}
              <button
                type="button"
                onClick={() => setShowHelpGuide((prev) => !prev)}
                className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-amber-300 transition-colors"
                title={t('calc.guideAndShortcuts', 'Calculator Guide & Shortcuts')}
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Help Collapsible */}
          {showHelpGuide && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between font-semibold text-amber-300 text-xs">
                <span>{t('calc.featuresTitle', 'fx-991ES PLUS Features')}</span>
                <button
                  onClick={() => setShowHelpGuide(false)}
                  className="text-slate-500 hover:text-slate-300 text-[10px]"
                >
                  {t('common.close', 'Close')}
                </button>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                <li><b className="text-slate-200">SHIFT + MODE:</b> {t('calc.helpShiftMode', 'Open SETUP to switch DEG / RAD / GRA.')}</li>
                <li><b className="text-slate-200">MODE:</b> {t('calc.helpMode', 'Switch to CMPLX, STAT, BASE-N, EQN, MATRIX, VECTOR, TABLE.')}</li>
                <li><b className="text-slate-200">S⇔D:</b> {t('calc.helpSd', 'Toggle between exact fractions (e.g. 3/4) and decimal.')}</li>
                <li><b className="text-slate-200">D-pad ▲ / ▼:</b> {t('calc.helpDpadRecall', 'Recall previous calculations from history.')}</li>
                <li><b className="text-slate-200">D-pad ◄ / ►:</b> {t('calc.helpDpadCursor', 'Move cursor to edit anywhere in expression.')}</li>
              </ul>
            </div>
          )}

          {/* 2. Natural Textbook LCD Screen with Active Radix Display */}
          <CalculatorDisplay
            mode={mode}
            angleMode={angleMode}
            shiftAlpha={shiftAlpha}
            radix={radix}
            onSelectRadix={handleSwitchRadix}
            hasMemory={memoryM !== 0}
            canScrollHistoryUp={history.length > 0 && historyIndex < history.length - 1}
            canScrollHistoryDown={historyIndex >= 0}
            expression={expression}
            cursorPos={cursorPos}
            result={result}
            fractionResult={fractionResult}
            showFraction={showFraction}
            isError={isError}
            errorMessage={errorMessage}
          />

          {/* 2.5 Dedicated Base-N Active Indicator & One-Tap Conversion Bar */}
          {mode === 'BASE-N' && (
            <div className="rounded-2xl p-2.5 bg-black/40 border border-white/10 space-y-2 backdrop-blur-sm animate-fadeIn">
              {/* Active Base Status & Instructions */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="uppercase tracking-wider text-[10px] text-slate-300">{t('calc.activeBase', 'Active Base:')}</span>
                  <span className="font-mono font-bold text-amber-200">
                    {radix} ({radix === 'DEC' ? t('calc.baseDec', 'Decimal · Base 10') : radix === 'HEX' ? t('calc.baseHex', 'Hexadecimal · Base 16') : radix === 'BIN' ? t('calc.baseBin', 'Binary · Base 2') : t('calc.baseOct', 'Octal · Base 8')})
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">{t('calc.tapToConvert', 'Tap to convert')}</span>
              </div>

              {/* 4 Interactive Quick Conversion Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'DEC' as BaseNRadix, name: 'DEC', base: '10', suffix: 'd' },
                  { id: 'HEX' as BaseNRadix, name: 'HEX', base: '16', suffix: 'h' },
                  { id: 'BIN' as BaseNRadix, name: 'BIN', base: '2', suffix: 'b' },
                  { id: 'OCT' as BaseNRadix, name: 'OCT', base: '8', suffix: 'o' },
                ].map((b) => {
                  const isActive = radix === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSwitchRadix(b.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold font-mono flex flex-col items-center justify-center transition-all ${
                        isActive
                          ? 'bg-gradient-to-b from-[#F3D798] to-[#E6C27A] text-black shadow-md ring-2 ring-amber-400 scale-[1.02]'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-white/10 hover:border-amber-400/50 active:scale-95'
                      }`}
                      title={t('calc.convertToBase', 'Convert to {name} (Base {base})', { name: b.name, base: b.base })}
                    >
                      <span className="text-xs sm:text-sm font-extrabold">{b.name}</span>
                      <span className={`text-[9px] ${isActive ? 'text-black/80 font-bold' : 'text-slate-400'}`}>
                        {t('calc.baseLabel', 'Base {base}', { base: b.base })} [{b.suffix}]
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Hex Digits Bar (A–F) for direct input when in Hex base */}
              {radix === 'HEX' && (
                <div className="pt-1.5 border-t border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-red-300 font-semibold uppercase tracking-wider">
                    <span>{t('calc.hexDigits', 'Hexadecimal Digits (A–F)')}</span>
                    <span className="text-[9px] text-slate-400 font-normal">{t('calc.tapToInsert', 'Tap to insert digit')}</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {['A', 'B', 'C', 'D', 'E', 'F'].map((hexChar) => (
                      <button
                        key={hexChar}
                        type="button"
                        onClick={() => insertAtCursor(hexChar)}
                        className="h-7 sm:h-8 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-200 border border-red-500/40 font-mono font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 flex items-center justify-center"
                      >
                        {hexChar}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. Physical Keypad Layout */}
          <CalculatorKeypad
            shiftAlpha={shiftAlpha}
            mode={mode}
            radix={radix}
            onKeyPress={handleKeyPress}
            onDpad={handleDpad}
            onShiftToggle={handleShiftToggle}
            onAlphaToggle={handleAlphaToggle}
            onModePress={handleModePress}
            onClear={handleClear}
            onDelete={handleDelete}
            onCalculate={handleCalculate}
          />
        </div>
      )}

      {/* Mode / Setup Selector Modal */}
      <ModeSelectorModal
        isOpen={isModeModalOpen}
        isSetup={isSetupModal}
        currentMode={mode}
        currentAngleMode={angleMode}
        onSelectMode={(selectedMode) => {
          if (selectedMode === 'BASE-N') {
            setRadix('DEC');
            // If user already had a numeric answer from COMP mode, carry it over as an integer
            if (rawNumericResult !== null && Number.isFinite(rawNumericResult)) {
              const intVal = Math.trunc(rawNumericResult);
              setResult(intVal.toString(10));
              setAns(intVal);
            }
          }
          setMode(selectedMode);
          setIsModeModalOpen(false);
        }}
        onSelectAngleMode={(selectedAngle) => {
          setAngleMode(selectedAngle);
          setIsModeModalOpen(false);
        }}
        onClose={() => setIsModeModalOpen(false)}
      />

      {/* History Drawer */}
      <CalculationHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectExpression={(expr) => {
          setExpression(expr);
          setCursorPos(expr.length);
        }}
        onSelectResult={(res) => {
          insertAtCursor(res);
        }}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
};
