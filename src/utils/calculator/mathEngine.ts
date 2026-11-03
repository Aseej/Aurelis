/**
 * AURELIS Scientific Calculator Mathematical Engine
 * Comprehensive, deterministic mathematical engine inspired by the Casio fx-991ES PLUS.
 * Does NOT use JavaScript eval(). Implements safe AST tokenization, shunting-yard evaluation,
 * fractions, complex numbers, base-n, simultaneous & polynomial equation solvers,
 * matrices, vectors, and statistical analysis.
 */

import {
  AngleMode,
  ComplexNumber,
  EqnType,
  MatrixData,
  VectorData,
  StatRow,
  StatSummary1Var,
  StatSummaryReg,
  FunctionTableRow,
} from './types';

// ==========================================
// 1. ARITHMETIC & FRACTION UTILITIES
// ==========================================

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function lcm(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  if (a === 0 || b === 0) return 0;
  return (a * b) / gcd(a, b);
}

export function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Math ERROR: Factorial requires non-negative integer');
  }
  if (n > 69) {
    throw new Error('Math ERROR: Overflow (n! > 69!)');
  }
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

export function permutation(n: number, r: number): number {
  if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r) || r > n) {
    throw new Error('Math ERROR: Invalid nPr arguments');
  }
  return factorial(n) / factorial(n - r);
}

export function combination(n: number, r: number): number {
  if (n < 0 || r < 0 || !Number.isInteger(n) || !Number.isInteger(r) || r > n) {
    throw new Error('Math ERROR: Invalid nCr arguments');
  }
  return factorial(n) / (factorial(r) * factorial(n - r));
}

export function primeFactors(n: number): number[] {
  let val = Math.abs(Math.round(n));
  if (val <= 1) return [val];
  const factors: number[] = [];
  while (val % 2 === 0) {
    factors.push(2);
    val /= 2;
  }
  for (let d = 3; d * d <= val; d += 2) {
    while (val % d === 0) {
      factors.push(d);
      val /= d;
    }
  }
  if (val > 2) factors.push(val);
  return factors;
}

/**
 * Converts decimal to fraction string "p/q" if clean representation exists,
 * otherwise returns null.
 */
export function decimalToFraction(val: number, maxDenominator = 100000): { num: number; den: number } | null {
  if (!Number.isFinite(val) || Math.abs(val) > 1e12) return null;
  if (Number.isInteger(val)) return { num: val, den: 1 };

  const sign = val < 0 ? -1 : 1;
  val = Math.abs(val);

  let bestNum = Math.round(val);
  let bestDen = 1;
  let minError = Math.abs(val - bestNum);

  // Continued fraction expansion
  let h1 = 1, h2 = 0;
  let k1 = 0, k2 = 1;
  let b = val;

  do {
    const a = Math.floor(b);
    let h = a * h1 + h2;
    let k = a * k1 + k2;

    if (k > maxDenominator) break;

    const error = Math.abs(val - h / k);
    if (error < minError) {
      minError = error;
      bestNum = h;
      bestDen = k;
    }

    if (error < 1e-10) break;

    h2 = h1;
    h1 = h;
    k2 = k1;
    k1 = k;
    b = 1 / (b - a);
  } while (Math.abs(b) < 1e12);

  if (minError < 1e-8 && bestDen <= maxDenominator) {
    return { num: sign * bestNum, den: bestDen };
  }
  return null;
}

export function toDMS(decimalDeg: number): { deg: number; min: number; sec: number } {
  const sign = decimalDeg < 0 ? -1 : 1;
  const abs = Math.abs(decimalDeg);
  const deg = Math.floor(abs);
  const remMinutes = (abs - deg) * 60;
  const min = Math.floor(remMinutes);
  const sec = Math.round((remMinutes - min) * 60 * 100) / 100;
  return { deg: sign * deg, min, sec };
}

export function fromDMS(deg: number, min: number, sec: number): number {
  const sign = deg < 0 ? -1 : 1;
  return sign * (Math.abs(deg) + min / 60 + sec / 3600);
}

// ==========================================
// 2. EXPRESSION TOKENIZER & EVALUATOR
// ==========================================

export interface EvalContext {
  angleMode: AngleMode;
  variables: Record<string, number>;
  ans: number;
}

const CONSTANTS: Record<string, number> = {
  'π': Math.PI,
  'pi': Math.PI,
  'PI': Math.PI,
  'e': Math.E,
  'E': Math.E,
};

function angleToRad(val: number, mode: AngleMode): number {
  if (mode === 'DEG') return (val * Math.PI) / 180;
  if (mode === 'GRA') return (val * Math.PI) / 200;
  return val; // RAD
}

function radToAngle(val: number, mode: AngleMode): number {
  if (mode === 'DEG') return (val * 180) / Math.PI;
  if (mode === 'GRA') return (val * 200) / Math.PI;
  return val; // RAD
}

// Token types
type TokenType =
  | 'NUMBER'
  | 'IDENT'
  | 'OP'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA';

interface Token {
  type: TokenType;
  val: string;
}

