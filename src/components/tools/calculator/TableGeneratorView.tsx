import React, { useState } from 'react';
import { AngleMode, FunctionTableRow } from '../../../utils/calculator/types';
import {
  generateFunctionTable,
  formatResultNicely,
} from '../../../utils/calculator/mathEngine';
import { Table, Play, Copy, Check, Info } from 'lucide-react';

interface TableGeneratorViewProps {
  angleMode: AngleMode;
  onClose: () => void;
}

export const TableGeneratorView: React.FC<TableGeneratorViewProps> = ({
  angleMode,
  onClose,
}) => {
  const [funcExpr, setFuncExpr] = useState<string>('X^2 - 4*X + 3');
  const [startVal, setStartVal] = useState<string>('0');
  const [endVal, setEndVal] = useState<string>('5');
  const [stepVal, setStepVal] = useState<string>('1');

  const [tableRows, setTableRows] = useState<FunctionTableRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setError(null);
    const start = parseFloat(startVal);
    const end = parseFloat(endVal);
    const step = parseFloat(stepVal);

    if (Number.isNaN(start) || Number.isNaN(end) || Number.isNaN(step)) {
      setError('Please provide valid numbers for Start, End, and Step');
      return;
    }

    try {
      const rows = generateFunctionTable(funcExpr, start, end, step, {
        angleMode,
        variables: {},
        ans: 0,
      });
      setTableRows(rows);
    } catch (err: any) {
      setError(err.message || 'Error evaluating table');
    }
  };

  const copyTable = () => {
    if (!tableRows) return;
    let text = `f(X) = ${funcExpr}\nX\tf(X)\n`;
    for (const row of tableRows) {
      text += `${row.x}\t${typeof row.fx === 'number' ? formatResultNicely(row.fx) : row.fx}\n`;
    }
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Quick preset functions
  const insertPreset = (expr: string) => {
    setFuncExpr(expr);
    setTableRows(null);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-4 sm:p-5 border border-slate-800 shadow-xl max-w-xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Table className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-base sm:text-lg">
            Function Table Generator (MODE 8: TABLE)
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
        >
          Exit to COMP
        </button>
      </div>

      {/* Function Input */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-amber-400 font-semibold">
            f(X) =
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            Use &quot;X&quot; as independent variable
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={funcExpr}
            onChange={(e) => setFuncExpr(e.target.value)}
            placeholder="e.g. 2*X + 1 or sin(X)"
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded px-3 py-2 font-mono text-sm text-amber-300 focus:outline-none"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] text-slate-500 self-center">Presets:</span>
          {[
            'X^2 - 4*X + 3',
            '2*X + 1',
            'sin(X)',
            'cos(2*X)',
            'e^(X)',
            '1/X',
          ].map((preset) => (
            <button
              key={preset}
              onClick={() => insertPreset(preset)}
              className="text-[10px] font-mono px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Range Parameters: Start, End, Step */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <label className="text-[10px] font-mono text-slate-400 block mb-1">
            Start?
          </label>
          <input
            type="number"
            step="any"
            value={startVal}
            onChange={(e) => setStartVal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded px-2 py-1 text-center font-mono text-xs text-slate-100 focus:outline-none"
          />
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <label className="text-[10px] font-mono text-slate-400 block mb-1">
            End?
          </label>
          <input
            type="number"
            step="any"
            value={endVal}
            onChange={(e) => setEndVal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded px-2 py-1 text-center font-mono text-xs text-slate-100 focus:outline-none"
          />
        </div>

        <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
          <label className="text-[10px] font-mono text-slate-400 block mb-1">
            Step?
          </label>
          <input
            type="number"
            step="any"
            min="0.001"
            value={stepVal}
            onChange={(e) => setStepVal(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded px-2 py-1 text-center font-mono text-xs text-slate-100 focus:outline-none"
          />
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Generate Table</span>
      </button>

      {/* Error Output */}
      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-xs font-mono text-center">
          {error}
        </div>
      )}

      {/* Generated Table View */}
      {tableRows && (
        <div className="bg-slate-950 rounded-lg border border-amber-500/40 p-3 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="text-xs font-mono text-amber-400">
              <span className="font-bold">f(X) = {funcExpr}</span>
              <span className="text-slate-500 ml-2">({tableRows.length} values)</span>
            </div>
            <button
              onClick={copyTable}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto pr-1">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                  <th className="py-1.5 px-3 w-12 text-center">#</th>
                  <th className="py-1.5 px-3">X</th>
                  <th className="py-1.5 px-3 text-right">f(X)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-1 px-3 text-center text-slate-500">{idx + 1}</td>
                    <td className="py-1 px-3 text-slate-300">{row.x}</td>
                    <td className="py-1 px-3 text-right font-semibold text-amber-300">
                      {typeof row.fx === 'number' ? formatResultNicely(row.fx) : row.fx}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
