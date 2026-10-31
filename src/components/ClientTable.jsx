import React, { useState, useMemo, useEffect } from 'react';
import {
  Check,
  AlertCircle,
  Minus,
  Clock,
  CheckCircle,
  Edit2,
  Trash2,
  Calendar,
  Gift,
  ChevronDown,
  ChevronRight,
  Plus,
  Layers,
  UserX,
  User,
  Shield,
  ChevronsUpDown,
  Mail
} from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function ClientTable({
  clients,
  selectedYear,
  selectedMonth,
  currentFilter,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onCellClick,
  onToggleReferral,
  onEditClient,
  onDeactivateClient,
  onDeleteClient,
  onOpenAddAccount
}) {
  // Group accounts by unique lowercase email
  const emailGroups = useMemo(() => {
    const groups = {};
    clients.forEach((client) => {
      const emailKey = (client.email || 'no-email').toLowerCase().trim();
      if (!groups[emailKey]) {
        groups[emailKey] = {
          email: client.email,
          primaryName: client.name,
          phone: client.phone || '',
          accounts: [],
          totalFee: 0,
        };
      }
      groups[emailKey].accounts.push(client);
      groups[emailKey].totalFee += (client.monthlyFee || 50);
    });
    return Object.values(groups);
  }, [clients]);

  // Track expanded state for each email
  // If search or non-"all" filter is active, default to expanded so results are immediately visible
  const [expandedEmails, setExpandedEmails] = useState({});

  useEffect(() => {
    if (currentFilter !== 'all') {
      const allKeys = {};
      emailGroups.forEach((g) => {
        allKeys[g.email.toLowerCase()] = true;
      });
      setExpandedEmails(allKeys);
    }
  }, [currentFilter, emailGroups]);

  const toggleEmailExpand = (email) => {
    const key = email.toLowerCase();
    setExpandedEmails((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const areAllExpanded = emailGroups.length > 0 && emailGroups.every((g) => expandedEmails[g.email.toLowerCase()]);

  const handleToggleExpandAll = () => {
    if (areAllExpanded) {
      setExpandedEmails({});
    } else {
      const allExpanded = {};
      emailGroups.forEach((g) => {
        allExpanded[g.email.toLowerCase()] = true;
      });
      setExpandedEmails(allExpanded);
    }
  };

  const allSelected = clients.length > 0 && selectedIds.length === clients.length;

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
      {/* Table Toolbar / Unique Email Summary */}
      <div className="px-4 py-3 bg-stone-50/70 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-stone-800">
            {emailGroups.length} Unique {emailGroups.length === 1 ? 'Client Email' : 'Client Emails'}
          </span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-600">
            {clients.length} Total {clients.length === 1 ? 'Account' : 'Accounts'}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggleExpandAll}
          className="px-2.5 py-1 rounded-xl bg-white border border-stone-200 hover:border-stone-300 text-stone-700 text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
        >
          <ChevronsUpDown className="w-3.5 h-3.5 text-stone-500" />
          <span>{areAllExpanded ? 'Collapse All Emails' : 'Expand All Emails'}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-semibold tracking-wider uppercase text-[11px]">
              {/* Checkbox */}
              <th className="py-3 pl-4 pr-2 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded-sm border-stone-300 text-stone-900 focus:ring-amber-500/30 cursor-pointer"
                  title="Select all accounts"
                />
              </th>

              {/* Client & Account Info */}
              <th className="py-3 px-3 min-w-[210px]">Client / Account Identity</th>

              {/* Billing Dates */}
              <th className="py-3 px-3 min-w-[130px]">Cycle / Due</th>

              {/* Referral Bonus for Selected Month */}
              <th className="py-3 px-3 min-w-[170px] text-center bg-amber-50/40 border-x border-amber-100/60">
                <div className="flex items-center justify-center gap-1 text-amber-900">
                  <Gift className="w-3.5 h-3.5 text-amber-600" />
                  <span>{MONTH_SHORT[MONTH_NAMES.indexOf(selectedMonth)]} Bonus ($2.50)</span>
                </div>
              </th>

              {/* 12 Months */}
              {MONTH_SHORT.map((m, idx) => {
                const isSelected = MONTH_NAMES[idx] === selectedMonth;
                return (
                  <th
                    key={m}
                    className={`py-3 px-2 text-center min-w-[68px] ${
                      isSelected
                        ? 'bg-stone-100 font-bold text-stone-900 border-x border-stone-200/80'
                        : 'text-stone-600'
                    }`}
                  >
                    {m}
                  </th>
                );
              })}

              {/* Actions */}
              <th className="py-3 pr-4 pl-2 text-right w-24">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {emailGroups.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-stone-400">
                  <div className="max-w-xs mx-auto">
                    <p className="text-sm font-medium text-stone-600 mb-1">No clients found</p>
                    <p className="text-xs text-stone-400">
                      No matching records found for "{selectedMonth} {selectedYear}" with current filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              emailGroups.map((group) => {
                const isExpanded = Boolean(expandedEmails[group.email.toLowerCase()]);
                const accountCount = group.accounts.length;

                // Compute month summary for this email
                let paidAccountsCount = 0;
                let dueAccountsCount = 0;
                group.accounts.forEach((acc) => {
                  const status = acc.payments?.[selectedYear]?.[selectedMonth]?.status;
                  if (status === 'paid') paidAccountsCount++;
                  else if (status === 'due') dueAccountsCount++;
                });

                return (
                  <React.Fragment key={group.email}>
                    {/* Unique Email Group Header Row */}
                    <tr
                      onClick={() => toggleEmailExpand(group.email)}
                      className="bg-stone-50/90 hover:bg-stone-100/90 cursor-pointer transition-colors border-t border-b border-stone-200/90"
                    >
                      <td className="py-2.5 pl-4 pr-2 text-stone-500">
                        <div className="flex items-center justify-center w-5 h-5 text-stone-600">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-amber-700" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                      </td>

                      {/* Email + Client details */}
                      <td colSpan={3} className="py-2.5 px-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-stone-900 text-xs font-mono">
                            {group.email}
                          </span>
                          <span className="text-stone-500 text-xs">
                            ({group.primaryName})
                          </span>

                          {/* Accounts badge */}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                              accountCount > 1
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-stone-200/70 text-stone-700 border-stone-300'
                            }`}
                          >
                            <Layers className="w-3 h-3 text-amber-700" />
                            <span>{accountCount} {accountCount === 1 ? 'Account' : 'Accounts'}</span>
                          </span>

                          <span className="text-[11px] text-stone-400">
                            · ${group.totalFee}/mo
                          </span>
                        </div>
                      </td>

                      {/* Month summary info spanning month cols */}
                      <td colSpan={11} className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-3 text-xs">
                          <span className="text-stone-500 text-[11px] hidden sm:inline">
                            {selectedMonth}:{' '}
                            <strong className="text-emerald-700 font-semibold">{paidAccountsCount} Paid</strong>
                            {dueAccountsCount > 0 && (
                              <>, <strong className="text-rose-700 font-semibold">{dueAccountsCount} Due</strong></>
                            )}
                          </span>

                          {/* + Add Account Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAddAccount(group.email, group.phone);
                            }}
                            className="px-2.5 py-1 rounded-xl bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-[11px] font-medium transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                            title={`Add another bot account for ${group.email}`}
                          >
                            <Plus className="w-3 h-3 text-amber-400" />
                            <span>Add Account</span>
                          </button>
                        </div>
                      </td>

                      {/* Empty cell for actions alignment */}
                      <td className="py-2.5 pr-4 pl-2 text-right text-stone-400 text-[11px]">
                        {isExpanded ? 'Hide' : 'Show'}
                      </td>
                    </tr>

                    {/* Expanded: Accounts linked to this email */}
                    {isExpanded &&
                      group.accounts.map((client) => {
                        const isSelected = selectedIds.includes(client._id);
                        const currentMonthPayment = client.payments?.[selectedYear]?.[selectedMonth] || {
                          status: 'unset',
                          referralStatus: 'none',
                        };
                        const isCurrentMonthPaid = currentMonthPayment.status === 'paid';
                        const referralStatus = currentMonthPayment.referralStatus;

                        return (
                          <tr
                            key={client._id}
                            className={`transition-colors hover:bg-amber-50/20 bg-white ${
                              isSelected ? 'bg-amber-50/30' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <td className="py-3 pl-4 pr-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggleSelect(client._id)}
                                className="rounded-sm border-stone-300 text-stone-900 focus:ring-amber-500/30 cursor-pointer"
                              />
                            </td>

                            {/* Account Identity */}
                            <td className="py-3 px-3">
                              <div className="flex flex-col pl-2 border-l-2 border-amber-400">
                                <span className="font-semibold text-stone-900 hover:text-amber-700 transition-colors">
                                  {client.name}
                                </span>
                                {client.notes ? (
                                  <span className="text-[11px] text-stone-500 truncate max-w-[200px]" title={client.notes}>
                                    {client.notes}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-stone-400 italic">Standard bot account</span>
                                )}
                              </div>
                            </td>

                            {/* Billing Cycle: 1st & Next Due */}
                            <td className="py-3 px-3">
                              <div className="flex flex-col gap-1 text-[11px]">
                                <div className="flex items-center gap-1.5 text-stone-600">
                                  <span className="text-[10px] font-medium text-stone-400 uppercase w-8">1st:</span>
                                  <span className="font-mono">{client.firstPaymentDate || '—'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-stone-800">
                                  <span className="text-[10px] font-medium text-stone-400 uppercase w-8">Next:</span>
                                  <span className="font-mono font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                                    {client.nextDueDate || '—'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Referral Bonus ($2.50) Column for Selected Month */}
                            <td className="py-3 px-3 text-center bg-amber-50/20 border-x border-amber-100/40">
                              {isCurrentMonthPaid ? (
                                referralStatus === 'received' ? (
                                  <button
                                    type="button"
                                    onClick={() => onToggleReferral(client, selectedYear, selectedMonth, 'pending')}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100 text-[11px] font-medium transition-all shadow-2xs cursor-pointer"
                                    title="Referral Bonus Paid! Click to revert to pending if needed."
                                  >
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>✓ Bonus Paid ($2.50)</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onToggleReferral(client, selectedYear, selectedMonth, 'received')}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 text-[11px] font-medium transition-all shadow-2xs cursor-pointer animate-soft-pulse"
                                    title="Click to release $2.50 referral bonus to Talha"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-amber-700" />
                                    <span>⏳ Bonus Pending (Click to Pay)</span>
                                  </button>
                                )
                              ) : (
                                <span className="text-[11px] text-stone-400 font-normal">
                                  Bot Fee Unpaid
                                </span>
                              )}
                            </td>

                            {/* 12 Months Columns */}
                            {MONTH_NAMES.map((m) => {
                              const payment = client.payments?.[selectedYear]?.[m];
                              const status = payment?.status || 'unset';
                              const isColSelected = m === selectedMonth;

                              return (
                                <td
                                  key={m}
                                  onClick={() => {
                                    if (currentFilter === 'bonus_pending' && status === 'paid') {
                                      onToggleReferral(client, selectedYear, m, 'received');
                                    } else {
                                      onCellClick(client, selectedYear, m);
                                    }
                                  }}
                                  className={`py-3 px-1 text-center cursor-pointer transition-all hover:bg-amber-100/50 ${
                                    isColSelected ? 'bg-stone-50/70 border-x border-stone-200/60 font-medium' : ''
                                  }`}
                                  title={`Click to edit ${m} payment for ${client.name}`}
                                >
                                  <div className="flex items-center justify-center">
                                    {status === 'paid' ? (
                                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 flex items-center justify-center shadow-2xs hover:scale-105 transition-transform">
                                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                      </div>
                                    ) : status === 'due' ? (
                                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 border border-rose-200/70 flex items-center justify-center shadow-2xs hover:scale-105 transition-transform">
                                        <AlertCircle className="w-3.5 h-3.5 stroke-[2]" />
                                      </div>
                                    ) : (
                                      <div className="w-7 h-7 rounded-lg text-stone-300 hover:text-stone-500 hover:bg-stone-100 flex items-center justify-center transition-colors">
                                        <Minus className="w-3 h-3" />
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}

                            {/* Action buttons: Edit, Deactivate, Delete */}
                            <td className="py-3 pr-4 pl-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => onEditClient(client)}
                                  className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                                  title="Edit account details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDeactivateClient(client)}
                                  className="p-1 rounded-md text-stone-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                                  title="Deactivate account (move to Deactivated table)"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDeleteClient(client)}
                                  className="p-1 rounded-md text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Permanently delete account"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