export function tokenize(expr: string): Token[] {
  const clean = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/⌟/g, '/')
    .replace(/\s+/g, '');

  const tokens: Token[] = [];
  let i = 0;

  while (i < clean.length) {
    const ch = clean[i];

    // Numbers (integer, decimal, scientific like 1.5e3 or 1.5×10^3)
    if (/[0-9.]/.test(ch)) {
      let numStr = '';
      let hasDot = false;
      while (i < clean.length && (/[0-9]/.test(clean[i]) || (clean[i] === '.' && !hasDot))) {
        if (clean[i] === '.') hasDot = true;
        numStr += clean[i];
        i++;
      }
      tokens.push({ type: 'NUMBER', val: numStr });
      continue;
    }

    // Identifiers (functions, constants, variable memories)
    if (/[a-zA-Zπ_]/.test(ch)) {
      let ident = '';
      while (i < clean.length && /[a-zA-Z0-9π_]/.test(clean[i])) {
        ident += clean[i];
        i++;
      }
      tokens.push({ type: 'IDENT', val: ident });
      continue;
    }

    if (ch === '(') {
      tokens.push({ type: 'LPAREN', val: '(' });
      i++;
      continue;
    }

    if (ch === ')') {
      tokens.push({ type: 'RPAREN', val: ')' });
      i++;
      continue;
    }

    if (ch === ',') {
      tokens.push({ type: 'COMMA', val: ',' });
      i++;
      continue;
    }

    // Operators: +, -, *, /, ^, %, !
    if (['+', '-', '*', '/', '^', '%', '!'].includes(ch)) {
      tokens.push({ type: 'OP', val: ch });
      i++;
      continue;
    }

    i++; // Skip unrecognized
  }

  // Insert implicit multiplication: e.g. 2(3) -> 2*(3), (2)(3) -> (2)*(3), 2pi -> 2*pi
  const expanded: Token[] = [];
  for (let j = 0; j < tokens.length; j++) {
    const curr = tokens[j];
    expanded.push(curr);

    if (j < tokens.length - 1) {
      const next = tokens[j + 1];
      const isCurrTerm =
        curr.type === 'NUMBER' ||
        curr.type === 'RPAREN' ||
        curr.val === '!' ||
        (curr.type === 'IDENT' && ['π', 'e', 'Ans', 'A', 'B', 'C', 'D', 'E', 'F', 'X', 'Y', 'M'].includes(curr.val));
      const isNextTerm =
        next.type === 'NUMBER' ||
        next.type === 'LPAREN' ||
        next.type === 'IDENT';

      if (isCurrTerm && isNextTerm) {
        expanded.push({ type: 'OP', val: '*' });
      }
    }
  }

  return expanded;
}

// Shunting Yard Algorithm to parse RPN (Reverse Polish Notation)
interface OpDef {
  prec: number;
  assoc: 'L' | 'R';
  unary?: boolean;
}

const OP_TABLE: Record<string, OpDef> = {
  'u-': { prec: 5, assoc: 'R', unary: true },
  'u+': { prec: 5, assoc: 'R', unary: true },
  '!':  { prec: 6, assoc: 'L' }, // Postfix factorial
  '^':  { prec: 4, assoc: 'R' },
  '*':  { prec: 3, assoc: 'L' },
  '/':  { prec: 3, assoc: 'L' },
  '%':  { prec: 3, assoc: 'L' },
  '+':  { prec: 2, assoc: 'L' },
  '-':  { prec: 2, assoc: 'L' },
};

