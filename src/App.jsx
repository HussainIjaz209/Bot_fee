import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  api,
  getAuthToken,
  setAuthToken,
  getCurrentUser,
  setCurrentUser,
} from './api';

import LoginView from './components/LoginView';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import FilterTabs from './components/FilterTabs';
import ClientTable from './components/ClientTable';
import DeactivatedTable from './components/DeactivatedTable';
import PaymentModal from './components/PaymentModal';
import AddClientModal from './components/AddClientModal';
import AddAccountModal from './components/AddAccountModal';
import EditClientModal from './components/EditClientModal';
import RemindersModal from './components/RemindersModal';
import BatchBar from './components/BatchBar';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function App() {
  const [currentUser, setUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(true);

  // View state: 'active' | 'deactivated'
  const [activeView, setActiveView] = useState('active');

  // Filters & Date selectors
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [currentFilter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [allClients, setAllClients] = useState([]);
  const [deactivatedClients, setDeactivatedClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [paymentModalData, setPaymentModalData] = useState(null); // { client, year, month }
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [addAccountTarget, setAddAccountTarget] = useState(null); // { email, phone }
  const [editClientData, setEditClientData] = useState(null);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#F59E0B', '#10B981', '#6366F1'],
      });
    } catch (e) {
      // ignore if unsupported
    }
  };

  // Auth synchronization
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Fetch data
  const fetchData = useCallback(async () => {
    if (!getAuthToken()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [statsRes, activeRes, deactivatedRes] = await Promise.all([
        api.getStats(selectedYear, selectedMonth),
        api.getRecords(selectedYear, selectedMonth, searchQuery, 'all', 'active'),
        api.getRecords(selectedYear, selectedMonth, searchQuery, 'all', 'deactivated'),
      ]);
      setStats(statsRes);
      setAllClients(activeRes.clients || []);
      setDeactivatedClients(deactivatedRes.clients || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, searchQuery]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Compute filter counts for active accounts
  const counts = useMemo(() => {
    let all = allClients.length;
    let need_to_pay = 0;
    let paid = 0;
    let bonus_pending = 0;
    let bonus_received = 0;
    let unset = 0;

    allClients.forEach((c) => {
      const p = c.payments?.[selectedYear]?.[selectedMonth] || { status: 'unset', referralStatus: 'none' };
      if (p.status === 'paid') {
        paid++;
        if (p.referralStatus === 'pending') bonus_pending++;
        if (p.referralStatus === 'received') bonus_received++;
      } else if (p.status === 'due') {
        need_to_pay++;
      } else {
        unset++;
      }
    });

    return { all, need_to_pay, paid, bonus_pending, bonus_received, unset };
  }, [allClients, selectedYear, selectedMonth]);

  // Filter clients based on sub-tab
  const filteredClients = useMemo(() => {
    return allClients.filter((client) => {
      const p = client.payments?.[selectedYear]?.[selectedMonth] || { status: 'unset', referralStatus: 'none' };

      if (currentFilter === 'paid') return p.status === 'paid';
      if (currentFilter === 'need_to_pay') return p.status === 'due';
      if (currentFilter === 'unset') return !p.status || p.status === 'unset';
      if (currentFilter === 'bonus_pending') return p.status === 'paid' && p.referralStatus === 'pending';
      if (currentFilter === 'bonus_received') return p.status === 'paid' && p.referralStatus === 'received';
      return true;
    });
  }, [allClients, selectedYear, selectedMonth, currentFilter]);

  // Unpaid clients for Reminders Modal (active only)
  const unpaidClients = useMemo(() => {
    return allClients.filter((client) => {
      const p = client.payments?.[selectedYear]?.[selectedMonth];
      return !p || p.status !== 'paid';
    });
  }, [allClients, selectedYear, selectedMonth]);

  // Selection handlers
  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(filteredClients.map((c) => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  // Payment update
  const handleSavePayment = async (data) => {
    try {
      await api.updatePayment(data.clientId, data);
      showToast(`Updated payment for ${data.month} ${data.year}`);
      if (data.status === 'paid') triggerCelebration();
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update payment');
    }
  };

  // 1-Click Toggle Referral Status
  const handleToggleReferral = async (client, year, month, newStatus) => {
    try {
      await api.toggleReferralStatus(client._id, {
        year,
        month,
        referralStatus: newStatus,
      });

      if (newStatus === 'received') {
        triggerCelebration();
        showToast(`✓ Released $2.50 bonus to Talha for ${client.name}!`);
      } else {
        showToast(`Reverted referral bonus to Pending for ${client.name}.`);
      }
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update referral status');
    }
  };

  // Bulk actions
  const handleBulkPayFee = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.batchPayment({
        clientIds: selectedIds,
        year: selectedYear,
        month: selectedMonth,
        status: 'paid',
        paidDate: new Date().toISOString().split('T')[0],
        amount: 50,
      });
      triggerCelebration();
      showToast(`Marked ${selectedIds.length} accounts as Paid for ${selectedMonth}!`);
      setSelectedIds([]);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Bulk payment failed');
    }
  };

  const handleBulkReleaseBonus = async () => {
    if (selectedIds.length === 0) return;
    try {
      await api.batchReferralStatus({
        clientIds: selectedIds,
        year: selectedYear,
        month: selectedMonth,
        referralStatus: 'received',
      });
      triggerCelebration();
      showToast(`Released bonuses ($2.50) for selected accounts!`);
      setSelectedIds([]);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Bulk bonus release failed');
    }
  };

  // Register new client user
  const handleAddClient = async (clientData) => {
    try {
      await api.createRecord(clientData);
      triggerCelebration();
      showToast(`Registered new client: ${clientData.name} (${clientData.email})`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to register client');
    }
  };

  // Add an additional account to existing email
  const handleAddAccount = async (accountData) => {
    try {
      await api.createRecord(accountData);
      triggerCelebration();
      showToast(`Added account "${accountData.name}" under ${accountData.email}`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to add account');
    }
  };

  const handleUpdateClient = async (id, clientData) => {
    try {
      await api.updateRecord(id, clientData);
      showToast('Account details updated');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update account');
    }
  };

  // Deactivate account
  const handleDeactivateClient = async (client) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${client.name}" (${client.email})?\n\nThis account will be moved to the Deactivated Accounts table. You can reactivate it at any time.`
    );
    if (!confirmed) return;

    try {
      await api.updateAccountStatus(client._id, 'deactivated');
      showToast(`Account "${client.name}" has been deactivated.`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to deactivate account');
    }
  };

  // Reactivate account
  const handleActivateClient = async (client) => {
    const confirmed = window.confirm(
      `Reactivate account "${client.name}" (${client.email})?\n\nThis account will be restored to the Active Accounts table.`
    );
    if (!confirmed) return;

    try {
      await api.updateAccountStatus(client._id, 'active');
      triggerCelebration();
      showToast(`✓ Account "${client.name}" is now active!`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to activate account');
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Permanently delete account record "${client.name}" (${client.email})?`)) return;
    try {
      await api.deleteRecord(client._id);
      showToast(`Account "${client.name}" removed`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to delete client');
    }
  };

  // Excel export
  const handleExportExcel = async () => {
    setExportLoading(true);
    try {
      const url = api.getExportExcelUrl(selectedYear);
      const token = getAuthToken();
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `Bot_Fee_Records_${selectedYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`Downloaded Bot_Fee_Records_${selectedYear}.xlsx`);
    } catch (err) {
      alert(err.message || 'Failed to export spreadsheet');
    } finally {
      setExportLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUser(null);
  };

  // If not authenticated, show friendly login view
  if (!currentUser) {
    return <LoginView onLoginSuccess={(u) => setUser(u)} />;
  }

  // All known unique emails for duplicate checks
  const existingEmails = [
    ...new Set([
      ...allClients.map((c) => (c.email || '').toLowerCase().trim()),
      ...deactivatedClients.map((c) => (c.email || '').toLowerCase().trim()),
    ]),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-800 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        onOpenAddModal={() => setIsAddClientModalOpen(true)}
        onOpenRemindersModal={() => setIsRemindersOpen(true)}
        onExportExcel={handleExportExcel}
        exportLoading={exportLoading}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-Time Statistics & All-Time Analytics */}
        <StatsCards
          stats={stats}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        {/* View Switcher, Filter Tabs & Instant Search */}
        <FilterTabs
          activeView={activeView}
          setActiveView={setActiveView}
          currentFilter={currentFilter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          counts={counts}
          deactivatedCount={deactivatedClients.length}
        />

        {/* Conditional Table Display */}
        {activeView === 'active' ? (
          <ClientTable
            clients={filteredClients}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            currentFilter={currentFilter}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            onCellClick={(client, year, month) => {
              setPaymentModalData({ client, year, month });
            }}
            onToggleReferral={handleToggleReferral}
            onEditClient={(client) => setEditClientData(client)}
            onDeactivateClient={handleDeactivateClient}
            onDeleteClient={handleDeleteClient}
            onOpenAddAccount={(email, phone) => {
              setAddAccountTarget({ email, phone });
            }}
          />
        ) : (
          <DeactivatedTable
            deactivatedClients={deactivatedClients}
            onActivateClient={handleActivateClient}
            onDeleteClient={handleDeleteClient}
          />
        )}
      </main>

      {/* Floating Batch Actions Bar (Active view only) */}
      {activeView === 'active' && (
        <BatchBar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          onBulkPayFee={handleBulkPayFee}
          onBulkReleaseBonus={handleBulkReleaseBonus}
          month={selectedMonth}
          year={selectedYear}
        />
      )}

      {/* Payment Update Modal */}
      {paymentModalData && (
        <PaymentModal
          isOpen={true}
          onClose={() => setPaymentModalData(null)}
          client={paymentModalData.client}
          year={paymentModalData.year}
          month={paymentModalData.month}
          onSave={handleSavePayment}
        />
      )}

      {/* Add Client Modal (New Email user + initial account) */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onAddClient={handleAddClient}
        existingEmails={existingEmails}
      />

      {/* Add Account Modal (Dedicated for adding accounts under an existing email) */}
      {addAccountTarget && (
        <AddAccountModal
          isOpen={true}
          onClose={() => setAddAccountTarget(null)}
          targetEmail={addAccountTarget.email}
          targetPhone={addAccountTarget.phone}
          onAddAccount={handleAddAccount}
        />
      )}

      {/* Edit Client Modal */}
      {editClientData && (
        <EditClientModal
          isOpen={true}
          onClose={() => setEditClientData(null)}
          client={editClientData}
          onUpdateClient={handleUpdateClient}
        />
      )}

      {/* Reminders & WhatsApp Modal */}
      <RemindersModal
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        unpaidClients={unpaidClients}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg border border-stone-700 animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
