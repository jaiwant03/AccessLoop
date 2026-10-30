const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    incidentNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'physical_damage',
        'missing_components',
        'late_return',
        'equipment_malfunction',
        'safety_incident',
        'misuse',
        'scheduling_conflict',
        'other',
      ],
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed incident description'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    evidenceImages: {
      type: [String],
      default: [],
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Reported', 'Under Review', 'Action Required', 'Resolved', 'Closed'],
      default: 'Reported',
    },
    managerNotes: {
      type: String,
      default: '',
    },
    resolutionDetails: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: Date,
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        authorName: String,
        authorRole: String,
        message: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

incidentSchema.index({ resource: 1, status: 1 });
incidentSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Incident', incidentSchema);
