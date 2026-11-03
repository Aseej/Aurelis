import React, { useState } from 'react';
import { ArrowRightLeft, Copy, Check, RotateCcw } from 'lucide-react';

type UnitCategory = 'length' | 'mass' | 'temperature' | 'pressure' | 'energy' | 'speed';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (baseVal: number) => number;
}

const UNIT_DATA: Record<UnitCategory, { name: string; units: UnitDef[] }> = {
  length: {
    name: 'Length',
    units: [
      { id: 'm', name: 'Meter', symbol: 'm', toBase: (v) => v, fromBase: (b) => b },
      { id: 'km', name: 'Kilometer', symbol: 'km', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'cm', name: 'Centimeter', symbol: 'cm', toBase: (v) => v * 0.01, fromBase: (b) => b * 100 },
      { id: 'mm', name: 'Millimeter', symbol: 'mm', toBase: (v) => v * 0.001, fromBase: (b) => b * 1000 },
      { id: 'in', name: 'Inch', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (b) => b / 0.0254 },
      { id: 'ft', name: 'Foot', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (b) => b / 0.3048 },
      { id: 'yd', name: 'Yard', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (b) => b / 0.9144 },
      { id: 'mi', name: 'Mile', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (b) => b / 1609.344 },
      { id: 'nm', name: 'Nanometer', symbol: 'nm', toBase: (v) => v * 1e-9, fromBase: (b) => b * 1e9 },
      { id: 'angstrom', name: 'Ångström', symbol: 'Å', toBase: (v) => v * 1e-10, fromBase: (b) => b * 1e10 },
    ],
  },
  mass: {
    name: 'Mass & Weight',
    units: [
      { id: 'kg', name: 'Kilogram', symbol: 'kg', toBase: (v) => v, fromBase: (b) => b },
      { id: 'g', name: 'Gram', symbol: 'g', toBase: (v) => v * 0.001, fromBase: (b) => b * 1000 },
      { id: 'mg', name: 'Milligram', symbol: 'mg', toBase: (v) => v * 1e-6, fromBase: (b) => b * 1e6 },
      { id: 'lb', name: 'Pound', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (b) => b / 0.45359237 },
      { id: 'oz', name: 'Ounce', symbol: 'oz', toBase: (v) => v * 0.028349523, fromBase: (b) => b / 0.028349523 },
      { id: 'ton', name: 'Metric Ton', symbol: 't', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'amu', name: 'Atomic Mass Unit', symbol: 'u', toBase: (v) => v * 1.6605390666e-27, fromBase: (b) => b / 1.6605390666e-27 },
    ],
  },
  temperature: {
    name: 'Temperature',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (b) => b },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (b) => (b * 9) / 5 + 32 },
      { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (b) => b + 273.15 },
    ],
  },
  pressure: {
    name: 'Pressure',
    units: [
      { id: 'pa', name: 'Pascal', symbol: 'Pa', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kpa', name: 'Kilopascal', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'bar', name: 'Bar', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (b) => b / 100000 },
      { id: 'atm', name: 'Atmosphere (std)', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (b) => b / 101325 },
      { id: 'torr', name: 'Torr / mmHg', symbol: 'Torr', toBase: (v) => v * 133.322368, fromBase: (b) => b / 133.322368 },
      { id: 'psi', name: 'Pound / sq inch', symbol: 'psi', toBase: (v) => v * 6894.757, fromBase: (b) => b / 6894.757 },
    ],
  },
  energy: {
    name: 'Energy & Work',
    units: [
      { id: 'j', name: 'Joule', symbol: 'J', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kj', name: 'Kilojoule', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (b) => b / 1000 },
      { id: 'cal', name: 'Calorie', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (b) => b / 4.184 },
      { id: 'kcal', name: 'Kilocalorie', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (b) => b / 4184 },
      { id: 'ev', name: 'Electronvolt', symbol: 'eV', toBase: (v) => v * 1.602176634e-19, fromBase: (b) => b / 1.602176634e-19 },
      { id: 'kwh', name: 'Kilowatt-hour', symbol: 'kWh', toBase: (v) => v * 3.6e6, fromBase: (b) => b / 3.6e6 },
    ],
  },
  speed: {
    name: 'Speed & Velocity',
    units: [
      { id: 'mps', name: 'Meter / second', symbol: 'm/s', toBase: (v) => v, fromBase: (b) => b },
      { id: 'kmh', name: 'Kilometer / hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (b) => b * 3.6 },
      { id: 'mph', name: 'Mile / hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (b) => b / 0.44704 },
      { id: 'knot', name: 'Knot', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (b) => b / 0.514444 },
      { id: 'c', name: 'Speed of Light', symbol: 'c', toBase: (v) => v * 299792458, fromBase: (b) => b / 299792458 },
    ],
  },
};

export const UnitConverter: React.FC = () => {
  const [category, setCategory] = useState<UnitCategory>('length');
  const [inputValue, setInputValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>(UNIT_DATA.length.units[0].id);
  const [toUnitId, setToUnitId] = useState<string>(UNIT_DATA.length.units[1].id);
  const [copied, setCopied] = useState<boolean>(false);

  // Switch category and update defaults
  const handleCategoryChange = (newCat: UnitCategory) => {
    setCategory(newCat);
    const units = UNIT_DATA[newCat].units;
    setFromUnitId(units[0].id);
    setToUnitId(units[1] ? units[1].id : units[0].id);
  };

  const currentUnits = UNIT_DATA[category].units;
  const fromUnit = currentUnits.find((u) => u.id === fromUnitId) || currentUnits[0];
  const toUnit = currentUnits.find((u) => u.id === toUnitId) || currentUnits[1] || currentUnits[0];

  // Calculate conversion
  const val = parseFloat(inputValue);
  let convertedValue = 0;
  if (!Number.isNaN(val)) {
    const base = fromUnit.toBase(val);
    convertedValue = toUnit.fromBase(base);
  }

  const formatNumber = (num: number): string => {
    if (!Number.isFinite(num)) return '0';
    if (Math.abs(num) < 1e-6 || Math.abs(num) >= 1e9) {
      return num.toExponential(6);
    }
    const rounded = Math.round(num * 1e8) / 1e8;
    return rounded.toString();
  };

  const swapUnits = () => {
    setFromUnitId(toUnitId);
    setToUnitId(fromUnitId);
  };

  const copyResult = () => {
    const text = `${inputValue} ${fromUnit.symbol} = ${formatNumber(convertedValue)} ${toUnit.symbol}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl glass-premium border border-black/[0.08] dark:border-white/[0.12] p-5 sm:p-6 shadow-xl space-y-5">
      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(Object.keys(UNIT_DATA) as UnitCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              category === cat
                ? 'bg-amber-500 text-black font-semibold shadow-xs'
                : 'bg-black/[0.04] dark:bg-white/[0.06] text-[#6E737D] dark:text-[#A0A5B0] hover:text-[#20232A] dark:hover:text-[#F6F3EC]'
            }`}
          >
            {UNIT_DATA[cat].name}
          </button>
        ))}
      </div>

      {/* Converter Grid */}
      <div className="space-y-4">
        {/* From Input */}
        <div className="bg-black/[0.03] dark:bg-white/[0.04] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#858A93] dark:text-[#A0A5B0]">
            <span>From</span>
            <span className="font-mono">{fromUnit.symbol}</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-transparent text-xl sm:text-2xl font-mono font-bold text-[#20232A] dark:text-[#F6F3EC] focus:outline-none"
              placeholder="0"
            />
            <select
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              className="bg-black/[0.06] dark:bg-white/[0.1] text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={swapUnits}
            className="p-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black shadow-md transition-transform active:scale-95"
            title="Swap Units"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* To Output */}
        <div className="bg-black/[0.03] dark:bg-white/[0.04] p-4 rounded-2xl border border-black/[0.06] dark:border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-[#858A93] dark:text-[#A0A5B0]">
            <span>To (Result)</span>
            <span className="font-mono">{toUnit.symbol}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-xl sm:text-2xl font-mono font-bold text-amber-500 dark:text-amber-400 truncate">
              {formatNumber(convertedValue)}
            </span>
            <select
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              className="bg-black/[0.06] dark:bg-white/[0.1] text-xs font-semibold text-[#20232A] dark:text-[#F6F3EC] px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
            >
              {currentUnits.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Copy / Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
        <span className="text-xs font-mono text-[#858A93] dark:text-[#777F8C]">
          1 {fromUnit.symbol} = {formatNumber(toUnit.fromBase(fromUnit.toBase(1)))} {toUnit.symbol}
        </span>
        <button
          onClick={copyResult}
          className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 font-semibold px-3 py-1.5 rounded-xl hover:bg-amber-500/10 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
