/**
 * AURELIS Scientific Calculator (Inspired by fx-991ES PLUS)
 * Type Definitions and Data Structures
 */

export type CalculatorMode =
  | 'COMP'    // 1: General calculations
  | 'CMPLX'   // 2: Complex number calculations
  | 'STAT'    // 3: Statistical and regression calculations
  | 'BASE-N'  // 4: Binary, octal, decimal, hexadecimal calculations
  | 'EQN'     // 5: Equation solving (simultaneous and polynomial)
  | 'MATRIX'  // 6: Matrix calculations
  | 'VECTOR'  // 7: Vector calculations
  | 'TABLE';  // 8: Function table generation

export type AngleMode = 'DEG' | 'RAD' | 'GRA';

export type NumberFormat = 'NORM' | 'FIX' | 'SCI' | 'ENG';

export type BaseNRadix = 'DEC' | 'HEX' | 'BIN' | 'OCT';

export type ShiftAlphaState = 'NONE' | 'SHIFT' | 'ALPHA';

export interface CalculationHistoryItem {
  id: string;
  expression: string;
  result: string;
  mode: CalculatorMode;
  angleMode: AngleMode;
  timestamp: string;
}

export interface ComplexNumber {
  re: number;
  im: number;
}

export type MatrixData = number[][];

export type VectorData = number[];

export type EqnType =
  | 'SIMUL_2' // anX + bnY = cn
  | 'SIMUL_3' // anX + bnY + cnZ = dn
  | 'POLY_2'  // aX² + bX + c = 0
  | 'POLY_3'; // aX³ + bX² + cX + d = 0

export type StatType = '1-VAR' | 'A+BX';

export interface StatRow {
  x: number;
  y?: number;
  freq: number;
}

export interface StatSummary1Var {
  n: number;
  sumX: number;
  sumX2: number;
  mean: number;
  sigmaX: number; // population std dev
  sX: number;     // sample std dev
  minX: number;
  maxX: number;
  q1: number;
  med: number;
  q3: number;
}

export interface StatSummaryReg {
  n: number;
  sumX: number;
  sumY: number;
  sumX2: number;
  sumY2: number;
  sumXY: number;
  meanX: number;
  meanY: number;
  a: number; // intercept
  b: number; // slope
  r: number; // correlation coefficient
}

export interface FunctionTableRow {
  x: number;
  fx: number | string;
}
