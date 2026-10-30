const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    institution: {
      type: String,
      default: 'Apex Institute of Technology & Science',
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    durationHours: {
      type: Number,
      required: true,
    },
    purpose: {
      type: String,
      required: [true, 'Purpose of use is required'],
      minlength: [5, 'Please provide sufficient purpose details'],
    },
    status: {
      type: String,
      enum: [
        'Pending',
        'Approved',
        'Rejected',
        'Waitlisted',
        'Cancelled',
        'Active',
        'Return Pending',
        'Completed',
        'Overdue',
      ],
      default: 'Pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // Check-in and Handover Documentation
    checkIn: {
      checkedInAt: Date,
      borrowerNotes: { type: String, default: '' },
      initialPhotos: { type: [String], default: [] },
      verifiedByOwner: { type: Boolean, default: false },
      handoverTime: Date,
      ownerNotes: { type: String, default: '' },
    },
    // Check-out and Return Verification Documentation
    checkOut: {
      returnRequestedAt: Date,
      borrowerNotes: { type: String, default: '' },
      returnPhotos: { type: [String], default: [] },
      inspectedByOwner: { type: Boolean, default: false },
      inspectedAt: Date,
      ownerInspectionNotes: { type: String, default: '' },
      damageDetected: { type: Boolean, default: false },
      conditionStatus: {
        type: String,
        enum: ['Intact & Clean', 'Minor Wear', 'Damage Reported', 'Pending Inspection'],
        default: 'Pending Inspection',
      },
    },
    extensionRequests: [
      {
        requestedEndTime: Date,
        reason: String,
        status: {
          type: String,
          enum: ['Pending', 'Approved', 'Rejected'],
          default: 'Pending',
        },
        requestedAt: { type: Date, default: Date.now },
        reviewedAt: Date,
      },
    ],
    fairAllocationScoreAtBooking: {
      type: Number,
      default: 100,
    },
    eligibilitySnapshot: {
      userRole: String,
      isVerified: Boolean,
      submittedQualifications: [String],
    },
  },
  { timestamps: true }
);

// Indexes for conflict prevention and rapid filtering
bookingSchema.index({ resource: 1, startTime: 1, endTime: 1, status: 1 });
bookingSchema.index({ borrower: 1, status: 1 });
bookingSchema.index({ owner: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