export function evaluateExpression(exprStr: string, context: EvalContext): number {
  if (!exprStr.trim()) return 0;
  const tokens = tokenize(exprStr);
  if (tokens.length === 0) return 0;

  const outputQueue: Token[] = [];
  const opStack: Token[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'NUMBER') {
      outputQueue.push(token);
    } else if (token.type === 'IDENT') {
      // If it's followed by a left paren, it's a function
      if (i + 1 < tokens.length && tokens[i + 1].type === 'LPAREN') {
        opStack.push(token);
      } else {
        // It's a variable or constant
        outputQueue.push(token);
      }
    } else if (token.type === 'COMMA') {
      while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'LPAREN') {
        outputQueue.push(opStack.pop()!);
      }
      if (opStack.length === 0) {
        throw new Error('Syntax ERROR: misplaced comma');
      }
    } else if (token.type === 'OP') {
      // Check for unary plus/minus
      let opKey = token.val;
      const prev = i > 0 ? tokens[i - 1] : null;
      const isUnary = !prev || prev.type === 'LPAREN' || prev.type === 'OP' || prev.type === 'COMMA';
      if (isUnary && (opKey === '-' || opKey === '+')) {
        opKey = `u${opKey}`;
      }

      const o1Def = OP_TABLE[opKey];
      if (!o1Def) throw new Error(`Syntax ERROR: unknown operator ${token.val}`);

      if (opKey === '!') {
        // Postfix operator immediately pushes
        outputQueue.push({ type: 'OP', val: '!' });
        continue;
      }

      while (opStack.length > 0) {
        const top = opStack[opStack.length - 1];
        if (top.type === 'OP') {
          const o2Def = OP_TABLE[top.val];
          if (
            o2Def &&
            ((o1Def.assoc === 'L' && o1Def.prec <= o2Def.prec) ||
              (o1Def.assoc === 'R' && o1Def.prec < o2Def.prec))
          ) {
            outputQueue.push(opStack.pop()!);
            continue;
          }
        }
        break;
      }
      opStack.push({ type: 'OP', val: opKey });
    } else if (token.type === 'LPAREN') {
      opStack.push(token);
    } else if (token.type === 'RPAREN') {
      while (opStack.length > 0 && opStack[opStack.length - 1].type !== 'LPAREN') {
        outputQueue.push(opStack.pop()!);
      }
      if (opStack.length === 0) {
        throw new Error('Syntax ERROR: mismatched parentheses');
      }
      opStack.pop(); // discard LPAREN

      // If top of stack is a function, pop it to output
      if (opStack.length > 0 && opStack[opStack.length - 1].type === 'IDENT') {
        outputQueue.push(opStack.pop()!);
      }
    }
  }

  while (opStack.length > 0) {
    const top = opStack.pop()!;
    if (top.type === 'LPAREN' || top.type === 'RPAREN') {
      throw new Error('Syntax ERROR: mismatched parentheses');
    }
    outputQueue.push(top);
  }

  // RPN Evaluation Stack
  const evalStack: number[] = [];

  for (const token of outputQueue) {
    if (token.type === 'NUMBER') {
      evalStack.push(parseFloat(token.val));
    } else if (token.type === 'IDENT') {
      const id = token.val.toLowerCase();
      // Handle variable or constant
      if (CONSTANTS[token.val] !== undefined) {
        evalStack.push(CONSTANTS[token.val]);
      } else if (token.val === 'Ans') {
        evalStack.push(context.ans || 0);
      } else if (context.variables[token.val.toUpperCase()] !== undefined) {
        evalStack.push(context.variables[token.val.toUpperCase()]);
      }
      // Functions
      else if (id === 'sin') {
        const a = evalStack.pop()!;
        evalStack.push(Math.sin(angleToRad(a, context.angleMode)));
      } else if (id === 'cos') {
        const a = evalStack.pop()!;
        evalStack.push(Math.cos(angleToRad(a, context.angleMode)));
      } else if (id === 'tan') {
        const a = evalStack.pop()!;
        const rad = angleToRad(a, context.angleMode);
        // Check for undefined tan at pi/2 + k*pi
        if (Math.abs(Math.cos(rad)) < 1e-14) {
          throw new Error('Math ERROR: tan is undefined');
        }
        evalStack.push(Math.tan(rad));
      } else if (id === 'asin' || id === 'sin_inv') {
        const a = evalStack.pop()!;
        if (a < -1 || a > 1) throw new Error('Math ERROR: asin domain is [-1, 1]');
        evalStack.push(radToAngle(Math.asin(a), context.angleMode));
      } else if (id === 'acos' || id === 'cos_inv') {
        const a = evalStack.pop()!;
        if (a < -1 || a > 1) throw new Error('Math ERROR: acos domain is [-1, 1]');
        evalStack.push(radToAngle(Math.acos(a), context.angleMode));
      } else if (id === 'atan' || id === 'tan_inv') {
        const a = evalStack.pop()!;
        evalStack.push(radToAngle(Math.atan(a), context.angleMode));
      } else if (id === 'sinh') {
        evalStack.push(Math.sinh(evalStack.pop()!));
      } else if (id === 'cosh') {
        evalStack.push(Math.cosh(evalStack.pop()!));
      } else if (id === 'tanh') {
        evalStack.push(Math.tanh(evalStack.pop()!));
      } else if (id === 'asinh') {
        evalStack.push(Math.asinh(evalStack.pop()!));
      } else if (id === 'acosh') {
        const a = evalStack.pop()!;
        if (a < 1) throw new Error('Math ERROR: acosh domain is [1, ∞)');
        evalStack.push(Math.acosh(a));
      } else if (id === 'atanh') {
        const a = evalStack.pop()!;
        if (a <= -1 || a >= 1) throw new Error('Math ERROR: atanh domain is (-1, 1)');
        evalStack.push(Math.atanh(a));
      } else if (id === 'sqrt' || id === '√') {
        const a = evalStack.pop()!;
        if (a < 0) throw new Error('Math ERROR: sqrt of negative number');
        evalStack.push(Math.sqrt(a));
      } else if (id === 'cbrt' || id === '³√') {
        evalStack.push(Math.cbrt(evalStack.pop()!));
      } else if (id === 'log') {
        const a = evalStack.pop()!;
        if (a <= 0) throw new Error('Math ERROR: log domain is (0, ∞)');
        evalStack.push(Math.log10(a));
      } else if (id === 'ln') {
        const a = evalStack.pop()!;
        if (a <= 0) throw new Error('Math ERROR: ln domain is (0, ∞)');
        evalStack.push(Math.log(a));
      } else if (id === 'abs') {
        evalStack.push(Math.abs(evalStack.pop()!));
      } else if (id === 'npr') {
        const r = evalStack.pop()!;
        const n = evalStack.pop()!;
        evalStack.push(permutation(n, r));
      } else if (id === 'ncr') {
        const r = evalStack.pop()!;
        const n = evalStack.pop()!;
        evalStack.push(combination(n, r));
      } else if (id === 'gcd') {
        const b = evalStack.pop()!;
        const a = evalStack.pop()!;
        evalStack.push(gcd(a, b));
      } else if (id === 'lcm') {
        const b = evalStack.pop()!;
        const a = evalStack.pop()!;
        evalStack.push(lcm(a, b));
      } else if (id === 'ran#' || id === 'rand') {
        evalStack.push(Math.round(Math.random() * 1000) / 1000);
      } else {
        throw new Error(`Syntax ERROR: unknown identifier '${token.val}'`);
      }
    } else if (token.type === 'OP') {
      if (token.val === 'u-') {
        evalStack.push(-evalStack.pop()!);
      } else if (token.val === 'u+') {
        // unary plus, no-op
      } else if (token.val === '!') {
        evalStack.push(factorial(evalStack.pop()!));
      } else {
        const b = evalStack.pop()!;
        const a = evalStack.pop()!;
        if (token.val === '+') evalStack.push(a + b);
        else if (token.val === '-') evalStack.push(a - b);
        else if (token.val === '*') evalStack.push(a * b);
        else if (token.val === '/') {
          if (b === 0) throw new Error('Math ERROR: Division by zero');
          evalStack.push(a / b);
        } else if (token.val === '^') {
          if (a === 0 && b < 0) throw new Error('Math ERROR: Division by zero (0^negative)');
          evalStack.push(Math.pow(a, b));
        } else if (token.val === '%') {
          evalStack.push(a * (b / 100));
        }
      }
    }
  }

  if (evalStack.length !== 1) {
    throw new Error('Syntax ERROR');
  }

  const result = evalStack[0];
  // Clean small floating point precision artefacts
  if (Math.abs(result) < 1e-14) return 0;
  return Math.round(result * 1e12) / 1e12;
}

