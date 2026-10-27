const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const Client = require('../models/Client');
const { requireAuth } = require('../middleware/auth');

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper: Calculate next due date
function calculateNextDueDate(firstPaymentDate, hasFreeTrial = false, freeTrialDays = 7) {
  if (!firstPaymentDate) return '';
  const date = new Date(firstPaymentDate);
  if (isNaN(date.getTime())) return '';
  
  if (hasFreeTrial) {
    // 7 day free trial, then 1st payment due
    const trialEnd = new Date(date);
    trialEnd.setDate(trialEnd.getDate() + (freeTrialDays || 7));
    return trialEnd.toISOString().split('T')[0];
  } else {
    // Standard 30 days
    const nextDue = new Date(date);
    nextDue.setDate(nextDue.getDate() + 30);
    return nextDue.toISOString().split('T')[0];
  }
}

// All bot endpoints secured with requireAuth
router.use(requireAuth);

// -------------------------------------------------------------
// GET /api/bot/stats - Real-time statistics & all-time metrics
// -------------------------------------------------------------
router.get('/stats', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear().toString();
    const month = req.query.month || MONTHS[new Date().getMonth()];

    const clients = await Client.find();
    const totalClients = clients.length;

    let currentMonthPaid = 0;
    let currentMonthDue = 0;
    let currentMonthUnset = 0;
    let currentMonthCollected = 0;
    let currentMonthBonusReceived = 0;
    let currentMonthBonusPending = 0;
    let currentMonthBonusReceivedAmount = 0;
    let currentMonthBonusPendingAmount = 0;

    let allTimePaidCount = 0;
    let allTimeReferralDisbursed = 0;
    let allTimeReferralPending = 0;

    clients.forEach(client => {
      // Current Month calculations
      const yearPayments = client.payments?.[year] || {};
      const monthData = yearPayments[month];
      const status = monthData?.status || 'unset';
      const referralStatus = monthData?.referralStatus || 'none';
      const bonusRate = monthData?.referralBonus || client.referralRate || 2.5;

      if (status === 'paid') {
        currentMonthPaid++;
        currentMonthCollected += (monthData.amount || client.monthlyFee || 50);

        if (referralStatus === 'received') {
          currentMonthBonusReceived++;
          currentMonthBonusReceivedAmount += bonusRate;
        } else if (referralStatus === 'pending') {
          currentMonthBonusPending++;
          currentMonthBonusPendingAmount += bonusRate;
        }
      } else if (status === 'due') {
        currentMonthDue++;
      } else {
        currentMonthUnset++;
      }

      // All-Time metrics calculation across all years and months
      if (client.payments) {
        Object.keys(client.payments).forEach(y => {
          const mObj = client.payments[y];
          if (mObj && typeof mObj === 'object') {
            Object.keys(mObj).forEach(m => {
              const payment = mObj[m];
              if (payment && payment.status === 'paid') {
                allTimePaidCount++;
                const bonusRate = payment.referralBonus || client.referralRate || 2.5;
                if (payment.referralStatus === 'received') {
                  allTimeReferralDisbursed += bonusRate;
                } else if (payment.referralStatus === 'pending') {
                  allTimeReferralPending += bonusRate;
                }
              }
            });
          }
        });
      }
    });

    const paidPercentage = totalClients > 0 ? Math.round((currentMonthPaid / totalClients) * 100) : 0;
    const allTimeEarned = allTimePaidCount * 2.50;

    res.json({
      year,
      month,
      totalClients,
      currentMonth: {
        paidCount: currentMonthPaid,
        dueCount: currentMonthDue,
        unsetCount: currentMonthUnset,
        collectedAmount: currentMonthCollected,
        percentage: paidPercentage,
        bonusReceivedCount: currentMonthBonusReceived,
        bonusReceivedAmount: currentMonthBonusReceivedAmount,
        bonusPendingCount: currentMonthBonusPending,
        bonusPendingAmount: currentMonthBonusPendingAmount
      },
      monthlyPaidOut: {
        bonusReceivedCount: currentMonthBonusReceived,
        bonusReceivedAmount: currentMonthBonusReceivedAmount,
        bonusPendingCount: currentMonthBonusPending,
        bonusPendingAmount: currentMonthBonusPendingAmount
      },
      allTimeReferralBonus: {
        totalPaidClientsCount: allTimePaidCount,
        rate: 2.5,
        totalEarned: allTimeEarned
      },
      allTimeReferralPayout: {
        disbursed: allTimeReferralDisbursed,
        pending: allTimeReferralPending
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to retrieve stats', error: error.message });
  }
});

// -------------------------------------------------------------
// GET /api/bot/records - Retrieve clients with filtering & search
// -------------------------------------------------------------
router.get('/records', async (req, res) => {
  try {
    const { year = new Date().getFullYear().toString(), month = MONTHS[new Date().getMonth()], search, filter } = req.query;

    let query = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { notes: regex },
        { assignedManager: regex }
      ];
    }

    let clients = await Client.find(query).sort({ createdAt: -1 });

    // Client-side/query filtering by selected month payment or bonus status
    if (filter && filter !== 'all') {
      clients = clients.filter(client => {
        const monthData = client.payments?.[year]?.[month] || { status: 'unset', referralStatus: 'none' };
        
        switch (filter) {
          case 'paid':
            return monthData.status === 'paid';
          case 'due':
          case 'need_to_pay':
            return monthData.status === 'due';
          case 'unset':
            return !monthData.status || monthData.status === 'unset';
          case 'bonus_pending':
            return monthData.status === 'paid' && monthData.referralStatus === 'pending';
          case 'bonus_received':
            return monthData.status === 'paid' && monthData.referralStatus === 'received';
          default:
            return true;
        }
      });
    }

    res.json({
      year,
      month,
      count: clients.length,
      clients
    });
  } catch (error) {
    console.error('Fetch records error:', error);
    res.status(500).json({ message: 'Failed to fetch records', error: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/bot/records - Create a new bot client
// -------------------------------------------------------------
router.post('/records', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      monthlyFee = 50,
      referralRate = 2.5,
      assignedManager = 'Talha',
      firstPaymentDate,
      hasFreeTrial = true,
      freeTrialDays = 7,
      nextDueDate,
      notes
    } = req.body;

    if (!name || !email || !firstPaymentDate) {
      return res.status(400).json({ message: 'Name, email, and first payment / join date are required.' });
    }

    // Auto-calculate next due date if not provided
    const calculatedNextDue = nextDueDate || calculateNextDueDate(firstPaymentDate, hasFreeTrial, freeTrialDays);

    const client = new Client({
      name,
      email,
      phone: phone || '',
      monthlyFee: Number(monthlyFee) || 50,
      referralRate: Number(referralRate) || 2.5,
      assignedManager: assignedManager || 'Talha',
      firstPaymentDate,
      hasFreeTrial: Boolean(hasFreeTrial),
      freeTrialDays: Number(freeTrialDays) || 7,
      nextDueDate: calculatedNextDue,
      notes: notes || '',
      payments: {}
    });

    await client.save();
    res.status(201).json({ message: 'Client registered successfully', client });
  } catch (error) {
    console.error('Create client error:', error);
    res.status(500).json({ message: 'Failed to create client', error: error.message });
  }
});

// -------------------------------------------------------------
// PUT /api/bot/records/:id - Update client profile
// -------------------------------------------------------------
router.put('/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      monthlyFee,
      referralRate,
      assignedManager,
      firstPaymentDate,
      nextDueDate,
      hasFreeTrial,
      freeTrialDays,
      notes
    } = req.body;

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    if (name) client.name = name;
    if (email) client.email = email;
    if (phone !== undefined) client.phone = phone;
    if (monthlyFee !== undefined) client.monthlyFee = Number(monthlyFee);
    if (referralRate !== undefined) client.referralRate = Number(referralRate);
    if (assignedManager !== undefined) client.assignedManager = assignedManager;
    if (firstPaymentDate) client.firstPaymentDate = firstPaymentDate;
    if (nextDueDate !== undefined) client.nextDueDate = nextDueDate;
    if (hasFreeTrial !== undefined) client.hasFreeTrial = Boolean(hasFreeTrial);
    if (freeTrialDays !== undefined) client.freeTrialDays = Number(freeTrialDays);
    if (notes !== undefined) client.notes = notes;

    await client.save();
    res.json({ message: 'Client updated successfully', client });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({ message: 'Failed to update client', error: error.message });
  }
});

