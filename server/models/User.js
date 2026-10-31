const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['borrower', 'owner', 'manager', 'admin'],
      default: 'borrower',
      required: true,
    },
    institution: {
      type: String,
      trim: true,
      default: 'Apex Institute of Technology & Science',
    },
    department: {
      type: String,
      trim: true,
      default: 'General',
    },
    studentOrEmployeeId: {
      type: String,
      trim: true,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: [
        'Not Submitted',
        'Pending Review',
        'Verified',
        'Rejected',
        'Additional Information Required',
      ],
      default: 'Not Submitted',
    },
    verificationDoc: {
      type: String,
      default: '',
    },
    verificationType: {
      type: String,
      default: 'Student ID',
    },
    qualifications: [
      {
        title: String,
        issuer: String,
        verified: { type: Boolean, default: false },
      },
    ],
    fairUsageScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    totalHoursUsed: {
      type: Number,
      default: 0,
    },
    completedBookingsCount: {
      type: Number,
      default: 0,
    },
    activeBookingsCount: {
      type: Number,
      default: 0,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
