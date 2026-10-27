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
import PaymentModal from './components/PaymentModal';
import AddClientModal from './components/AddClientModal';
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

  // Filters & Date selectors
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedMonth, setSelectedMonth] = useState('October');
  const [currentFilter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [allClients, setAllClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [paymentModalData, setPaymentModalData] = useState(null); // { client, year, month }
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
      const [statsRes, recordsRes] = await Promise.all([
        api.getStats(selectedYear, selectedMonth),
        api.getRecords(selectedYear, selectedMonth, searchQuery, 'all'),
      ]);
      setStats(statsRes);
      setAllClients(recordsRes.clients || []);
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

  // Compute filter counts
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

  // Filter clients based on tab
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

  // Unpaid clients for Reminders Modal
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
      showToast(`Marked ${selectedIds.length} clients as Paid for ${selectedMonth}!`);
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
      showToast(`Released bonuses ($2.50) for selected clients!`);
      setSelectedIds([]);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Bulk bonus release failed');
    }
  };

  // Client CRUD
  const handleAddClient = async (clientData) => {
    try {
      await api.createRecord(clientData);
      showToast(`Registered new client: ${clientData.name}`);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to register client');
    }
  };

  const handleUpdateClient = async (id, clientData) => {
    try {
      await api.updateRecord(id, clientData);
      showToast('Client profile updated');
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update client');
    }
  };

  const handleDeleteClient = async (client) => {
    if (!window.confirm(`Are you sure you want to remove ${client.name}?`)) return;
    try {
      await api.deleteRecord(client._id);
      showToast(`Client ${client.name} removed`);
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
        onOpenAddModal={() => setIsAddModalOpen(true)}
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

        {/* Filters & Instant Search */}
        <FilterTabs
          currentFilter={currentFilter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          counts={counts}
        />

        {/* 12-Month Interactive Table */}
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
          onDeleteClient={handleDeleteClient}
        />
      </main>

      {/* Floating Batch Actions Bar */}
      <BatchBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkPayFee={handleBulkPayFee}
        onBulkReleaseBonus={handleBulkReleaseBonus}
        month={selectedMonth}
        year={selectedYear}
      />

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

      {/* Add Client Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddClient={handleAddClient}
      />

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
