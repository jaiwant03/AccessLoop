const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    actionType: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      required: true,
    },
    userEmail: String,
    relatedResource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
    },
    resourceName: String,
    relatedBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    bookingNumber: String,
    relatedIncident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
    },
    explanation: {
      type: String,
      required: true,
    },
    statusChange: {
      from: String,
      to: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable logs
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actionType: 1, createdAt: -1 });
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ relatedResource: 1 });
auditLogSchema.index({ relatedBooking: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
