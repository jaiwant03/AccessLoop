const mongoose = require('mongoose');

const waitingListSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requestedStartTime: {
      type: Date,
      required: true,
    },
    requestedEndTime: {
      type: Date,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
    },
    queuePosition: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Waiting', 'Notified', 'Converted', 'Expired', 'Cancelled'],
      default: 'Waiting',
    },
    notifiedAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

waitingListSchema.index({ resource: 1, queuePosition: 1, status: 1 });
waitingListSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('WaitingList', waitingListSchema);
