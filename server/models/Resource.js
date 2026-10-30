const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide resource name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please specify resource category'],
      enum: [
        'Laboratories',
        'Classrooms',
        'Meeting Rooms',
        'Makerspaces',
        'Workshops',
        'Computers',
        'Laptops',
        'Cameras',
        'Projectors',
        '3D Printers',
        'Fabrication Tools',
        'Testing Devices',
        'Scientific Instruments',
        'Electronic Components',
        'Audio Equipment',
        'Specialised Technical Resources',
      ],
    },
    resourceType: {
      type: String,
      enum: ['space', 'equipment'],
      required: true,
      default: 'equipment',
    },
    description: {
      type: String,
      required: [true, 'Please provide detailed description'],
    },
    images: {
      type: [String],
      default: [],
    },
    institution: {
      type: String,
      required: [true, 'Institution is required'],
      default: 'Apex Institute of Technology & Science',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    availableQuantity: {
      type: Number,
      default: 1,
      min: 0,
    },
    operatingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '18:00' },
      days: {
        type: [String],
        default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      },
    },
    minBookingDurationHours: {
      type: Number,
      default: 1,
      min: 0.5,
    },
    maxBookingDurationHours: {
      type: Number,
      default: 8,
    },
    eligibilityRequirements: {
      requiresVerifiedUser: { type: Boolean, default: true },
      minFairUsageScore: { type: Number, default: 50 },
      requiresTraining: { type: Boolean, default: false },
      trainingCourseName: { type: String, default: '' },
      requiredQualifications: { type: [String], default: [] },
      requiredDocuments: { type: [String], default: [] },
      requiresSupervision: { type: Boolean, default: false },
      supervisorName: { type: String, default: '' },
    },
    safetyInstructions: {
      type: String,
      default: 'Handle with care. Follow standard laboratory/studio protocols.',
    },
    usageGuidelines: {
      type: String,
      default: 'Return in clean, original condition with all accessories intact.',
    },
    securityDeposit: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    hourlyFee: {
      type: Number,
      default: 0,
    },
    cancellationPolicy: {
      type: String,
      default: 'Free cancellation up to 2 hours before scheduled slot.',
    },
    condition: {
      type: String,
      enum: ['Excellent', 'Good', 'Fair'],
      default: 'Excellent',
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    totalBookingsCount: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      default: 4.9,
    },
  },
  { timestamps: true }
);

// Compound index for fast discovery filtering
resourceSchema.index({ category: 1, institution: 1, isActive: 1 });
resourceSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Resource', resourceSchema);