// ==========================================
// 3. COMPLEX NUMBER ENGINE
// ==========================================

export function formatComplex(c: ComplexNumber): string {
  const re = Math.abs(c.re) < 1e-12 ? 0 : Math.round(c.re * 1e8) / 1e8;
  const im = Math.abs(c.im) < 1e-12 ? 0 : Math.round(c.im * 1e8) / 1e8;

  if (im === 0) return `${re}`;
  if (re === 0) {
    if (im === 1) return 'i';
    if (im === -1) return '-i';
    return `${im}i`;
  }
  const sign = im > 0 ? '+' : '-';
  const absIm = Math.abs(im) === 1 ? '' : Math.abs(im);
  return `${re} ${sign} ${absIm}i`;
}

export function complexAdd(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function complexSub(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function complexMul(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function complexDiv(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  const denom = b.re * b.re + b.im * b.im;
  if (denom === 0) throw new Error('Math ERROR: Division by zero');
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function complexAbs(c: ComplexNumber): number {
  return Math.sqrt(c.re * c.re + c.im * c.im);
}

export function complexArg(c: ComplexNumber, mode: AngleMode): number {
  const rad = Math.atan2(c.im, c.re);
  return radToAngle(rad, mode);
}

/**
 * Evaluates a complex number expression with 'i' (e.g., "3 + 4i", "(2+3i)*(1-2i)")
 */
export function evaluateComplexExpression(exprStr: string, context: EvalContext): ComplexNumber {
  if (!exprStr.trim()) return { re: 0, im: 0 };

  // First check if there's no 'i', then evaluate purely real
  if (!exprStr.includes('i')) {
    const real = evaluateExpression(exprStr, context);
    return { re: real, im: 0 };
  }

  // Handle standard addition/subtraction like a + bi or a - bi
  // or substitute i with 0 to get real part, and evaluate derivative or separation
  const clean = exprStr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\s+/g, '');

  // Handle simple formats like "a + bi", "bi", "a"
  const biMatch = clean.match(/^([+-]?\d*\.?\d*)\s*([+-])\s*(\d*\.?\d*)i$/);
  if (biMatch) {
    const re = parseFloat(biMatch[1]) || 0;
    const sign = biMatch[2] === '-' ? -1 : 1;
    const imStr = biMatch[3];
    const im = imStr === '' ? 1 : parseFloat(imStr);
    return { re, im: sign * im };
  }

  const pureIMatch = clean.match(/^([+-]?\d*\.?\d*)i$/);
  if (pureIMatch) {
    const imStr = pureIMatch[1];
    const im = imStr === '' || imStr === '+' ? 1 : imStr === '-' ? -1 : parseFloat(imStr);
    return { re: 0, im };
  }

  // General expression with i: evaluate real part with i=0, and with i=1
  // For linear combination of i: f(i) = Re + Im * i
  try {
    const exprAt0 = clean.replace(/i/g, '(0)');
    const exprAt1 = clean.replace(/i/g, '(1)');
    const val0 = evaluateExpression(exprAt0, context);
    const val1 = evaluateExpression(exprAt1, context);
    return { re: val0, im: val1 - val0 };
  } catch {
    const fallback = evaluateExpression(clean.replace(/i/g, ''), context);
    return { re: fallback, im: 0 };
  }
}

// ==========================================
// 4. BASE-N CONVERSIONS & BITWISE LOGIC
// ==========================================

export function convertBase(valueStr: string, fromRadix: number, toRadix: number): string {
  const clean = valueStr.trim().replace(/\s+/g, '');
  if (!clean) return '0';
  const parsed = parseInt(clean, fromRadix);
  if (isNaN(parsed)) throw new Error('Syntax ERROR: Invalid Base-N digit');
  // 32-bit signed wrap
  const int32 = parsed | 0;
  if (toRadix === 10) return int32.toString(10);
  // Unsigned presentation for hex, bin, oct
  const uint32 = int32 >>> 0;
  return uint32.toString(toRadix).toUpperCase();
}

export function baseNBitwiseOp(a: number, b: number, op: 'AND' | 'OR' | 'XOR' | 'XNOR'): number {
  const a32 = a | 0;
  const b32 = b | 0;
  if (op === 'AND') return (a32 & b32) | 0;
  if (op === 'OR') return (a32 | b32) | 0;
  if (op === 'XOR') return (a32 ^ b32) | 0;
  if (op === 'XNOR') return (~(a32 ^ b32)) | 0;
  return 0;
}

export function baseNNot(a: number): number {
  return (~(a | 0)) | 0;
}

export function evaluateBaseNExpression(exprStr: string, radix: 'DEC' | 'HEX' | 'BIN' | 'OCT'): string {
  const radixMap: Record<string, number> = { DEC: 10, HEX: 16, BIN: 2, OCT: 8 };
  const r = radixMap[radix] || 10;
  const clean = exprStr.trim().replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

  // Simple operation parsing: A OP B
  const parts = clean.split(/([+\-*/])/);
  if (parts.length === 1) {
    const val = parseInt(parts[0], r);
    if (isNaN(val)) throw new Error('Syntax ERROR');
    return convertBase(parts[0], r, r);
  }

  let accum = parseInt(parts[0].trim(), r);
  if (isNaN(accum)) throw new Error('Syntax ERROR');

  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i].trim();
    const nextVal = parseInt(parts[i + 1]?.trim() || '0', r);
    if (isNaN(nextVal)) throw new Error('Syntax ERROR');

    if (op === '+') accum = (accum + nextVal) | 0;
    else if (op === '-') accum = (accum - nextVal) | 0;
    else if (op === '*') accum = (accum * nextVal) | 0;
    else if (op === '/') {
      if (nextVal === 0) throw new Error('Math ERROR: Division by zero');
      accum = Math.trunc(accum / nextVal) | 0;
    }
  }

  if (r === 10) return accum.toString(10);
  return (accum >>> 0).toString(r).toUpperCase();
}

// ==========================================
// 5. EQUATION SOLVERS (EQN MODE)
// ==========================================

export interface EqnSolution {
  type: EqnType;
  results: { label: string; value: string; isComplex?: boolean }[];
  extrema?: { label: string; value: string };
}

/**
 * 2-variable linear system:
 * a1*x + b1*y = c1
 * a2*x + b2*y = c2
 */
export function solveSimultaneous2(
  a1: number, b1: number, c1: number,
  a2: number, b2: number, c2: number
): EqnSolution {
  const D = a1 * b2 - a2 * b1;
  const Dx = c1 * b2 - c2 * b1;
  const Dy = a1 * c2 - a2 * c1;

  if (Math.abs(D) < 1e-12) {
    if (Math.abs(Dx) < 1e-12 && Math.abs(Dy) < 1e-12) {
      return {
        type: 'SIMUL_2',
        results: [{ label: 'Result', value: 'Infinite Solutions' }],
      };
    }
    return {
      type: 'SIMUL_2',
      results: [{ label: 'Result', value: 'No Solution' }],
    };
  }

  const x = Dx / D;
  const y = Dy / D;

  return {
    type: 'SIMUL_2',
    results: [
      { label: 'X', value: formatResultNicely(x) },
      { label: 'Y', value: formatResultNicely(y) },
    ],
  };
}

/**
 * 3-variable linear system:
 * a1*x + b1*y + c1*z = d1
 * a2*x + b2*y + c2*z = d2
 * a3*x + b3*y + c3*z = d3
 */
export function solveSimultaneous3(matrix: number[][]): EqnSolution {
  // Gaussian elimination with partial pivoting (3x4 augmented matrix)
  const A = matrix.map((r) => [...r]);
  const n = 3;

  for (let i = 0; i < n; i++) {
    // Find pivot
    let maxEl = Math.abs(A[i][i]);
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxEl) {
        maxEl = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    if (maxEl < 1e-12) {
      return { type: 'SIMUL_3', results: [{ label: 'Result', value: 'No Unique Solution' }] };
    }

    // Swap max row with current row
    for (let k = i; k <= n; k++) {
      const tmp = A[maxRow][k];
      A[maxRow][k] = A[i][k];
      A[i][k] = tmp;
    }

    // Row elimination
    for (let k = i + 1; k < n; k++) {
      const c = -A[k][i] / A[i][i];
      for (let j = i; j <= n; j++) {
        if (i === j) A[k][j] = 0;
        else A[k][j] += c * A[i][j];
      }
    }
  }

  // Back substitution
  const x = [0, 0, 0];
  for (let i = n - 1; i >= 0; i--) {
    x[i] = A[i][n] / A[i][i];
    for (let k = i - 1; k >= 0; k--) {
      A[k][n] -= A[k][i] * x[i];
    }
  }

  return {
    type: 'SIMUL_3',
    results: [
      { label: 'X', value: formatResultNicely(x[0]) },
      { label: 'Y', value: formatResultNicely(x[1]) },
      { label: 'Z', value: formatResultNicely(x[2]) },
    ],
  };
}

/**
 * Quadratic Equation: a*X² + b*X + c = 0
 */
export function solveQuadratic(a: number, b: number, c: number): EqnSolution {
  if (a === 0) {
    if (b === 0) {
      return { type: 'POLY_2', results: [{ label: 'Result', value: c === 0 ? 'All real numbers' : 'No Solution' }] };
    }
    return { type: 'POLY_2', results: [{ label: 'X', value: formatResultNicely(-c / b) }] };
  }

  const disc = b * b - 4 * a * c;
  const vertexX = -b / (2 * a);
  const vertexY = c - (b * b) / (4 * a);
  const extremaLabel = a > 0 ? 'X-Value Minimum' : 'X-Value Maximum';

  if (Math.abs(disc) < 1e-12) {
    const x = -b / (2 * a);
    return {
      type: 'POLY_2',
      results: [
        { label: 'X1 = X2', value: formatResultNicely(x) },
      ],
      extrema: { label: `${extremaLabel}: X=${formatResultNicely(vertexX)}, Y=${formatResultNicely(vertexY)}`, value: '' },
    };
  }

  if (disc > 0) {
    const sqrtDisc = Math.sqrt(disc);
    const x1 = (-b + sqrtDisc) / (2 * a);
    const x2 = (-b - sqrtDisc) / (2 * a);
    return {
      type: 'POLY_2',
      results: [
        { label: 'X1', value: formatResultNicely(x1) },
        { label: 'X2', value: formatResultNicely(x2) },
      ],
      extrema: { label: `${extremaLabel}`, value: `X=${formatResultNicely(vertexX)}, Y=${formatResultNicely(vertexY)}` },
    };
  }

  // Complex roots
  const realPart = -b / (2 * a);
  const imagPart = Math.sqrt(-disc) / (2 * Math.abs(a));
  return {
    type: 'POLY_2',
    results: [
      { label: 'X1', value: `${formatResultNicely(realPart)} + ${formatResultNicely(imagPart)}i`, isComplex: true },
      { label: 'X2', value: `${formatResultNicely(realPart)} - ${formatResultNicely(imagPart)}i`, isComplex: true },
    ],
    extrema: { label: `${extremaLabel}`, value: `X=${formatResultNicely(vertexX)}, Y=${formatResultNicely(vertexY)}` },
  };
}

/**
 * Cubic Equation: a*X³ + b*X² + c*X + d = 0
 */
export function solveCubic(a: number, b: number, c: number, d: number): EqnSolution {
  if (a === 0) return solveQuadratic(b, c, d);

  // Normalize to x³ + A*x² + B*x + C = 0
  const A = b / a;
  const B = c / a;
  const C = d / a;

  // Depressed cubic t³ + p*t + q = 0 via x = t - A/3
  const p = B - (A * A) / 3;
  const q = (2 * A * A * A) / 27 - (A * B) / 3 + C;
  const delta = (q * q) / 4 + (p * p * p) / 27;

  const shift = -A / 3;

  if (Math.abs(delta) < 1e-12) {
    // Multiple roots
    if (Math.abs(p) < 1e-12) {
      return {
        type: 'POLY_3',
        results: [{ label: 'X1 = X2 = X3', value: formatResultNicely(shift) }],
      };
    }
    const u = Math.cbrt(-q / 2);
    const x1 = 2 * u + shift;
    const x2 = -u + shift;
    return {
      type: 'POLY_3',
      results: [
        { label: 'X1', value: formatResultNicely(x1) },
        { label: 'X2 = X3', value: formatResultNicely(x2) },
      ],
    };
  }

  if (delta < 0) {
    // 3 distinct real roots via Viète's trigonometric formula
    const r = Math.sqrt(-(p * p * p) / 27);
    const phi = Math.acos(Math.max(-1, Math.min(1, -q / (2 * r))));
    const factor = 2 * Math.cbrt(r);

    const x1 = factor * Math.cos(phi / 3) + shift;
    const x2 = factor * Math.cos((phi + 2 * Math.PI) / 3) + shift;
    const x3 = factor * Math.cos((phi + 4 * Math.PI) / 3) + shift;

    const sorted = [x1, x2, x3].sort((m, n) => n - m);
    return {
      type: 'POLY_3',
      results: [
        { label: 'X1', value: formatResultNicely(sorted[0]) },
        { label: 'X2', value: formatResultNicely(sorted[1]) },
        { label: 'X3', value: formatResultNicely(sorted[2]) },
      ],
    };
  }

  // 1 real root and 2 complex conjugate roots (Cardano's method)
  const sqrtDelta = Math.sqrt(delta);
  const u = Math.cbrt(-q / 2 + sqrtDelta);
  const v = Math.cbrt(-q / 2 - sqrtDelta);

  const realRoot = u + v + shift;
  const compReal = -(u + v) / 2 + shift;
  const compImag = ((u - v) * Math.sqrt(3)) / 2;

  return {
    type: 'POLY_3',
    results: [
      { label: 'X1', value: formatResultNicely(realRoot) },
      { label: 'X2', value: `${formatResultNicely(compReal)} + ${formatResultNicely(Math.abs(compImag))}i`, isComplex: true },
      { label: 'X3', value: `${formatResultNicely(compReal)} - ${formatResultNicely(Math.abs(compImag))}i`, isComplex: true },
    ],
  };
}

// ==========================================
// 6. MATRIX OPERATIONS (MATRIX MODE)
// ==========================================

export function matrixAdd(A: MatrixData, B: MatrixData): MatrixData {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    throw new Error('Dim ERROR: Matrices must have identical dimensions');
  }
  return A.map((row, r) => row.map((val, c) => val + B[r][c]));
}

