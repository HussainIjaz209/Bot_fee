import React from 'react';
import { Search, X, Layers, UserX, CheckCircle } from 'lucide-react';

export default function FilterTabs({
  activeView, // 'active' | 'deactivated'
  setActiveView,
  currentFilter,
  setFilter,
  searchQuery,
  setSearchQuery,
  counts,
  deactivatedCount = 0
}) {
  const tabs = [
    { id: 'all', label: 'All Clients', count: counts.all, color: 'stone' },
    { id: 'need_to_pay', label: 'Need to Pay ($50)', count: counts.need_to_pay, color: 'rose' },
    { id: 'paid', label: 'Paid ($50)', count: counts.paid, color: 'emerald' },
    { id: 'bonus_pending', label: 'Bonus Pending ($2.50)', count: counts.bonus_pending, color: 'amber' },
    { id: 'bonus_received', label: 'Bonus Received ($2.50)', count: counts.bonus_received, color: 'teal' },
    { id: 'unset', label: 'Unset', count: counts.unset, color: 'gray' },
  ];

  return (
    <div className="space-y-3">
      {/* Top Switcher: Active Accounts vs Deactivated Accounts + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* View Switcher Pills */}
        <div className="inline-flex p-1 bg-stone-200/60 rounded-2xl border border-stone-200/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveView('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'active'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Active Accounts</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 font-bold">
              {counts.all ?? 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('deactivated')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              activeView === 'deactivated'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Deactivated Accounts</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                deactivatedCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {deactivatedCount}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px] max-w-sm w-full sm:w-auto">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search email, name, MT5 note..."
            className="w-full pl-9 pr-8 py-1.5 rounded-xl border border-stone-200 bg-white text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-stone-400 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sub-Filters for Active View */}
      {activeView === 'active' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = currentFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80 hover:border-stone-300'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive
                      ? 'bg-stone-800 text-stone-200'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {tab.count ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
