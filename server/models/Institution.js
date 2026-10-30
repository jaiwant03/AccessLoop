const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide institution name'],
      trim: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    address: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      required: true,
    },
    phone: String,
    website: String,
    allowedEmailDomains: [String],
    active: {
      type: Boolean,
      default: true,
    },
    totalResources: {
      type: Number,
      default: 0,
    },
    totalUsers: {
      type: Number,
      default: 0,
    },
    policies: {
      maxSimultaneousBookingsPerBorrower: { type: Number, default: 3 },
      maxAdvanceBookingDays: { type: Number, default: 14 },
      requireSupervisionDefault: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Institution', institutionSchema);
