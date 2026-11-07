import React, { useState } from 'react';
import {
  MatrixData,
  VectorData,
  AngleMode,
} from '../../../utils/calculator/types';
import {
  matrixAdd,
  matrixSub,
  matrixMul,
  matrixScalarMul,
  matrixTranspose,
  matrixDet,
  matrixInverse,
  vectorAdd,
  vectorSub,
  vectorDot,
  vectorCross,
  vectorMagnitude,
  vectorAngle,
  formatResultNicely,
} from '../../../utils/calculator/mathEngine';
import { Layers, ArrowRight, RotateCcw, Copy, Check } from 'lucide-react';
import { useI18n } from '../../../i18n';

interface MatrixVectorViewProps {
  type: 'MATRIX' | 'VECTOR';
  angleMode: AngleMode;
  onClose: () => void;
}

export const MatrixVectorView: React.FC<MatrixVectorViewProps> = ({
  type,
  angleMode,
  onClose,
}) => {
  const { t } = useI18n();
  // Matrices state (MatA, MatB, MatC)
  const [selectedSlot, setSelectedSlot] = useState<'A' | 'B' | 'C'>('A');
  const [copied, setCopied] = useState(false);

  // Matrix dimensions & data
  const [matDims, setMatDims] = useState<Record<'A' | 'B' | 'C', { rows: number; cols: number }>>({
    A: { rows: 2, cols: 2 },
    B: { rows: 2, cols: 2 },
    C: { rows: 3, cols: 3 },
  });

  const [matrices, setMatrices] = useState<Record<'A' | 'B' | 'C', MatrixData>>({
    A: [
      [1, 2],
      [3, 4],
    ],
    B: [
      [5, 6],
      [7, 8],
    ],
    C: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  });

  // Vector dimensions & data
  const [vctDims, setVctDims] = useState<Record<'A' | 'B' | 'C', number>>({
    A: 3,
    B: 3,
    C: 3,
  });

  const [vectors, setVectors] = useState<Record<'A' | 'B' | 'C', VectorData>>({
    A: [1, 2, 3],
    B: [4, 5, 6],
    C: [0, 1, 0],
  });

  // Operations and calculation output
  const [operation, setOperation] = useState<string>(type === 'MATRIX' ? 'A_ADD_B' : 'A_DOT_B');
  const [scalarK, setScalarK] = useState<number>(2);
  const [calcResult, setCalcResult] = useState<{
    text: string;
    matrix?: MatrixData;
    vector?: VectorData;
    scalar?: number;
  } | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Change matrix dimensions
  const handleDimChange = (rows: number, cols: number) => {
    setMatDims((prev) => ({
      ...prev,
      [selectedSlot]: { rows, cols },
    }));

    const oldMat = matrices[selectedSlot];
    const newMat: number[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: number[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(oldMat[r] && oldMat[r][c] !== undefined ? oldMat[r][c] : 0);
      }
      newMat.push(row);
    }

    setMatrices((prev) => ({
      ...prev,
      [selectedSlot]: newMat,
    }));
  };

  const handleCellChange = (r: number, c: number, val: string) => {
    const num = parseFloat(val) || 0;
    const current = [...matrices[selectedSlot].map((row) => [...row])];
    if (current[r]) {
      current[r][c] = num;
      setMatrices((prev) => ({ ...prev, [selectedSlot]: current }));
    }
  };

  // Change vector dimensions
  const handleVectorDimChange = (dim: number) => {
    setVctDims((prev) => ({ ...prev, [selectedSlot]: dim }));
    const oldV = vectors[selectedSlot];
    const newV: number[] = [];
    for (let i = 0; i < dim; i++) {
      newV.push(oldV[i] !== undefined ? oldV[i] : 0);
    }
    setVectors((prev) => ({ ...prev, [selectedSlot]: newV }));
  };

  const handleVectorCellChange = (idx: number, val: string) => {
    const num = parseFloat(val) || 0;
    const current = [...vectors[selectedSlot]];
    current[idx] = num;
    setVectors((prev) => ({ ...prev, [selectedSlot]: current }));
  };

  // Execute Matrix Calculation
  const runMatrixOperation = () => {
    setCalcError(null);
    setCalcResult(null);

    try {
      if (operation === 'A_ADD_B') {
        const res = matrixAdd(matrices.A, matrices.B);
        setCalcResult({ text: 'MatA + MatB', matrix: res });
      } else if (operation === 'A_SUB_B') {
        const res = matrixSub(matrices.A, matrices.B);
        setCalcResult({ text: 'MatA − MatB', matrix: res });
      } else if (operation === 'A_MUL_B') {
        const res = matrixMul(matrices.A, matrices.B);
        setCalcResult({ text: 'MatA × MatB', matrix: res });
      } else if (operation === 'DET') {
        const d = matrixDet(matrices[selectedSlot]);
        setCalcResult({ text: `det(Mat${selectedSlot})`, scalar: d });
      } else if (operation === 'INV') {
        const inv = matrixInverse(matrices[selectedSlot]);
        setCalcResult({ text: `Mat${selectedSlot}⁻¹`, matrix: inv });
      } else if (operation === 'TRN') {
        const trn = matrixTranspose(matrices[selectedSlot]);
        setCalcResult({ text: `Trn(Mat${selectedSlot})`, matrix: trn });
      } else if (operation === 'SCALAR') {
        const sc = matrixScalarMul(matrices[selectedSlot], scalarK);
        setCalcResult({ text: `${scalarK} × Mat${selectedSlot}`, matrix: sc });
      }
    } catch (err: any) {
      setCalcError(err.message || 'Matrix Operation Failed');
    }
  };

  // Execute Vector Calculation
  const runVectorOperation = () => {
    setCalcError(null);
    setCalcResult(null);

    try {
      if (operation === 'A_ADD_B') {
        const res = vectorAdd(vectors.A, vectors.B);
        setCalcResult({ text: 'VctA + VctB', vector: res });
      } else if (operation === 'A_SUB_B') {
        const res = vectorSub(vectors.A, vectors.B);
        setCalcResult({ text: 'VctA − VctB', vector: res });
      } else if (operation === 'A_DOT_B') {
        const res = vectorDot(vectors.A, vectors.B);
        setCalcResult({ text: 'VctA · VctB (Dot Product)', scalar: res });
      } else if (operation === 'A_CROSS_B') {
        const res = vectorCross(vectors.A, vectors.B);
        setCalcResult({ text: 'VctA × VctB (Cross Product)', vector: res });
      } else if (operation === 'MAG') {
        const mag = vectorMagnitude(vectors[selectedSlot]);
        setCalcResult({ text: `|Vct${selectedSlot}| (Magnitude)`, scalar: mag });
      } else if (operation === 'ANGLE') {
        const ang = vectorAngle(vectors.A, vectors.B, angleMode);
        setCalcResult({ text: `Angle between VctA & VctB (${angleMode})`, scalar: ang });
      }
    } catch (err: any) {
      setCalcError(err.message || 'Vector Operation Failed');
    }
  };

  const copyResult = () => {
    if (!calcResult) return;
    let text = `${calcResult.text}:\n`;
    if (calcResult.matrix) {
      text += calcResult.matrix.map((row) => row.join('\t')).join('\n');
    } else if (calcResult.vector) {
      text += `[${calcResult.vector.join(', ')}]`;
    } else if (calcResult.scalar !== undefined) {
      text += formatResultNicely(calcResult.scalar);
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
          <Layers className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-base sm:text-lg">
            {type === 'MATRIX' ? t('calc.matrixOps', 'Matrix Operations (fx-991ES MODE 6)') : t('calc.vectorOps', 'Vector Operations (fx-991ES MODE 7)')}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded transition-colors"
        >
          {t('calc.exitToComp', 'Exit to COMP')}
        </button>
      </div>

      {/* Target Selector (A, B, C) */}
      <div className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg">
        <span className="text-xs font-mono text-slate-400 uppercase">{t('calc.selectTarget', 'Select Target:')}</span>
        <div className="flex gap-2">
          {(['A', 'B', 'C'] as const).map((slot) => (
            <button
              key={slot}
              onClick={() => {
                setSelectedSlot(slot);
                setCalcResult(null);
                setCalcError(null);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded font-mono transition-all ${
                selectedSlot === slot
                  ? 'bg-amber-500 text-black shadow'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              {type === 'MATRIX' ? `Mat${slot}` : `Vct${slot}`}
            </button>
          ))}
        </div>
      </div>

      {/* Dimension Selector */}
      {type === 'MATRIX' ? (
        <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded-lg text-xs">
          <span className="text-slate-400 font-mono">{t('calc.dimensionsOfMat', 'Dimensions of Mat{slot}:', { slot: selectedSlot })}</span>
          <div className="flex gap-1.5">
            {[
              { r: 2, c: 2, label: '2×2' },
              { r: 3, c: 3, label: '3×3' },
              { r: 2, c: 3, label: '2×3' },
              { r: 3, c: 2, label: '3×2' },
              { r: 1, c: 3, label: '1×3' },
              { r: 3, c: 1, label: '3×1' },
            ].map((d) => (
              <button
                key={d.label}
                onClick={() => handleDimChange(d.r, d.c)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  matDims[selectedSlot].rows === d.r && matDims[selectedSlot].cols === d.c
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-slate-800/40 p-2 rounded-lg text-xs">
          <span className="text-slate-400 font-mono">{t('calc.dimensionOfVct', 'Dimension of Vct{slot}:', { slot: selectedSlot })}</span>
          <div className="flex gap-2">
            {[2, 3].map((dim) => (
              <button
                key={dim}
                onClick={() => handleVectorDimChange(dim)}
                className={`px-3 py-0.5 rounded font-mono text-xs transition-colors ${
                  vctDims[selectedSlot] === dim
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {t('calc.nDVector', '{dim}D Vector', { dim })}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Matrix / Vector Data Grid Editor */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
        <div className="text-xs font-mono text-amber-400 mb-2 flex items-center justify-between">
          <span>{t('calc.editingTarget', 'Editing {target}:', { target: type === 'MATRIX' ? `Mat${selectedSlot}` : `Vct${selectedSlot}` })}</span>
          <span className="text-slate-500 text-[10px]">{t('calc.tapCellsToInput', 'Tap cells to input values')}</span>
        </div>

        {type === 'MATRIX' ? (
          <div
            className="grid gap-2 max-w-sm mx-auto"
            style={{
              gridTemplateColumns: `repeat(${matDims[selectedSlot].cols}, minmax(0, 1fr))`,
            }}
          >
            {matrices[selectedSlot].map((row, r) =>
              row.map((val, c) => (
                <div key={`${r}-${c}`} className="relative">
                  <span className="absolute top-1 left-1.5 text-[9px] text-slate-500 font-mono">
                    {r + 1},{c + 1}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={val}
                    onChange={(e) => handleCellChange(r, c, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded p-2 pt-4 text-center font-mono text-sm text-amber-300 focus:outline-none"
                  />
                </div>
              ))
            )}
          </div>
        ) : (
          <div
            className="grid gap-2 max-w-xs mx-auto"
            style={{
              gridTemplateColumns: `repeat(${vctDims[selectedSlot]}, minmax(0, 1fr))`,
            }}
          >
            {vectors[selectedSlot].map((val, idx) => (
              <div key={idx} className="relative">
                <span className="absolute top-1 left-1.5 text-[9px] text-slate-500 font-mono">
                  {idx === 0 ? 'X (i)' : idx === 1 ? 'Y (j)' : 'Z (k)'}
                </span>
                <input
                  type="number"
                  step="any"
                  value={val}
                  onChange={(e) => handleVectorCellChange(idx, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 rounded p-2 pt-4 text-center font-mono text-sm text-amber-300 focus:outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Operation Selection */}
      <div className="space-y-2">
        <label className="text-xs font-mono text-slate-400">{t('calc.operationLabel', 'Operation:')}</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
          {type === 'MATRIX' ? (
            <>
              <button
                onClick={() => setOperation('A_ADD_B')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'A_ADD_B'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                MatA + MatB
              </button>
              <button
                onClick={() => setOperation('A_SUB_B')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'A_SUB_B'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                MatA − MatB
              </button>
              <button
                onClick={() => setOperation('A_MUL_B')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'A_MUL_B'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                MatA × MatB
              </button>
              <button
                onClick={() => setOperation('DET')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'DET'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                det(Mat{selectedSlot})
              </button>
              <button
                onClick={() => setOperation('INV')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'INV'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Mat{selectedSlot}⁻¹ (Inverse)
              </button>
              <button
                onClick={() => setOperation('TRN')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'TRN'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Trn(Mat{selectedSlot})
              </button>
              <button
                onClick={() => setOperation('SCALAR')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'SCALAR'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                k × Mat{selectedSlot}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setOperation('A_ADD_B')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'A_ADD_B'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                VctA + VctB
              </button>
              <button
                onClick={() => setOperation('A_SUB_B')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'A_SUB_B'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                VctA − VctB
              </button>
              <button
                onClick={() => setOperation('A_DOT_B')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'A_DOT_B'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                VctA · VctB (Dot)
              </button>
              <button
                onClick={() => setOperation('A_CROSS_B')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'A_CROSS_B'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                VctA × VctB (Cross)
              </button>
              <button
                onClick={() => setOperation('MAG')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'MAG'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                |Vct{selectedSlot}| (Magnitude)
              </button>
              <button
                onClick={() => setOperation('ANGLE')}
                className={`p-2 rounded border text-left font-mono transition-colors ${
                  operation === 'ANGLE'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Angle(VctA, VctB)
              </button>
            </>
          )}
        </div>

        {operation === 'SCALAR' && type === 'MATRIX' && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-mono text-slate-400">{t('calc.scalarMultiplierK', 'Scalar multiplier k:')}</span>
            <input
              type="number"
              step="any"
              value={scalarK}
              onChange={(e) => setScalarK(parseFloat(e.target.value) || 0)}
              className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-center font-mono text-sm text-amber-300 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={type === 'MATRIX' ? runMatrixOperation : runVectorOperation}
        className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-lg shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
      >
        <span>{t('calc.calculateBtn', 'Calculate')}</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* Error Message */}
      {calcError && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-xs font-mono text-center">
          {calcError}
        </div>
      )}

      {/* Result Output */}
      {calcResult && (
        <div className="p-3 bg-slate-950 rounded-lg border border-amber-500/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-amber-400 border-b border-slate-800 pb-1.5">
            <span className="font-semibold">{calcResult.text}</span>
            <button
              onClick={copyResult}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-amber-300 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('common.copied', 'Copied') : t('common.copy', 'Copy')}</span>
            </button>
          </div>

          {calcResult.scalar !== undefined && (
            <div className="text-center py-2">
              <span className="text-xl sm:text-2xl font-mono font-bold text-amber-300">
                {formatResultNicely(calcResult.scalar)}
              </span>
            </div>
          )}

          {calcResult.matrix && (
            <div
              className="grid gap-2 max-w-xs mx-auto py-2"
              style={{
                gridTemplateColumns: `repeat(${calcResult.matrix[0].length}, minmax(0, 1fr))`,
              }}
            >
              {calcResult.matrix.map((row, r) =>
                row.map((val, c) => (
                  <div
                    key={`${r}-${c}`}
                    className="bg-slate-900 border border-slate-800 rounded p-2 text-center font-mono text-sm text-emerald-400 font-semibold"
                  >
                    {formatResultNicely(val)}
                  </div>
                ))
              )}
            </div>
          )}

          {calcResult.vector && (
            <div className="flex justify-center gap-2 py-2">
              {calcResult.vector.map((val, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 border border-slate-800 rounded px-3 py-2 text-center font-mono text-sm text-emerald-400 font-semibold"
                >
                  <span className="text-[10px] text-slate-500 block">
                    {idx === 0 ? 'X' : idx === 1 ? 'Y' : 'Z'}
                  </span>
                  {formatResultNicely(val)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
