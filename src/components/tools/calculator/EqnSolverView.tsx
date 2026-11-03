import React, { useState } from 'react';
import { EqnType } from '../../../utils/calculator/types';
import {
  solveSimultaneous2,
  solveSimultaneous3,
  solveQuadratic,
  solveCubic,
  EqnSolution,
} from '../../../utils/calculator/mathEngine';
import { ArrowLeft, Play, RefreshCw } from 'lucide-react';

interface EqnSolverViewProps {
  onBackToComp: () => void;
}

export const EqnSolverView: React.FC<EqnSolverViewProps> = ({ onBackToComp }) => {
  const [eqnType, setEqnType] = useState<EqnType | null>(null);

  // Simultaneous 2-variable inputs: a1, b1, c1, a2, b2, c2
  const [simul2, setSimul2] = useState({ a1: '1', b1: '2', c1: '5', a2: '3', b2: '-1', c2: '1' });

  // Simultaneous 3-variable inputs: 3x4 matrix
  const [simul3, setSimul3] = useState([
    ['1', '1', '1', '6'],
    ['0', '2', '5', '-4'],
    ['2', '5', '-1', '27'],
  ]);

  // Quadratic inputs: a, b, c
  const [quad, setQuad] = useState({ a: '1', b: '-5', c: '6' });

  // Cubic inputs: a, b, c, d
  const [cubic, setCubic] = useState({ a: '1', b: '-6', c: '11', d: '-6' });

  const [solution, setSolution] = useState<EqnSolution | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSolve = () => {
    setError(null);
    try {
      if (eqnType === 'SIMUL_2') {
        const sol = solveSimultaneous2(
          parseFloat(simul2.a1) || 0,
          parseFloat(simul2.b1) || 0,
          parseFloat(simul2.c1) || 0,
          parseFloat(simul2.a2) || 0,
          parseFloat(simul2.b2) || 0,
          parseFloat(simul2.c2) || 0
        );
        setSolution(sol);
      } else if (eqnType === 'SIMUL_3') {
        const matrix = simul3.map((row) => row.map((v) => parseFloat(v) || 0));
        const sol = solveSimultaneous3(matrix);
        setSolution(sol);
      } else if (eqnType === 'POLY_2') {
        const sol = solveQuadratic(
          parseFloat(quad.a) || 0,
          parseFloat(quad.b) || 0,
          parseFloat(quad.c) || 0
        );
        setSolution(sol);
      } else if (eqnType === 'POLY_3') {
        const sol = solveCubic(
          parseFloat(cubic.a) || 0,
          parseFloat(cubic.b) || 0,
          parseFloat(cubic.c) || 0,
          parseFloat(cubic.d) || 0
        );
        setSolution(sol);
      }
    } catch (err: any) {
      setError(err?.message || 'Math ERROR in equation solver');
    }
  };

  return (
    <div className="w-full space-y-4 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#E6C27A]/20 text-[#8C6221] dark:text-[#FFE6AD] border border-[#E6C27A]/30">
            EQN MODE
          </span>
          <span className="text-xs text-[#858A93] dark:text-[#777F8C]">
            {eqnType ? eqnType : 'Choose Equation Type'}
          </span>
        </div>

        <button
          onClick={onBackToComp}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium text-[#686D77] dark:text-[#A7ABB5] hover:text-[#20232A] dark:hover:text-[#F6F3EC] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Exit to COMP</span>
        </button>
      </div>

      {!eqnType ? (
        /* Equation Type Selection (fx-991ES standard 4 options) */
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#858A93] dark:text-[#777F8C]">
            Select Form:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { type: 'SIMUL_2', num: '1', label: 'anX + bnY = cn', desc: 'Simultaneous linear, 2 unknowns' },
              { type: 'SIMUL_3', num: '2', label: 'anX + bnY + cnZ = dn', desc: 'Simultaneous linear, 3 unknowns' },
              { type: 'POLY_2', num: '3', label: 'aX² + bX + c = 0', desc: 'Polynomial degree 2 (Quadratic)' },
              { type: 'POLY_3', num: '4', label: 'aX³ + bX² + cX + d = 0', desc: 'Polynomial degree 3 (Cubic)' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => {
                  setEqnType(item.type as EqnType);
                  setSolution(null);
                  setError(null);
                }}
                className="flex items-start gap-3 p-3 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] hover:border-[#E6C27A] hover:bg-[#E6C27A]/10 text-left transition-all"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black/10 dark:bg-white/10 font-mono text-xs font-bold text-[#8C6221] dark:text-[#FFE6AD] shrink-0">
                  {item.num}
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-xs font-bold text-[#20232A] dark:text-[#F6F3EC]">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-[#858A93] dark:text-[#777F8C] truncate mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Coefficient Matrix Input & Solution Display */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC]">
              Enter Coefficients:
            </span>
            <button
              onClick={() => {
                setEqnType(null);
                setSolution(null);
              }}
              className="text-[11px] text-[#A97B32] dark:text-[#E6C27A] hover:underline"
            >
              Change Equation Type
            </button>
          </div>

          {/* SIMUL 2: 2x3 Matrix */}
          {eqnType === 'SIMUL_2' && (
            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-[#858A93]">
                <span>a (X)</span>
                <span>b (Y)</span>
                <span>=</span>
                <span>c (Constant)</span>
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <input
                  type="number"
                  value={simul2.a1}
                  onChange={(e) => setSimul2({ ...simul2, a1: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <input
                  type="number"
                  value={simul2.b1}
                  onChange={(e) => setSimul2({ ...simul2, b1: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <span className="text-center font-bold text-xs">=</span>
                <input
                  type="number"
                  value={simul2.c1}
                  onChange={(e) => setSimul2({ ...simul2, c1: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
              </div>
              <div className="grid grid-cols-4 gap-2 items-center">
                <input
                  type="number"
                  value={simul2.a2}
                  onChange={(e) => setSimul2({ ...simul2, a2: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <input
                  type="number"
                  value={simul2.b2}
                  onChange={(e) => setSimul2({ ...simul2, b2: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <span className="text-center font-bold text-xs">=</span>
                <input
                  type="number"
                  value={simul2.c2}
                  onChange={(e) => setSimul2({ ...simul2, c2: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
              </div>
            </div>
          )}

          {/* SIMUL 3: 3x4 Matrix */}
          {eqnType === 'SIMUL_3' && (
            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2 overflow-x-auto">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-[#858A93]">
                <span>a (X)</span>
                <span>b (Y)</span>
                <span>c (Z)</span>
                <span>d (Const)</span>
              </div>
              {simul3.map((row, rIdx) => (
                <div key={rIdx} className="grid grid-cols-4 gap-2">
                  {row.map((val, cIdx) => (
                    <input
                      key={cIdx}
                      type="number"
                      value={val}
                      onChange={(e) => {
                        const updated = simul3.map((r, ri) =>
                          ri === rIdx ? r.map((c, ci) => (ci === cIdx ? e.target.value : c)) : r
                        );
                        setSimul3(updated);
                      }}
                      className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                    />
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* POLY 2: Quadratic (a, b, c) */}
          {eqnType === 'POLY_2' && (
            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-[#858A93]">
                <span>a (X²)</span>
                <span>b (X)</span>
                <span>c (Constant)</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  value={quad.a}
                  onChange={(e) => setQuad({ ...quad, a: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <input
                  type="number"
                  value={quad.b}
                  onChange={(e) => setQuad({ ...quad, b: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <input
                  type="number"
                  value={quad.c}
                  onChange={(e) => setQuad({ ...quad, c: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
              </div>
            </div>
          )}

          {/* POLY 3: Cubic (a, b, c, d) */}
          {eqnType === 'POLY_3' && (
            <div className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono text-[#858A93]">
                <span>a (X³)</span>
                <span>b (X²)</span>
                <span>c (X)</span>
                <span>d (Const)</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  value={cubic.a}
                  onChange={(e) => setCubic({ ...cubic, a: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <input
                  type="number"
                  value={cubic.b}
                  onChange={(e) => setCubic({ ...cubic, b: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <input
                  type="number"
                  value={cubic.c}
                  onChange={(e) => setCubic({ ...cubic, c: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
                <input
                  type="number"
                  value={cubic.d}
                  onChange={(e) => setCubic({ ...cubic, d: e.target.value })}
                  className="rounded-xl px-2 py-1.5 text-center font-mono text-xs border border-black/10 dark:border-white/10 bg-white dark:bg-[#1E2430]"
                />
              </div>
            </div>
          )}

          {/* Solve Button */}
          <button
            onClick={handleSolve}
            className="w-full btn-gold-primary py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>SOLVE EQUATION</span>
          </button>

          {/* Results Output */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {solution && (
            <div className="p-4 rounded-2xl bg-[#BACBB0] dark:bg-[#8F9E82] text-[#1E2718] dark:text-[#182213] border-2 border-[#6E7B64] font-mono shadow-inner space-y-2">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#4E5B44] border-b border-[#5B6651]/30 pb-1">
                Solutions:
              </div>
              <div className="space-y-1.5">
                {solution.results.map((res, i) => (
                  <div key={i} className="flex items-center justify-between text-sm sm:text-base font-bold">
                    <span>{res.label} =</span>
                    <span className="text-right">{res.value}</span>
                  </div>
                ))}
              </div>

              {solution.extrema && (
                <div className="pt-2 border-t border-[#5B6651]/30 text-xs font-semibold text-[#384330]">
                  {solution.extrema.label} {solution.extrema.value}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