export function matrixSub(A: MatrixData, B: MatrixData): MatrixData {
  if (A.length !== B.length || A[0].length !== B[0].length) {
    throw new Error('Dim ERROR: Matrices must have identical dimensions');
  }
  return A.map((row, r) => row.map((val, c) => val - B[r][c]));
}

export function matrixMul(A: MatrixData, B: MatrixData): MatrixData {
  const rowsA = A.length;
  const colsA = A[0].length;
  const rowsB = B.length;
  const colsB = B[0].length;

  if (colsA !== rowsB) {
    throw new Error('Dim ERROR: Columns of A must equal rows of B');
  }

  const result: number[][] = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
  for (let r = 0; r < rowsA; r++) {
    for (let c = 0; c < colsB; c++) {
      let sum = 0;
      for (let k = 0; k < colsA; k++) {
        sum += A[r][k] * B[k][c];
      }
      result[r][c] = Math.round(sum * 1e10) / 1e10;
    }
  }
  return result;
}

export function matrixScalarMul(A: MatrixData, k: number): MatrixData {
  return A.map((row) => row.map((val) => val * k));
}

export function matrixTranspose(A: MatrixData): MatrixData {
  const rows = A.length;
  const cols = A[0].length;
  const res: number[][] = Array.from({ length: cols }, () => Array(rows).fill(0));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      res[c][r] = A[r][c];
    }
  }
  return res;
}

