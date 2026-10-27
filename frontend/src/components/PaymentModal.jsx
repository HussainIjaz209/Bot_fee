import React, { useState } from 'react';
import { X, Check, AlertCircle, Minus, Calendar, DollarSign, FileText, Gift } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  client,
  year,
  month,
  onSave
}) {
  if (!isOpen || !client) return null;

  const paymentData = client.payments?.[year]?.[month] || {};
  const [status, setStatus] = useState(paymentData.status || 'unset');
  const [paidDate, setPaidDate] = useState(paymentData.paidDate || new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState(paymentData.amount || client.monthlyFee || 50);
  const [notes, setNotes] = useState(paymentData.notes || '');
  const [referralStatus, setReferralStatus] = useState(paymentData.referralStatus || (status === 'paid' ? 'pending' : 'none'));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        clientId: client._id,
        year,
        month,
        status,
        paidDate: status === 'paid' ? paidDate : null,
        amount: Number(amount),
        notes,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div>
            <h3 className="text-base font-semibold text-stone-900">
              Payment Record — {month} {year}
            </h3>
            <p className="text-xs text-stone-500">
              Client: <span className="font-medium text-stone-800">{client.name}</span> ({client.email})
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Status Selection Buttons */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              Subscription Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('paid')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'paid'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs font-semibold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Paid ($50)</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('due')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'due'
                    ? 'border-rose-400 bg-rose-50 text-rose-800 shadow-2xs font-semibold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Need to Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('unset')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  status === 'unset'
                    ? 'border-stone-400 bg-stone-100 text-stone-800 shadow-2xs font-semibold'
                    : 'border-stone-200 hover:border-stone-300 text-stone-600 bg-white'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Unset (-)</span>
              </button>
            </div>
          </div>

          {/* Conditional: Payment Date & Amount */}
          {status === 'paid' && (
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200/60">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-stone-400" />
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paidDate}
                  onChange={(e) => setPaidDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-stone-400" />
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="col-span-2 pt-2 border-t border-stone-200/50 flex items-center justify-between text-xs">
                <span className="text-stone-500">Talha Referral Commission:</span>
                <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                  ${client.referralRate || 2.50} (Initialized to Pending)
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3 text-stone-400" />
              Notes / Transaction ID
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Paid via USDT TRC20, MT5 account verified"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 active:scale-[0.98] text-white text-xs font-medium rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
