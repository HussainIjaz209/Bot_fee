import React from 'react';
import { CheckCircle, Clock, X, Sparkles } from 'lucide-react';

export default function BatchBar({
  selectedCount,
  onClearSelection,
  onBulkPayFee,
  onBulkReleaseBonus,
  month,
  year
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700/60 flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-900 font-bold text-xs flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-xs font-medium text-stone-200">
          selected for {month} {year}
        </span>
      </div>

      <div className="h-4 w-px bg-stone-700" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBulkPayFee}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-medium transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>Mark Paid ($50)</span>
        </button>

        <button
          type="button"
          onClick={onBulkReleaseBonus}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Release Bonus ($2.50)</span>
        </button>
      </div>

      <button
        type="button"
        onClick={onClearSelection}
        className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ml-2 cursor-pointer"
        title="Deselect all"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