export function matrixDet(A: MatrixData): number {
  const n = A.length;
  if (n !== A[0].length) {
    throw new Error('Dim ERROR: Determinant requires square matrix');
  }

  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];

  if (n === 3) {
    return (
      A[0][0] * (A[1][1] * A[2][2] - A[1][2] * A[2][1]) -
      A[0][1] * (A[1][0] * A[2][2] - A[1][2] * A[2][0]) +
      A[0][2] * (A[1][0] * A[2][1] - A[1][1] * A[2][0])
    );
  }

  throw new Error('Math ERROR: Max 3x3 supported for determinant');
}

export function matrixInverse(A: MatrixData): MatrixData {
  const n = A.length;
  if (n !== A[0].length) throw new Error('Dim ERROR: Square matrix required for inverse');
  const d = matrixDet(A);
  if (Math.abs(d) < 1e-12) throw new Error('Math ERROR: Matrix is singular (det = 0)');

  if (n === 2) {
    return [
      [A[1][1] / d, -A[0][1] / d],
      [-A[1][0] / d, A[0][0] / d],
    ];
  }

  if (n === 3) {
    const adj: number[][] = [
      [
        (A[1][1] * A[2][2] - A[1][2] * A[2][1]) / d,
        -(A[0][1] * A[2][2] - A[0][2] * A[2][1]) / d,
        (A[0][1] * A[1][2] - A[0][2] * A[1][1]) / d,
      ],
      [
        -(A[1][0] * A[2][2] - A[1][2] * A[2][0]) / d,
        (A[0][0] * A[2][2] - A[0][2] * A[2][0]) / d,
        -(A[0][0] * A[1][2] - A[0][2] * A[1][0]) / d,
      ],
      [
        (A[1][0] * A[2][1] - A[1][1] * A[2][0]) / d,
        -(A[0][0] * A[2][1] - A[0][1] * A[2][0]) / d,
        (A[0][0] * A[1][1] - A[0][1] * A[1][0]) / d,
      ],
    ];
    return adj;
  }

  throw new Error('Math ERROR: Max 3x3 supported');
}