// -------------------------------------------------------------
// DELETE /api/bot/records/:id - Delete a client
// -------------------------------------------------------------
router.delete('/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }
    res.json({ message: 'Client deleted successfully', id });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({ message: 'Failed to delete client', error: error.message });
  }
});

// -------------------------------------------------------------
// PUT /api/bot/records/:id/payment - Update month payment
// -------------------------------------------------------------
router.put('/records/:id/payment', async (req, res) => {
  try {
    const { id } = req.params;
    const { year, month, status, paidDate, amount, notes, nextDueDate } = req.body;

    if (!year || !month || !status) {
      return res.status(400).json({ message: 'Year, month, and status are required.' });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    if (!client.payments) client.payments = {};
    if (!client.payments[year]) client.payments[year] = {};
    
    const existingPayment = client.payments[year][month] || {};

    let newReferralStatus = existingPayment.referralStatus || 'none';

    // Separation principle & rule:
    // When marked PAID ($50): Referral Bonus is automatically initialized to UNPAID (referralStatus: "pending")
    if (status === 'paid') {
      if (newReferralStatus !== 'received') {
        newReferralStatus = 'pending';
      }
    } else {
      newReferralStatus = 'none';
    }

    client.payments[year][month] = {
      status,
      paidDate: status === 'paid' ? (paidDate || new Date().toISOString().split('T')[0]) : null,
      amount: Number(amount) || client.monthlyFee || 50,
      referralBonus: client.referralRate || 2.5,
      referralStatus: newReferralStatus,
      referralPaidDate: newReferralStatus === 'received' ? existingPayment.referralPaidDate : null,
      notes: notes !== undefined ? notes : (existingPayment.notes || '')
    };

    // If nextDueDate is passed or if paid, update next renewal date (+30 days)
    if (nextDueDate) {
      client.nextDueDate = nextDueDate;
    } else if (status === 'paid') {
      const pDate = paidDate ? new Date(paidDate) : new Date();
      const nextDate = new Date(pDate);
      nextDate.setDate(nextDate.getDate() + 30);
      client.nextDueDate = nextDate.toISOString().split('T')[0];
    }

    client.markModified('payments');
    await client.save();

    res.json({
      message: `Payment status for ${month} ${year} updated to ${status}.`,
      client
    });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ message: 'Failed to update payment status', error: error.message });
  }
});

