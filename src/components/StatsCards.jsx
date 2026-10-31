import React from 'react';
import { Users, DollarSign, Award, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function StatsCards({ stats, selectedMonth, selectedYear }) {
  const currentMonthData = stats?.currentMonth || {
    paidCount: 0,
    dueCount: 0,
    unsetCount: 0,
    collectedAmount: 0,
    percentage: 0,
    bonusReceivedCount: 0,
    bonusReceivedAmount: 0,
    bonusPendingCount: 0,
    bonusPendingAmount: 0,
  };

  const monthlyPaidOut = stats?.monthlyPaidOut || {
    bonusReceivedCount: currentMonthData.bonusReceivedCount || 0,
    bonusReceivedAmount: currentMonthData.bonusReceivedAmount || 0,
    bonusPendingCount: currentMonthData.bonusPendingCount || 0,
    bonusPendingAmount: currentMonthData.bonusPendingAmount || 0,
  };

  const allTimeBonus = stats?.allTimeReferralBonus || {
    totalPaidClientsCount: 0,
    rate: 2.5,
    totalEarned: 0,
  };

  const allTimePayout = stats?.allTimeReferralPayout || {
    disbursed: 0,
    pending: 0,
  };

  const totalClients = stats?.totalClients || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Bot Clients */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs transition-all hover:border-stone-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            Total Bot Clients
          </span>
          <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Users className="w-4 h-4 stroke-[1.8]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-stone-900">
            {totalClients}
          </span>
          <span className="text-xs text-stone-500">active accounts</span>
        </div>
        <div className="mt-3 text-xs text-stone-500 flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>MongoDB Atlas</span>
          </span>
          {stats?.trialCount > 0 && (
            <span className="text-amber-800 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              {stats.trialCount} on 11d trial
            </span>
          )}
        </div>
      </div>

      {/* 2. Current Month Collection */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs transition-all hover:border-stone-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            {selectedMonth} Collection
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <DollarSign className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-stone-900">
            ${currentMonthData.collectedAmount.toLocaleString()}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            {currentMonthData.percentage}% paid
          </span>
        </div>
        <div className="mt-3 text-xs text-stone-500 flex items-center justify-between pt-3 border-t border-stone-100">
          <span>
            <strong className="text-stone-800">{currentMonthData.paidCount}</strong> paid ({currentMonthData.percentage}%)
          </span>
          <span>
            <strong className="text-amber-700">{currentMonthData.dueCount}</strong> due
          </span>
        </div>
      </div>

      {/* 3. Monthly Paid Out (Bonus received in current month) */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs transition-all hover:border-stone-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            Monthly Paid Out
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Award className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-amber-900">
            ${monthlyPaidOut.bonusReceivedAmount.toFixed(2)}
          </span>
          <span className="text-xs text-stone-500">
            bonus received in {selectedMonth}
          </span>
        </div>
        <div className="mt-3 text-xs text-stone-500 flex items-center justify-between pt-3 border-t border-stone-100">
          <span>
            <strong className="text-stone-800">{monthlyPaidOut.bonusReceivedCount}</strong> bonuses received × $2.50
          </span>
          <span className="font-medium text-amber-700">
            ${monthlyPaidOut.bonusPendingAmount.toFixed(2)} pending
          </span>
        </div>
      </div>

      {/* 4. All-Time Referral Payout */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-5 shadow-2xs transition-all hover:border-stone-300">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
            All-Time Referral Payout
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Clock className="w-4 h-4 stroke-[2]" />
          </div>
        </div>
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-2xl font-bold tracking-tight text-stone-900">
            ${allTimePayout.disbursed.toFixed(2)}
          </span>
          <span className="text-xs text-emerald-700 font-medium">paid out</span>
        </div>
        <div className="mt-3 text-xs text-stone-500 flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ${allTimePayout.disbursed.toFixed(2)} received
          </span>
          <span className="text-amber-700 font-medium">
            ${allTimePayout.pending.toFixed(2)} pending
          </span>
        </div>
      </div>
    </div>
  );
}