// ==========================================
// 7. VECTOR OPERATIONS (VECTOR MODE)
// ==========================================

export function vectorAdd(u: VectorData, v: VectorData): VectorData {
  if (u.length !== v.length) throw new Error('Dim ERROR: Vectors must have same dimension');
  return u.map((val, idx) => val + v[idx]);
}

export function vectorSub(u: VectorData, v: VectorData): VectorData {
  if (u.length !== v.length) throw new Error('Dim ERROR: Vectors must have same dimension');
  return u.map((val, idx) => val - v[idx]);
}

export function vectorDot(u: VectorData, v: VectorData): number {
  if (u.length !== v.length) throw new Error('Dim ERROR: Vectors must have same dimension');
  return u.reduce((sum, val, idx) => sum + val * v[idx], 0);
}

export function vectorCross(u: VectorData, v: VectorData): VectorData {
  if (u.length !== 3 || v.length !== 3) {
    throw new Error('Dim ERROR: Cross product requires 3D vectors');
  }
  return [
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ];
}

export function vectorMagnitude(u: VectorData): number {
  const sumSq = u.reduce((sum, val) => sum + val * val, 0);
  return Math.sqrt(sumSq);
}

export function vectorAngle(u: VectorData, v: VectorData, mode: AngleMode): number {
  const dot = vectorDot(u, v);
  const magU = vectorMagnitude(u);
  const magV = vectorMagnitude(v);
  if (magU === 0 || magV === 0) throw new Error('Math ERROR: Zero vector has no defined angle');
  const cosTheta = Math.max(-1, Math.min(1, dot / (magU * magV)));
  const rad = Math.acos(cosTheta);
  return radToAngle(rad, mode);
}

