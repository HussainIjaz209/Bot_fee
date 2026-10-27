import React from 'react';
import {
  FileSpreadsheet,
  UserPlus,
  Bell,
  LogOut,
  Calendar,
  ChevronDown,
  Sparkles,
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
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo & Greeting */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5 text-amber-400 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-stone-900">
                  Bot Fee & Referral
                </h1>
                <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                  $50 Fee • $2.50 Referral
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {getGreeting()}, <span className="font-medium text-stone-800">{currentUser?.name || 'Administrator'}</span>
              </p>
            </div>
          </div>

          {/* Center: Year & Month Selectors */}
          <div className="hidden md:flex items-center gap-2 p-1 bg-stone-100/80 rounded-xl border border-stone-200/60">
            {/* Year Selector */}
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="appearance-none bg-white text-stone-800 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg border border-stone-200 shadow-2xs hover:border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    Year {y}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Month Selector */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-white text-stone-800 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg border border-stone-200 shadow-2xs hover:border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
              >
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Reminders Button */}
            <button
              type="button"
              onClick={onOpenRemindersModal}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 active:scale-[0.98] text-stone-700 text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="View unpaid clients and copy payment reminders"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Reminders</span>
            </button>

            {/* Excel Export */}
            <button
              type="button"
              onClick={onExportExcel}
              disabled={exportLoading}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 active:scale-[0.98] text-stone-700 text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Download Excel Spreadsheet of Bot Fee Records"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Export Excel</span>
            </button>

            {/* Add Client Button */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Add Client</span>
            </button>

            {/* User profile / Logout */}
            <div className="h-6 w-px bg-stone-200 mx-1 hidden sm:block" />

            <button
              type="button"
              onClick={onLogout}
              className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Year & Month Strip */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-stone-100 gap-2">
          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-stone-100 text-stone-800 text-xs font-semibold py-1 px-2 rounded-lg"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-stone-100 text-stone-800 text-xs font-semibold py-1 px-2 rounded-lg"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <span className="text-xs text-stone-500">
            Role: <span className="font-semibold text-stone-800">{currentUser?.role || 'Admin'}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
