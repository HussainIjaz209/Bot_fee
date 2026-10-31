import React from 'react';
import {
  Sparkles,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  CreditCard,
  Edit2,
  Power,
  Trash2,
  Gift,
  ArrowRight
} from 'lucide-react';

export default function TrialTable({
  trialClients = [],
  selectedYear,
  selectedMonth,
  onCollectPayment,
  onActivateDirectly,
  onEditClient,
  onDeactivateClient,
  onDeleteClient
}) {
  // Helper to calculate trial days remaining
  const getTrialStatus = (client) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = client.firstPaymentDate ? new Date(client.firstPaymentDate) : null;
    const trialDays = Number(client.freeTrialDays) || 11;
    
    // Target end date: prefer client.nextDueDate, else startDate + trialDays
    let endDate;
    if (client.nextDueDate) {
      endDate = new Date(client.nextDueDate);
    } else if (startDate && !isNaN(startDate.getTime())) {
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + trialDays);
    } else {
      endDate = null;
    }

    if (!endDate || isNaN(endDate.getTime())) {
      return {
        daysLeft: null,
        isExpired: false,
        label: '11-Day Free Trial',
        color: 'stone'
      };
    }

    endDate.setHours(0, 0, 0, 0);
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return {
        daysLeft: diffDays,
        isExpired: false,
        label: `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left of ${trialDays}d trial`,
        color: diffDays <= 3 ? 'amber' : 'emerald',
        endDateStr: endDate.toISOString().split('T')[0]
      };
    } else if (diffDays === 0) {
      return {
        daysLeft: 0,
        isExpired: false,
        label: 'Last day of trial (Due today)',
        color: 'rose',
        endDateStr: endDate.toISOString().split('T')[0]
      };
    } else {
      const expiredAgo = Math.abs(diffDays);
      return {
        daysLeft: diffDays,
        isExpired: true,
        label: `Trial ended ${expiredAgo}d ago (Payment Due)`,
        color: 'rose',
        endDateStr: endDate.toISOString().split('T')[0]
      };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 shadow-2xs overflow-hidden">
      {/* Header Info */}
      <div className="px-5 py-4 border-b border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-50/60">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">
              Free Trial Accounts (11 Days)
            </h3>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200/80">
              {trialClients.length} {trialClients.length === 1 ? 'Account' : 'Accounts'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Accounts currently using the bot on their 11-day free trial. Collecting their first $50 subscription fee automatically activates them and moves them to the Active Accounts table.
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
              <th className="py-3 px-4 min-w-[200px]">Trial Period & Status</th>
              <th className="py-3 px-4 min-w-[180px]">Notes / MT5 Details</th>
              <th className="py-3 px-3 text-center min-w-[110px]">Upcoming Fee</th>
              <th className="py-3 pr-5 pl-3 text-right min-w-[220px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-stone-100">
            {trialClients.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-stone-400">
                  <div className="max-w-xs mx-auto flex flex-col items-center">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                      <Gift className="w-5 h-5 stroke-[2]" />
                    </div>
                    <p className="text-sm font-semibold text-stone-700">No Accounts in Free Trial</p>
                    <p className="text-xs text-stone-400 mt-0.5">
                      New registrations with 11-day free trial enabled will appear here until their first payment is recorded.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              trialClients.map((client) => {
                const trial = getTrialStatus(client);
                return (
                  <tr key={client._id} className="transition-colors hover:bg-stone-50/70">
                    {/* Account Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                            <span>{client.name}</span>
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              11-Day Trial
                            </span>
                          </div>
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

                    {/* Trial Period & Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                              trial.color === 'emerald'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                : trial.color === 'amber'
                                ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                : 'bg-rose-50 text-rose-700 border-rose-200/80'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {trial.label}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-2">
                          <span>Joined: {client.firstPaymentDate || 'N/A'}</span>
                          <span>•</span>
                          <span>Due: {client.nextDueDate || 'N/A'}</span>
                        </div>
                      </div>
                    </td>

                    {/* Notes / MT5 */}
                    <td className="py-3.5 px-4">
                      {client.notes ? (
                        <span
                          className="text-xs text-stone-700 bg-stone-100/80 px-2.5 py-1 rounded-lg border border-stone-200/60 inline-block max-w-[200px] truncate"
                          title={client.notes}
                        >
                          {client.notes}
                        </span>
                      ) : (
                        <span className="text-stone-300 italic text-[11px]">No notes</span>
                      )}
                    </td>

                    {/* Subscription Fee */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="font-semibold text-stone-900">
                        ${client.monthlyFee || 50}
                        <span className="text-[10px] text-stone-400 font-normal">/mo</span>
                      </div>
                      <div className="text-[10px] text-amber-700 font-medium">
                        +${client.referralRate || 2.5} bonus
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-5 pl-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {/* Collect $50 / Activate */}
                        <button
                          type="button"
                          onClick={() => onCollectPayment(client)}
                          title="Record $50 first month payment & activate account"
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Collect $50</span>
                        </button>

                        {/* Direct Activate without payment */}
                        <button
                          type="button"
                          onClick={() => onActivateDirectly(client)}
                          title="Activate account directly without logging payment"
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Profile */}
                        <button
                          type="button"
                          onClick={() => onEditClient(client)}
                          title="Edit account details"
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Deactivate */}
                        <button
                          type="button"
                          onClick={() => onDeactivateClient(client)}
                          title="Deactivate account"
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => onDeleteClient(client)}
                          title="Delete account"
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
