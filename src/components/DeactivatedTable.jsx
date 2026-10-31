import React from 'react';
import { Power, CheckCircle, Trash2, Mail, Phone, Calendar, User, FileText, Sparkles, AlertTriangle } from 'lucide-react';

export default function DeactivatedTable({
  deactivatedClients,
  onActivateClient,
  onDeleteClient
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
      {/* Header Info */}
      <div className="px-5 py-4 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-stone-900">
              Deactivated Accounts
            </h3>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200/80">
              {deactivatedClients.length} {deactivatedClients.length === 1 ? 'Account' : 'Accounts'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Accounts that have left the bot system. You can reactivate an account at any time to restore its billing cycle.
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-semibold tracking-wider uppercase text-[11px]">
              <th className="py-3 px-4 min-w-[200px]">Account & Identity</th>
              <th className="py-3 px-4 min-w-[180px]">Client Email & Phone</th>
              <th className="py-3 px-4 min-w-[180px]">Notes / MT5 Details</th>
              <th className="py-3 px-4 min-w-[130px]">Cycle / Due</th>
              <th className="py-3 px-3 text-center min-w-[100px]">Fee ($50)</th>
              <th className="py-3 px-3 text-center min-w-[120px]">Status</th>
              <th className="py-3 pr-5 pl-3 text-right min-w-[160px]">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {deactivatedClients.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-stone-400">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                      <CheckCircle className="w-5 h-5 stroke-[2]" />
                    </div>
                    <p className="text-sm font-semibold text-stone-700">No Deactivated Accounts</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      All registered bot accounts are currently active in the system.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              deactivatedClients.map((client) => {
                return (
                  <tr key={client._id} className="transition-colors hover:bg-stone-50/70">
                    {/* Account Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900">{client.name}</div>
                          <div className="text-[10px] text-stone-400">
                            Manager: {client.assignedManager || 'Talha'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-stone-800 text-[11px] flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                          {client.email}
                        </span>
                        {client.phone && (
                          <span className="text-[10px] text-stone-500 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Notes / MT5 */}
                    <td className="py-3.5 px-4">
                      {client.notes ? (
                        <span className="text-xs text-stone-700 bg-stone-100/80 px-2.5 py-1 rounded-lg border border-stone-200/60 inline-block max-w-[220px] truncate" title={client.notes}>
                          {client.notes}
                        </span>
                      ) : (
                        <span className="text-stone-300 italic text-[11px]">No notes</span>
                      )}
                    </td>

                    {/* Cycle / Due */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-[11px]">
                        <span className="text-stone-500">1st: <span className="font-mono text-stone-700">{client.firstPaymentDate || '—'}</span></span>
                        <span className="text-stone-500">Next: <span className="font-mono text-stone-700">{client.nextDueDate || '—'}</span></span>
                      </div>
                    </td>

                    {/* Fee */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-semibold text-stone-800 text-xs">
                        ${client.monthlyFee || 50}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/80">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Deactivated</span>
                      </span>
                    </td>

                    {/* Action: Activate Button */}
                    <td className="py-3.5 pr-5 pl-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => onActivateClient(client)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-medium transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                          title="Restore account to active status"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>Activate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteClient(client)}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Permanently remove account record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
