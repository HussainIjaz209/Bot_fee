import React, { useState, useEffect } from 'react';
import { X, UserPlus, Sparkles, Calendar, ShieldCheck, User, Mail, Phone, FileText, Info } from 'lucide-react';

export default function AddClientModal({ isOpen, onClose, onAddClient, existingEmails = [] }) {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [monthlyFee, setMonthlyFee] = useState(50);
  const [referralRate, setReferralRate] = useState(2.5);
  const [assignedManager, setAssignedManager] = useState('Talha');
  const [firstPaymentDate, setFirstPaymentDate] = useState(todayStr);
  const [hasFreeTrial, setHasFreeTrial] = useState(true);
  const [freeTrialDays, setFreeTrialDays] = useState(11);
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const normalizedEmail = email.trim().toLowerCase();
  const emailExists = Boolean(normalizedEmail && existingEmails.includes(normalizedEmail));

  // Recalculate next due date when firstPaymentDate or free trial changes
  useEffect(() => {
    if (!firstPaymentDate) return;
    const baseDate = new Date(firstPaymentDate);
    if (isNaN(baseDate.getTime())) return;

    const next = new Date(baseDate);
    if (hasFreeTrial) {
      // 11-day free trial on first month
      next.setDate(next.getDate() + Number(freeTrialDays || 11));
    } else {
      next.setDate(next.getDate() + 30);
    }
    setNextDueDate(next.toISOString().split('T')[0]);
  }, [firstPaymentDate, hasFreeTrial, freeTrialDays]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAddClient({
        name,
        email: normalizedEmail,
        phone,
        monthlyFee: Number(monthlyFee),
        referralRate: Number(referralRate),
        assignedManager,
        firstPaymentDate,
        hasFreeTrial,
        freeTrialDays: Number(freeTrialDays),
        nextDueDate,
        notes,
        status: hasFreeTrial ? 'trial' : 'active'
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
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                Register New Client & Account
              </h3>
              <p className="text-xs text-stone-500">
                Add a new user with their initial trading bot account
              </p>
            </div>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" />
                Client Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Abdal or Account Alias"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-stone-400" />
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@gmail.com"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          </div>

          {emailExists && (
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Existing Email:</strong> This client already has accounts. Adding this will register a new account under their email.
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-stone-400" />
                WhatsApp / Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-stone-400" />
                Assigned Manager
              </label>
              <input
                type="text"
                value={assignedManager}
                onChange={(e) => setAssignedManager(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 bg-stone-50"
              />
            </div>
          </div>

          {/* Pricing & Free Trial Banner */}
          <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-800">
                <input
                  type="checkbox"
                  checked={hasFreeTrial}
                  onChange={(e) => setHasFreeTrial(e.target.checked)}
                  className="rounded-sm border-stone-300 text-amber-600 focus:ring-amber-500/30"
                />
                <span>Include 11-Day Free Trial on First Month</span>
              </label>
              <span className="text-[10px] font-medium text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
                11 Days Free
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  Registration / Join Date
                </label>
                <input
                  type="date"
                  required
                  value={firstPaymentDate}
                  onChange={(e) => setFirstPaymentDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">
                  First Payment Due Date
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-semibold text-amber-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-stone-600 pt-1 border-t border-amber-200/50">
              <span>Standard Monthly Fee: <strong className="text-stone-900">${monthlyFee}</strong></span>
              <span>Talha Referral Bonus: <strong className="text-amber-900">${referralRate}</strong></span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-stone-400" />
              Account Notes (MT5 account #, Broker, Strategy)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="MT5 account #12345 (IC Markets)"
              className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
            />
          </div>

          {/* Footer */}
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
              {loading ? 'Creating...' : 'Register Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
