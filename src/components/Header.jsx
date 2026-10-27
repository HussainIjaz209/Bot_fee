import React from 'react';
import {
  FileSpreadsheet,
  UserPlus,
  Bell,
  LogOut,
  ChevronDown,
  Bot
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['2025', '2026', '2027'];

export default function Header({
  currentUser,
  onLogout,
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  onOpenAddModal,
  onOpenRemindersModal,
  onExportExcel,
  exportLoading
}) {
  return (
    <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

        {/* ── Row 1: Logo + Actions ── */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

          {/* Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-stone-900 flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold tracking-tight text-stone-900 truncate">
                Bot Fee & Referral
              </h1>
              <p className="text-[11px] text-stone-500 truncate">
                {currentUser?.name || 'Administrator'}
                <span className="ml-1 text-stone-400">· {currentUser?.role || 'Admin'}</span>
              </p>
            </div>
          </div>

          {/* Desktop: Year & Month pickers */}
          <div className="hidden md:flex items-center gap-2 p-1 bg-stone-100/80 rounded-xl border border-stone-200/60">
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-white text-stone-800 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg border border-stone-200 shadow-2xs hover:border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white text-stone-800 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg border border-stone-200 shadow-2xs hover:border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Reminders — icon only on mobile */}
            <button
              type="button"
              onClick={onOpenRemindersModal}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 active:scale-[0.97] text-stone-700 text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Payment Reminders"
            >
              <Bell className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Reminders</span>
            </button>

            {/* Export — icon only on mobile */}
            <button
              type="button"
              onClick={onExportExcel}
              disabled={exportLoading}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 active:scale-[0.97] text-stone-700 text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Export Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            {/* Add Client */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-[0.97] text-white text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Add Client</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Row 2 (mobile only): Year & Month pickers ── */}
        <div className="flex md:hidden items-center gap-2 pb-2.5">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="flex-1 bg-stone-100 text-stone-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-[2] bg-stone-100 text-stone-800 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

      </div>
    </header>
  );
}
