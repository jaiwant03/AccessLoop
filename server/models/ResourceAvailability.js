const mongoose = require('mongoose');

const resourceAvailabilitySchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    dayOfWeek: {
      type: Number, // 0 = Sunday, 1 = Monday, etc.
      min: 0,
      max: 6,
    },
    startTime: {
      type: String,
      default: '08:00',
    },
    endTime: {
      type: String,
      default: '18:00',
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    blockReason: {
      type: String,
      default: '',
    },
    specificDate: {
      type: Date, // For ad-hoc maintenance windows or blackout dates
    },
  },
  { timestamps: true }
);

resourceAvailabilitySchema.index({ resource: 1, specificDate: 1 });

module.exports = mongoose.model(
  'ResourceAvailability',
  resourceAvailabilitySchema
);
