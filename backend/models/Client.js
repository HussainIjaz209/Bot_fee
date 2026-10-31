const mongoose = require('mongoose');

const PaymentMonthSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['paid', 'due', 'unset'],
    default: 'unset'
  },
  paidDate: {
    type: String,
    default: null
  },
  amount: {
    type: Number,
    default: 50
  },
  referralBonus: {
    type: Number,
    default: 2.5
  },
  referralStatus: {
    type: String,
    enum: ['none', 'pending', 'received'],
    default: 'none'
  },
  referralPaidDate: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, { _id: false });

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  monthlyFee: {
    type: Number,
    default: 50
  },
  referralRate: {
    type: Number,
    default: 2.5
  },
  assignedManager: {
    type: String,
    default: 'Talha'
  },
  firstPaymentDate: {
    type: String,
    required: true
  },
  hasFreeTrial: {
    type: Boolean,
    default: true
  },
  freeTrialDays: {
    type: Number,
    default: 7
  },
  nextDueDate: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'deactivated'],
    default: 'active'
  },
  // payments structure: { "2026": { "January": PaymentMonthSchema, ... } }
  // We use Schema.Types.Mixed or Map for dynamic nested months
  payments: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true,
  collection: 'bot_records'
});

// Helper function to auto-calculate next renewal/due date from first payment or latest paid
ClientSchema.methods.calculateNextDueDate = function () {
  if (this.nextDueDate) return this.nextDueDate;
  if (!this.firstPaymentDate) return '';
  
  const baseDate = new Date(this.firstPaymentDate);
  if (isNaN(baseDate.getTime())) return '';

  // If free trial applies and no payments made yet, first payment is on 7th day
  // Otherwise standard rolling 30 days
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + 30);
  return nextDate.toISOString().split('T')[0];
};

module.exports = mongoose.model('Client', ClientSchema);
