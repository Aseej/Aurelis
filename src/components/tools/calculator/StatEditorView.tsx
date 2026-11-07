import React, { useState } from 'react';
import {
  StatType,
  StatRow,
  StatSummary1Var,
  StatSummaryReg,
} from '../../../utils/calculator/types';
import {
  calculate1VarStats,
  calculateRegStats,
  formatResultNicely,
} from '../../../utils/calculator/mathEngine';
import { BarChart2, Plus, Trash2, RotateCcw, Copy, Check } from 'lucide-react';
import { useI18n } from '../../../i18n';

interface StatEditorViewProps {
  onClose: () => void;
}

export const StatEditorView: React.FC<StatEditorViewProps> = ({ onClose }) => {
  const { t } = useI18n();
  const [statType, setStatType] = useState<StatType>('1-VAR');
  const [rows, setRows] = useState<StatRow[]>([
    { x: 10, y: 15, freq: 1 },
    { x: 20, y: 25, freq: 2 },
    { x: 30, y: 38, freq: 1 },
    { x: 40, y: 50, freq: 1 },
  ]);

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute stats dynamically
  let stats1Var: StatSummary1Var | null = null;
  let statsReg: StatSummaryReg | null = null;

  try {
    if (statType === '1-VAR') {
      stats1Var = calculate1VarStats(rows);
    } else {
      statsReg = calculateRegStats(rows);
    }
  } catch (err: any) {
    // If fewer than 2 points or error
  }

  const addRow = () => {
    setRows((prev) => [...prev, { x: 0, y: 0, freq: 1 }]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateRow = (index: number, field: keyof StatRow, val: string) => {
    const num = parseFloat(val) || 0;
    setRows((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: num };
      return copy;
    });
  };

  const resetData = () => {
    setRows([
      { x: 0, y: 0, freq: 1 },
      { x: 0, y: 0, freq: 1 },
    ]);
  };

  const copyStats = () => {
    let text = `AURELIS ${statType} Statistics Summary:\n`;
    if (stats1Var) {
      text += `n = ${stats1Var.n}\n`;
      text += `Mean (x̄) = ${stats1Var.mean}\n`;
      text += `Sum Σx = ${stats1Var.sumX}\n`;
      text += `Sum Σx² = ${stats1Var.sumX2}\n`;
      text += `Sample std dev (sx) = ${stats1Var.sX}\n`;
      text += `Population std dev (σx) = ${stats1Var.sigmaX}\n`;
      text += `Min = ${stats1Var.minX}, Q1 = ${stats1Var.q1}, Med = ${stats1Var.med}, Q3 = ${stats1Var.q3}, Max = ${stats1Var.maxX}\n`;
    } else if (statsReg) {
      text += `n = ${statsReg.n}\n`;
      text += `Regression: y = a + bx\n`;
      text += `a (intercept) = ${statsReg.a}\n`;
      text += `b (slope) = ${statsReg.b}\n`;
      text += `r (correlation) = ${statsReg.r}\n`;
      text += `r² = ${statsReg.r * statsReg.r}\n`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-xl max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-base sm:text-lg">
            {t('calc.statTitle', 'Statistics & Regression (MODE 3)')}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
        >
          {t('calc.exitToComp', 'Exit to COMP')}
        </button>
      </div>

      {/* Model Selection (1-VAR vs A+BX) */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setStatType('1-VAR')}
          className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all border ${
            statType === '1-VAR'
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('calc.stat1Var', '1: 1-VAR (Single Variable)')}
        </button>
        <button
          onClick={() => setStatType('A+BX')}
          className={`py-2 px-3 rounded-lg text-xs font-mono font-semibold transition-all border ${
            statType === 'A+BX'
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
              : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('calc.statLinear', '2: A+BX (Linear Regression)')}
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-slate-950/70 rounded-lg border border-slate-800 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
            {t('calc.dataMatrix', 'Data Matrix ({count} rows)', { count: rows.length })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={addRow}
              className="flex items-center gap-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded border border-amber-500/40 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('calc.addRow', 'Add Row')}</span>
            </button>
            <button
              onClick={resetData}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2.5 py-1 rounded transition-colors"
              title={t('calc.resetTable', 'Reset Table')}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {/* Header Row */}
          <div
            className={`grid gap-2 text-[11px] font-mono font-bold text-slate-400 px-1 py-1 border-b border-slate-800 ${
              statType === '1-VAR' ? 'grid-cols-7' : 'grid-cols-9'
            }`}
          >
            <div className="col-span-1 text-center">#</div>
            <div className={statType === '1-VAR' ? 'col-span-3 text-center' : 'col-span-3 text-center'}>
              X
            </div>
            {statType === 'A+BX' && <div className="col-span-3 text-center">Y</div>}
            <div className="col-span-2 text-center">{t('calc.freq', 'Freq')}</div>
            <div className="col-span-1 text-center">{t('calc.del', 'Del')}</div>
          </div>

          {/* Data Rows */}
          {rows.map((row, idx) => (
            <div
              key={idx}
              className={`grid gap-2 items-center px-1 ${
                statType === '1-VAR' ? 'grid-cols-7' : 'grid-cols-9'
              }`}
            >
              <span className="col-span-1 text-center text-xs font-mono text-slate-500">
                {idx + 1}
              </span>
              <input
                type="number"
                step="any"
                value={row.x}
                onChange={(e) => updateRow(idx, 'x', e.target.value)}
                className="col-span-3 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded px-2 py-1 text-center font-mono text-xs text-amber-300 focus:outline-none"
              />
              {statType === 'A+BX' && (
                <input
                  type="number"
                  step="any"
                  value={row.y ?? 0}
                  onChange={(e) => updateRow(idx, 'y', e.target.value)}
                  className="col-span-3 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded px-2 py-1 text-center font-mono text-xs text-amber-300 focus:outline-none"
                />
              )}
              <input
                type="number"
                min="1"
                step="1"
                value={row.freq}
                onChange={(e) => updateRow(idx, 'freq', e.target.value)}
                className="col-span-2 bg-slate-900 border border-slate-700 focus:border-amber-500 rounded px-2 py-1 text-center font-mono text-xs text-slate-200 focus:outline-none"
              />
              <button
                onClick={() => removeRow(idx)}
                disabled={rows.length <= 1}
                className="col-span-1 flex justify-center text-slate-600 hover:text-rose-400 disabled:opacity-30 disabled:hover:text-slate-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Statistical Summary Panel */}
      <div className="bg-slate-950 rounded-lg border border-amber-500/40 p-3 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-mono font-semibold text-amber-400">
            {statType === '1-VAR' ? t('calc.stat1VarSummary', '1-Variable Statistics Summary') : t('calc.statRegSummary', 'Linear Regression (y = a + bx)')}
          </span>
          <button
            onClick={copyStats}
            className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? t('common.copied', 'Copied') : t('common.copy', 'Copy')}</span>
          </button>
        </div>

        {statType === '1-VAR' && stats1Var && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.sampleSize', 'n (Sample Size)')}</span>
              <span className="text-amber-300 font-bold">{stats1Var.n}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.mean', 'x̄ (Mean)')}</span>
              <span className="text-amber-300 font-bold">{formatResultNicely(stats1Var.mean)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.sumX', 'Σx (Sum of X)')}</span>
              <span className="text-slate-200">{formatResultNicely(stats1Var.sumX)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.sumX2', 'Σx² (Sum of X²)')}</span>
              <span className="text-slate-200">{formatResultNicely(stats1Var.sumX2)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.sampleStdDev', 'sx (Sample Std Dev)')}</span>
              <span className="text-emerald-400 font-bold">{formatResultNicely(stats1Var.sX)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.popStdDev', 'σx (Population Std Dev)')}</span>
              <span className="text-emerald-400">{formatResultNicely(stats1Var.sigmaX)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.minX', 'minX')}</span>
              <span className="text-slate-200">{formatResultNicely(stats1Var.minX)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.q1', 'Q1 (1st Quartile)')}</span>
              <span className="text-slate-200">{formatResultNicely(stats1Var.q1)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.median', 'Med (Median)')}</span>
              <span className="text-amber-300 font-bold">{formatResultNicely(stats1Var.med)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.q3', 'Q3 (3rd Quartile)')}</span>
              <span className="text-slate-200">{formatResultNicely(stats1Var.q3)}</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">{t('calc.maxX', 'maxX')}</span>
              <span className="text-slate-200">{formatResultNicely(stats1Var.maxX)}</span>
            </div>
          </div>
        )}

        {statType === 'A+BX' && statsReg && (
          <div className="space-y-3 font-mono text-xs">
            {/* Fitted Equation */}
            <div className="p-2.5 bg-slate-900 rounded border border-amber-500/30 text-center">
              <span className="text-slate-400 block text-[10px] mb-1">{t('calc.fittedLinearModel', 'Fitted Linear Model')}</span>
              <span className="text-base font-bold text-amber-300">
                y = {formatResultNicely(statsReg.a)} + ({formatResultNicely(statsReg.b)})·x
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('calc.yIntercept', 'a (Y-Intercept)')}</span>
                <span className="text-amber-300 font-bold">{formatResultNicely(statsReg.a)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('calc.slope', 'b (Slope)')}</span>
                <span className="text-amber-300 font-bold">{formatResultNicely(statsReg.b)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('calc.correlation', 'r (Correlation)')}</span>
                <span className="text-emerald-400 font-bold">{formatResultNicely(statsReg.r)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('calc.coeffOfDeterm', 'r² (Coeff of Determ)')}</span>
                <span className="text-emerald-400">{formatResultNicely(statsReg.r * statsReg.r)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('calc.meanX', 'x̄ (Mean X)')}</span>
                <span className="text-slate-200">{formatResultNicely(statsReg.meanX)}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-slate-400 block text-[10px]">{t('calc.meanY', 'ȳ (Mean Y)')}</span>
                <span className="text-slate-200">{formatResultNicely(statsReg.meanY)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
