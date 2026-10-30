const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    institution: {
      type: String,
      required: true,
      default: 'Apex Institute of Technology & Science',
    },
    verificationType: {
      type: String,
      enum: [
        'Student ID',
        'Employee ID',
        'Institutional Email',
        'Training Certificate',
        'Lab Safety Qualification',
        'Research Clearance',
      ],
      required: true,
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      default: '',
    },
    documentUrl: {
      type: String,
      required: true,
    },
    submittedNotes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: [
        'Pending Review',
        'Verified',
        'Rejected',
        'Additional Information Required',
      ],
      default: 'Pending Review',
    },
    reviewerNotes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
  },
  { timestamps: true }
);

verificationSchema.index({ user: 1, status: 1 });
verificationSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Verification', verificationSchema);
