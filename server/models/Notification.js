const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'booking_request',
        'booking_approved',
        'booking_rejected',
        'booking_cancelled',
        'waiting_list_update',
        'check_in_reminder',
        'return_reminder',
        'return_pending',
        'return_confirmed',
        'overdue_alert',
        'incident_reported',
        'incident_resolved',
        'verification_update',
        'system',
      ],
      default: 'system',
    },
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    relatedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
    },
    relatedIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