// -------------------------------------------------------------
// PUT /api/bot/records/:id/referral-status - 1-click toggle referral
// -------------------------------------------------------------
router.put('/records/:id/referral-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { year, month, referralStatus } = req.body;

    if (!year || !month || !referralStatus) {
      return res.status(400).json({ message: 'Year, month, and referralStatus are required.' });
    }

    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found.' });
    }

    if (!client.payments?.[year]?.[month]) {
      return res.status(400).json({ message: 'Cannot set referral status for an unpaid or uninitialized month.' });
    }

    const payment = client.payments[year][month];
    payment.referralStatus = referralStatus;
    if (referralStatus === 'received') {
      payment.referralPaidDate = new Date().toISOString().split('T')[0];
    } else {
      payment.referralPaidDate = null;
    }

    client.markModified('payments');
    await client.save();

    res.json({
      message: `Referral bonus status updated to ${referralStatus}.`,
      client
    });
  } catch (error) {
    console.error('Toggle referral error:', error);
    res.status(500).json({ message: 'Failed to toggle referral status', error: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/bot/records/batch-payment - Bulk update payments
// -------------------------------------------------------------
router.post('/records/batch-payment', async (req, res) => {
  try {
    const { clientIds, year, month, status, paidDate, amount, notes } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0 || !year || !month || !status) {
      return res.status(400).json({ message: 'clientIds array, year, month, and status are required.' });
    }

    const clients = await Client.find({ _id: { $in: clientIds } });
    const today = new Date().toISOString().split('T')[0];

    for (const client of clients) {
      if (!client.payments) client.payments = {};
      if (!client.payments[year]) client.payments[year] = {};

      const existing = client.payments[year][month] || {};
      let refStatus = existing.referralStatus || 'none';
      if (status === 'paid' && refStatus !== 'received') {
        refStatus = 'pending';
      } else if (status !== 'paid') {
        refStatus = 'none';
      }

      client.payments[year][month] = {
        status,
        paidDate: status === 'paid' ? (paidDate || today) : null,
        amount: Number(amount) || client.monthlyFee || 50,
        referralBonus: client.referralRate || 2.5,
        referralStatus: refStatus,
        referralPaidDate: refStatus === 'received' ? existing.referralPaidDate : null,
        notes: notes !== undefined ? notes : (existing.notes || '')
      };

      if (status === 'paid') {
        const pDate = paidDate ? new Date(paidDate) : new Date();
        const nextDate = new Date(pDate);
        nextDate.setDate(nextDate.getDate() + 30);
        client.nextDueDate = nextDate.toISOString().split('T')[0];
      }

      client.markModified('payments');
      await client.save();
    }

    res.json({
      message: `Successfully updated ${clients.length} clients to ${status} for ${month} ${year}.`
    });
  } catch (error) {
    console.error('Batch payment error:', error);
    res.status(500).json({ message: 'Failed to execute batch payment', error: error.message });
  }
});

// -------------------------------------------------------------
// POST /api/bot/records/batch-referral-status - Bulk referral payout
// -------------------------------------------------------------
router.post('/records/batch-referral-status', async (req, res) => {
  try {
    const { clientIds, year, month, referralStatus } = req.body;

    if (!Array.isArray(clientIds) || clientIds.length === 0 || !year || !month || !referralStatus) {
      return res.status(400).json({ message: 'clientIds, year, month, and referralStatus are required.' });
    }

    const clients = await Client.find({ _id: { $in: clientIds } });
    const today = new Date().toISOString().split('T')[0];
    let updatedCount = 0;

    for (const client of clients) {
      if (client.payments?.[year]?.[month] && client.payments[year][month].status === 'paid') {
        client.payments[year][month].referralStatus = referralStatus;
        client.payments[year][month].referralPaidDate = referralStatus === 'received' ? today : null;
        client.markModified('payments');
        await client.save();
        updatedCount++;
      }
    }

    res.json({
      message: `Successfully updated referral status to ${referralStatus} for ${updatedCount} clients.`
    });
  } catch (error) {
    console.error('Batch referral error:', error);
    res.status(500).json({ message: 'Failed to execute batch referral payout', error: error.message });
  }
});

// -------------------------------------------------------------
// GET /api/bot/export-excel - Excel spreadsheet export
// -------------------------------------------------------------
router.get('/export-excel', async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear().toString();
    const clients = await Client.find().sort({ name: 1 });

    const rows = [];

    clients.forEach((client, index) => {
      const row = {
        '#': index + 1,
        'Client Name': client.name,
        'Email Address': client.email,
        'Phone / WhatsApp': client.phone || 'N/A',
        'Monthly Fee ($)': `$${client.monthlyFee || 50}`,
        'Referral Rate ($)': `$${client.referralRate || 2.5}`,
        'Manager': client.assignedManager || 'Talha',
        'Join / 1st Payment Date': client.firstPaymentDate || 'N/A',
        'Next Renewal Due': client.nextDueDate || 'N/A',
        'Account Notes': client.notes || ''
      };

      // Add each month
      MONTHS.forEach(m => {
        const p = client.payments?.[year]?.[m];
        const status = p?.status ? p.status.toUpperCase() : 'UNSET';
        const bonusStatus = p?.status === 'paid'
          ? (p.referralStatus === 'received' ? 'BONUS PAID ($2.50)' : 'BONUS PENDING')
          : 'FEE UNPAID';
        
        row[`${m.slice(0, 3)} Fee`] = status;
        row[`${m.slice(0, 3)} Referral`] = bonusStatus;
      });

      rows.push(row);
    });

    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `Bot Records ${year}`);

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename="Bot_Fee_Records_${year}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (error) {
    console.error('Excel export error:', error);
    res.status(500).json({ message: 'Failed to export Excel file', error: error.message });
  }
});

module.exports = router;