// ==========================================
// 8. STATISTICAL ANALYSIS (STAT MODE)
// ==========================================

export function calculate1VarStats(rows: StatRow[]): StatSummary1Var {
  let n = 0;
  let sumX = 0;
  let sumX2 = 0;
  const values: number[] = [];

  for (const r of rows) {
    const f = r.freq > 0 ? r.freq : 1;
    n += f;
    sumX += r.x * f;
    sumX2 += r.x * r.x * f;
    for (let k = 0; k < f; k++) values.push(r.x);
  }

  if (n === 0) throw new Error('Stat ERROR: No data points');

  values.sort((a, b) => a - b);

  const mean = sumX / n;
  const variance = Math.max(0, sumX2 / n - mean * mean);
  const sigmaX = Math.sqrt(variance);
  const sX = n > 1 ? Math.sqrt((sumX2 - (sumX * sumX) / n) / (n - 1)) : 0;

  const minX = values[0];
  const maxX = values[values.length - 1];

  const getPercentile = (p: number) => {
    const idx = (values.length - 1) * p;
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    const weight = idx - lower;
    return values[lower] * (1 - weight) + values[upper] * weight;
  };

  return {
    n,
    sumX,
    sumX2,
    mean,
    sigmaX,
    sX,
    minX,
    maxX,
    q1: getPercentile(0.25),
    med: getPercentile(0.5),
    q3: getPercentile(0.75),
  };
}

export function calculateRegStats(rows: StatRow[]): StatSummaryReg {
  let n = 0;
  let sumX = 0;
  let sumY = 0;
  let sumX2 = 0;
  let sumY2 = 0;
  let sumXY = 0;

  for (const r of rows) {
    if (r.y === undefined) continue;
    const f = r.freq > 0 ? r.freq : 1;
    n += f;
    sumX += r.x * f;
    sumY += r.y * f;
    sumX2 += r.x * r.x * f;
    sumY2 += r.y * r.y * f;
    sumXY += r.x * r.y * f;
  }

  if (n < 2) throw new Error('Stat ERROR: Regression requires at least 2 points');

  const denomX = n * sumX2 - sumX * sumX;
  const denomY = n * sumY2 - sumY * sumY;

  if (Math.abs(denomX) < 1e-12) {
    throw new Error('Stat ERROR: All X values are identical');
  }

  const b = (n * sumXY - sumX * sumY) / denomX;
  const a = (sumY - b * sumX) / n;

  let r = 0;
  if (denomX > 0 && denomY > 0) {
    r = (n * sumXY - sumX * sumY) / Math.sqrt(denomX * denomY);
  }

  return {
    n,
    sumX,
    sumY,
    sumX2,
    sumY2,
    sumXY,
    meanX: sumX / n,
    meanY: sumY / n,
    a,
    b,
    r,
  };
}

// ==========================================
// 9. TABLE GENERATION (TABLE MODE)
// ==========================================

export function generateFunctionTable(
  funcExpr: string,
  start: number,
  end: number,
  step: number,
  context: EvalContext
): FunctionTableRow[] {
  if (step <= 0) throw new Error('Range ERROR: Step must be greater than 0');
  if (start > end) throw new Error('Range ERROR: Start cannot exceed End');

  const count = Math.floor((end - start) / step) + 1;
  if (count > 100) {
    throw new Error('Range ERROR: Maximum table rows is 100');
  }

  const rows: FunctionTableRow[] = [];
  for (let x = start; x <= end + step * 0.001; x += step) {
    const roundedX = Math.round(x * 1e8) / 1e8;
    try {
      const fx = evaluateExpression(funcExpr, {
        ...context,
        variables: { ...context.variables, X: roundedX, x: roundedX },
      });
      rows.push({ x: roundedX, fx });
    } catch {
      rows.push({ x: roundedX, fx: 'ERROR' });
    }
  }

  return rows;
}

// ==========================================
// 10. FORMATTING UTILITIES
// ==========================================

export function formatResultNicely(num: number): string {
  if (!Number.isFinite(num)) {
    if (Number.isNaN(num)) return 'Math ERROR';
    return num > 0 ? 'Infinity' : '-Infinity';
  }
  if (Math.abs(num) < 1e-13) return '0';

  // If very large or very small, use standard scientific notation
  if (Math.abs(num) >= 1e10 || Math.abs(num) < 1e-6) {
    return num.toExponential(6).replace('e+', '×10^').replace('e-', '×10^-');
  }

  // Check if near an integer
  const rounded = Math.round(num * 1e10) / 1e10;
  return rounded.toString();
}
