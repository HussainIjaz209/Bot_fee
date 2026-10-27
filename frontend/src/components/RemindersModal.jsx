import React, { useState } from 'react';
import { X, Bell, MessageSquare, Mail, Copy, Check, ExternalLink, Send } from 'lucide-react';

export default function RemindersModal({
  isOpen,
  onClose,
  unpaidClients,
  selectedMonth,
  selectedYear
}) {
  if (!isOpen) return null;

  const [selectedClient, setSelectedClient] = useState(unpaidClients[0] || null);
  const [copiedType, setCopiedType] = useState(null);

  // Template generation
  const clientName = selectedClient?.name || '[Client Name]';
  const feeAmount = selectedClient?.monthlyFee || 50;
  const dueDate = selectedClient?.nextDueDate || `${selectedMonth} 30, ${selectedYear}`;
  const notes = selectedClient?.notes || '';

  const whatsappMessage = `*Trading Bot Fee Reminder — ${selectedMonth} ${selectedYear}*

Hello ${clientName},

This is a gentle reminder that your monthly Trading Bot subscription fee (*$${feeAmount}.00*) for *${selectedMonth} ${selectedYear}* is currently due.

📅 *Due Date:* ${dueDate}
${notes ? `📌 *Account:* ${notes}\n` : ''}💵 *Amount:* $${feeAmount}.00 USD

*Payment Methods:*
• USDT (TRC20): \`TX8s9B...YourTrc20Address\`
• USDT (BEP20): \`0x71C...YourBep20Address\`
• Or Bank Transfer / Wise

Please send the transaction hash or payment receipt here once transferred so your bot continues running uninterrupted without downtime.

Thank you!`;

  const emailSubject = `Trading Bot Monthly Fee Reminder — ${selectedMonth} ${selectedYear}`;
  const emailBody = `Hi ${clientName},

Hope you are doing well.

This is a reminder that your monthly subscription fee for the Trading Bot ($${feeAmount}.00) for ${selectedMonth} ${selectedYear} is due for renewal.

Subscription Details:
- Client: ${clientName}
- Billing Cycle: ${selectedMonth} ${selectedYear}
- Renewal Due Date: ${dueDate}
${notes ? `- MT5 Account: ${notes}\n` : ''}- Fee: $${feeAmount}.00

Payment Details:
- USDT (TRC-20): TX8s9B...YourTrc20Address
- USDT (BEP-20): 0x71C...YourBep20Address

Kindly reply with the transaction confirmation once processed so we can verify your account and keep your bot active.

Best regards,
Trading Operations Team`;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!selectedClient) return;
    const phone = (selectedClient.phone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-stone-900">
                Payment Reminders ({unpaidClients.length} Unpaid for {selectedMonth})
              </h3>
              <p className="text-xs text-stone-500">
                One-click WhatsApp & Email message templates
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

        {/* Content */}
        <div className="p-6">
          {unpaidClients.length === 0 ? (
            <div className="text-center py-8 text-stone-500">
              <p className="text-sm font-semibold text-emerald-800">All caught up! 🎉</p>
              <p className="text-xs text-stone-400 mt-1">
                All registered clients have paid their $50 bot fee for {selectedMonth} {selectedYear}.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Client List */}
              <div className="md:col-span-1 border border-stone-200 rounded-xl overflow-hidden flex flex-col max-h-[360px]">
                <div className="bg-stone-50 px-3 py-2 border-b border-stone-200 text-[11px] font-semibold text-stone-600 uppercase tracking-wider">
                  Unpaid Clients
                </div>
                <div className="divide-y divide-stone-100 overflow-y-auto flex-1">
                  {unpaidClients.map((client) => {
                    const isSelected = selectedClient?._id === client._id;
                    const payment = client.payments?.[selectedYear]?.[selectedMonth];
                    const isDue = payment?.status === 'due';

                    return (
                      <button
                        key={client._id}
                        type="button"
                        onClick={() => setSelectedClient(client)}
                        className={`w-full p-2.5 text-left text-xs transition-colors flex flex-col gap-0.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/80 text-stone-900 font-semibold'
                            : 'hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{client.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                              isDue
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {isDue ? 'DUE' : 'UNSET'}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-400 truncate">
                          {client.email}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Generator & Actions */}
              <div className="md:col-span-2 space-y-3 flex flex-col">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-800">
                    Reminder Message for <strong className="text-amber-800">{selectedClient?.name}</strong>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopy(whatsappMessage, 'wa')}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-[11px] font-medium text-stone-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      {copiedType === 'wa' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy WhatsApp</span>
                        </>
                      )}
                    </button>

                    {selectedClient?.phone && (
                      <button
                        type="button"
                        onClick={handleOpenWhatsApp}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Open WhatsApp chat directly"
                      >
                        <Send className="w-3 h-3" />
                        <span>Send WhatsApp</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Preview Box */}
                <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 flex-1 overflow-y-auto max-h-[220px]">
                  <pre className="text-[11px] font-mono text-stone-700 whitespace-pre-wrap leading-relaxed select-all">
                    {whatsappMessage}
                  </pre>
                </div>

                {/* Email Section */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[11px] text-stone-500">
                    Recipient: <strong className="text-stone-700">{selectedClient?.email || 'N/A'}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(emailBody, 'email')}
                    className="px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-[11px] font-medium text-stone-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    {copiedType === 'email' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">Email Copied!</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3 h-3 text-stone-500" />
                        <span>Copy Email Format</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
