require('dotenv').config();
const mongoose = require('mongoose');
const Client = require('./models/Client');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://hussainijaz2339_db_user:wzoiHsjpljYYV8TP@cluster0.bhtubh2.mongodb.net/bot_fee_management?retryWrites=true&w=majority';

const sampleClients = [
  {
    name: 'Abdal',
    email: 'abdalshah382@gmail.com',
    phone: '+92 300 1234567',
    monthlyFee: 50,
    referralRate: 2.5,
    assignedManager: 'Talha',
    firstPaymentDate: '2026-09-15',
    nextDueDate: '2026-11-15',
    hasFreeTrial: true,
    freeTrialDays: 7,
    notes: 'MT5 account #12345',
    payments: {
      '2026': {
        'September': {
          status: 'paid',
          paidDate: '2026-09-15',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'received',
          referralPaidDate: '2026-09-20',
          notes: 'Paid via USDT TRC20'
        },
        'October': {
          status: 'paid',
          paidDate: '2026-10-27',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'pending',
          notes: 'Paid via USDT'
        }
      }
    }
  },
  {
    name: 'Sarah Jenkins',
    email: 'sarah.j@fxalgo.io',
    phone: '+1 415 555 2671',
    monthlyFee: 50,
    referralRate: 2.5,
    assignedManager: 'Talha',
    firstPaymentDate: '2026-08-10',
    nextDueDate: '2026-11-10',
    hasFreeTrial: true,
    freeTrialDays: 7,
    notes: 'Gold Scalper EA - Exness MT5 #882910',
    payments: {
      '2026': {
        'August': {
          status: 'paid',
          paidDate: '2026-08-10',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'received',
          referralPaidDate: '2026-08-15',
          notes: 'Binance Pay'
        },
        'September': {
          status: 'paid',
          paidDate: '2026-09-10',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'received',
          referralPaidDate: '2026-09-12',
          notes: 'Wise Transfer'
        },
        'October': {
          status: 'paid',
          paidDate: '2026-10-10',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'received',
          referralPaidDate: '2026-10-14',
          notes: 'Auto-renew via USDT'
        }
      }
    }
  },
  {
    name: 'Michael Chang',
    email: 'm.chang@quanttrader.org',
    phone: '+65 9123 4567',
    monthlyFee: 50,
    referralRate: 2.5,
    assignedManager: 'Talha',
    firstPaymentDate: '2026-10-01',
    nextDueDate: '2026-11-01',
    hasFreeTrial: true,
    freeTrialDays: 7,
    notes: 'EURUSD Swing Bot - IC Markets #99412',
    payments: {
      '2026': {
        'October': {
          status: 'paid',
          paidDate: '2026-10-05',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'pending',
          notes: 'Bank Wire'
        }
      }
    }
  },
  {
    name: 'Dmitri Ivanov',
    email: 'dmitri.fx@yandex.com',
    phone: '+7 903 555 0192',
    monthlyFee: 50,
    referralRate: 2.5,
    assignedManager: 'Talha',
    firstPaymentDate: '2026-09-22',
    nextDueDate: '2026-10-22',
    hasFreeTrial: true,
    freeTrialDays: 7,
    notes: 'BTC Momentum Bot #44921',
    payments: {
      '2026': {
        'September': {
          status: 'paid',
          paidDate: '2026-09-22',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'received',
          referralPaidDate: '2026-09-25',
          notes: 'Crypto'
        },
        'October': {
          status: 'due',
          paidDate: null,
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'none',
          notes: 'Reminder sent on Oct 23'
        }
      }
    }
  },
  {
    name: 'Elena Rostova',
    email: 'elena.rostova@capital.ch',
    phone: '+41 79 123 4567',
    monthlyFee: 50,
    referralRate: 2.5,
    assignedManager: 'Talha',
    firstPaymentDate: '2026-07-14',
    nextDueDate: '2026-11-14',
    hasFreeTrial: false,
    freeTrialDays: 0,
    notes: 'High Frequency Grid Bot - FTMO Funded #10294',
    payments: {
      '2026': {
        'July': {
          status: 'paid',
          paidDate: '2026-07-14',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'received',
          referralPaidDate: '2026-07-20',
          notes: 'Credit Card'
        },
        'August': {
          status: 'paid',
          paidDate: '2026-08-14',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'received',
          referralPaidDate: '2026-08-18',
          notes: 'USDT'
        },
        'September': {
          status: 'paid',
          paidDate: '2026-09-14',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'received',
          referralPaidDate: '2026-09-18',
          notes: 'USDT'
        },
        'October': {
          status: 'paid',
          paidDate: '2026-10-14',
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'pending',
          notes: 'USDT'
        }
      }
    }
  },
  {
    name: 'Tariq Al-Mansoor',
    email: 'tariq.mansoor@gulfinvest.ae',
    phone: '+971 50 987 6543',
    monthlyFee: 50,
    referralRate: 2.5,
    assignedManager: 'Talha',
    firstPaymentDate: '2026-10-18',
    nextDueDate: '2026-10-25',
    hasFreeTrial: true,
    freeTrialDays: 7,
    notes: '7-Day Free Trial active until Oct 25. MT5 #552109',
    payments: {
      '2026': {
        'October': {
          status: 'due',
          paidDate: null,
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'none',
          notes: 'Trial ended, pending first $50 payment'
        }
      }
    }
  },
  {
    name: 'Lucas Silva',
    email: 'lucas.silva@tradebr.com',
    phone: '+55 11 98765 4321',
    monthlyFee: 50,
    referralRate: 2.5,
    assignedManager: 'Talha',
    firstPaymentDate: '2026-10-26',
    nextDueDate: '2026-11-26',
    hasFreeTrial: true,
    freeTrialDays: 7,
    notes: 'Newly joined client. MT5 #88123',
    payments: {
      '2026': {
        'October': {
          status: 'unset',
          paidDate: null,
          amount: 50,
          referralBonus: 2.5,
          referralStatus: 'none',
          notes: 'New account'
        }
      }
    }
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB Atlas for seeding...');

    const count = await Client.countDocuments();
    if (count > 0) {
      console.log(`Collection already has ${count} records. Clearing for fresh sample dataset...`);
      await Client.deleteMany({});
    }

    await Client.insertMany(sampleClients);
    console.log(`Successfully seeded ${sampleClients.length} client records into 'bot_records'!`);
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
