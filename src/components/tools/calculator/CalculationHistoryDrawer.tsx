import React from 'react';
import { CalculationHistoryItem } from '../../../utils/calculator/types';
import { History, Trash2, ArrowUpLeft, X, Clock } from 'lucide-react';
import { useI18n } from '../../../i18n';

interface CalculationHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalculationHistoryItem[];
  onSelectExpression: (expr: string) => void;
  onSelectResult: (result: string) => void;
  onClearHistory: () => void;
}

export const CalculationHistoryDrawer: React.FC<CalculationHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectExpression,
  onSelectResult,
  onClearHistory,
}) => {
  const { t } = useI18n();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-slate-100 text-sm">{t('calc.historyTitle', 'Calculation History')}</h3>
            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 p-1 hover:bg-slate-800 rounded transition-colors"
                title={t('calc.clearHistory', 'Clear all history')}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
              <Clock className="w-10 h-10 stroke-[1.5] text-slate-600 mb-1" />
              <p className="text-sm font-medium text-slate-400">{t('calc.noHistory', 'No calculations yet')}</p>
              <p className="text-xs text-slate-500 max-w-[200px]">
                {t('calc.historyEmptyDesc', 'Your calculation expressions and results will be saved here for easy recall.')}
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-semibold">
                      {item.mode}
                    </span>
                    <span className="text-amber-500/80">{item.angleMode}</span>
                  </div>
                  <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>

                {/* Expression */}
                <div
                  onClick={() => {
                    onSelectExpression(item.expression);
                    onClose();
                  }}
                  className="font-mono text-xs text-slate-300 hover:text-amber-300 cursor-pointer break-all p-1 hover:bg-slate-900 rounded transition-colors"
                  title={t('calc.recallExpr', 'Click to recall expression')}
                >
                  {item.expression}
                </div>

                {/* Result */}
                <div className="flex items-baseline justify-between border-t border-slate-800/60 pt-1.5">
                  <span className="text-xs text-slate-500 font-mono">=</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-400 break-all">
                      {item.result}
                    </span>
                    <button
                      onClick={() => {
                        onSelectResult(item.result);
                        onClose();
                      }}
                      className="text-[10px] flex items-center gap-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono transition-colors"
                      title={t('calc.useResult', 'Use this result in calculator')}
                    >
                      <ArrowUpLeft className="w-3 h-3" />
                      <span>Ans</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 font-mono">
            {t('calc.historyDpadHint', 'Press ▲ / ▼ on D-pad to step through past expressions')}
          </p>
        </div>
      </div>
    </div>
  );
};
