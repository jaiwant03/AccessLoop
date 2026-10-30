const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const { logAuditEvent } = require('../middleware/auditLogger');
const {
  evaluateFairAllocationRules,
  promoteWaitingList,
} = require('../services/fairAllocationService');
const {
  sendRealtimeNotification,
  sendBookingUpdate,
} = require('../services/socketService');

// @desc    Create a new booking request
// @route   POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const { resourceId, startTime, endTime, purpose } = req.body;

    if (!resourceId || !startTime || !endTime || !purpose) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resource, start time, end time, and purpose of use.',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'Scheduled end time must be after start time.',
      });
    }

    if (start < new Date(Date.now() - 5 * 60 * 1000)) {
      return res.status(400).json({
        success: false,
        message: 'Booking start time cannot be in the past.',
      });
    }

    const resource = await Resource.findById(resourceId).populate('owner');
    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Requested resource is not available or inactive.',
      });
    }

    // Prevent booking one's own resource
    if (resource.owner._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a borrowing request for your own resource.',
      });
    }

    const durationHours = (end - start) / (1000 * 60 * 60);

    // Validate min/max duration
    if (durationHours < resource.minBookingDurationHours) {
      return res.status(400).json({
        success: false,
        message: `Minimum reservation duration for this resource is ${resource.minBookingDurationHours} hour(s).`,
      });
    }
    if (durationHours > resource.maxBookingDurationHours) {
      return res.status(400).json({
        success: false,
        message: `Maximum reservation duration for this resource is ${resource.maxBookingDurationHours} hour(s).`,
      });
    }

    // 1. Eligibility Check: Verified Account
    if (
      resource.eligibilityRequirements?.requiresVerifiedUser &&
      req.user.verificationStatus !== 'Verified'
    ) {
      return res.status(403).json({
        success: false,
        missingRequirement: 'User Identity Verification',
        message: `Eligibility Requirement: This resource requires a verified institutional account. Your verification status is '${req.user.verificationStatus}'. Please submit your student/employee ID in Profile Settings.`,
      });
    }

    // 2. Eligibility Check: Fair Usage Score
    const minScore = resource.eligibilityRequirements?.minFairUsageScore || 50;
    if (req.user.fairUsageScore < minScore) {
      return res.status(403).json({
        success: false,
        missingRequirement: 'Fair Usage Score Threshold',
        message: `Eligibility Requirement: This resource requires a minimum Fair Usage Score of ${minScore}. Your current score is ${req.user.fairUsageScore}.`,
      });
    }

    // 3. Fair Allocation & Concurrency Evaluation
    const fairCheck = await evaluateFairAllocationRules({
      borrowerId: req.user._id,
      resourceId: resource._id,
      startTime: start,
      endTime: end,
      durationHours,
    });

    if (!fairCheck.allowed) {
      return res.status(400).json({
        success: false,
        fairAllocationBlocked: true,
        message: fairCheck.reason,
      });
    }

    // 4. Overlap & Conflict Check (Atomic prevention)
    const conflictingBookings = await Booking.find({
      resource: resource._id,
      status: { $in: ['Approved', 'Active', 'Return Pending'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });

    if (conflictingBookings.length >= resource.quantity) {
      return res.status(409).json({
        success: false,
        conflict: true,
        message:
          'This time slot is already reserved by another borrower. You can join the Waiting List to be automatically notified if this slot becomes available.',
      });
    }

    // Generate unique booking number
    const bookingNumber = `AL-BK-${Date.now().toString().slice(-6)}`;

    const booking = await Booking.create({
      bookingNumber,
      resource: resource._id,
      borrower: req.user._id,
      owner: resource.owner._id,
      institution: resource.institution,
      startTime: start,
      endTime: end,
      durationHours,
      purpose,
      status: 'Pending',
      fairAllocationScoreAtBooking: fairCheck.score,
      eligibilitySnapshot: {
        userRole: req.user.role,
        isVerified: req.user.verificationStatus === 'Verified',
      },
    });

    // Notify resource owner
    const notif = await Notification.create({
      user: resource.owner._id,
      title: 'New Booking Request Received',
      message: `${req.user.name} submitted a request to reserve '${resource.name}' (${durationHours}h).`,
      type: 'booking_request',
      relatedBooking: booking._id,
      relatedResource: resource._id,
      link: `/bookings/${booking._id}`,
    });

    sendRealtimeNotification(resource.owner._id, notif);

    // Audit log
    await logAuditEvent({
      req,
      actionType: 'booking_submitted',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: resource._id,
      resourceName: resource.name,
      relatedBooking: booking._id,
      bookingNumber: booking.bookingNumber,
      explanation: `Booking request ${booking.bookingNumber} submitted for ${resource.name} (${durationHours} hours).`,
    });

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully! Awaiting owner review.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for user (or owner / manager / admin)
// @route   GET /api/bookings
const getUserBookings = async (req, res, next) => {
  try {
    const { status, roleFilter, page = 1, limit = 20 } = req.query;

    let query = {};

    if (req.user.role === 'admin' || req.user.role === 'manager') {
      if (roleFilter === 'owner') query.owner = req.user._id;
      else if (roleFilter === 'borrower') query.borrower = req.user._id;
      // otherwise all bookings in institution/platform
      if (req.user.role === 'manager') {
        query.institution = req.user.institution;
      }
    } else if (req.user.role === 'owner') {
      if (roleFilter === 'borrower') {
        query.borrower = req.user._id;
      } else {
        query.$or = [{ owner: req.user._id }, { borrower: req.user._id }];
      }
    } else {
      // Borrower
      query.borrower = req.user._id;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .populate('resource', 'name category location images securityDeposit isPaid hourlyFee')
      .populate('borrower', 'name email phone avatar verificationStatus department studentOrEmployeeId fairUsageScore')
      .populate('owner', 'name email phone avatar institution department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('resource')
      .populate('borrower', 'name email phone avatar verificationStatus department studentOrEmployeeId fairUsageScore')
      .populate('owner', 'name email phone avatar institution department');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Role-based visibility check
    const isOwner = booking.owner._id.toString() === req.user._id.toString();
    const isBorrower = booking.borrower._id.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager'].includes(req.user.role);

    if (!isOwner && !isBorrower && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this booking.',
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner reviews booking (Approve / Reject)
// @route   PUT /api/bookings/:id/review
const reviewBooking = async (req, res, next) => {
  try {
    const { action, rejectionReason } = req.body; // action: 'approve' | 'reject'
    const booking = await Booking.findById(req.params.id).populate('resource');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager'].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Only the resource owner or institutional manager can approve/reject this booking.',
      });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot review booking currently in '${booking.status}' status.`,
      });
    }

    if (action === 'approve') {
      // Re-verify no conflicts in the interim
      const conflict = await Booking.findOne({
        resource: booking.resource._id,
        _id: { $ne: booking._id },
        status: { $in: ['Approved', 'Active', 'Return Pending'] },
        $or: [
          { startTime: { $lt: booking.endTime }, endTime: { $gt: booking.startTime } },
        ],
      });

      if (conflict) {
        return res.status(409).json({
          success: false,
          message:
            'A conflicting booking was approved earlier. Cannot approve overlapping reservation.',
        });
      }

      booking.status = 'Approved';
      await booking.save();

      // Notify borrower
      const notif = await Notification.create({
        user: booking.borrower,
        title: 'Booking Approved!',
        message: `Your booking for '${booking.resource.name}' was approved! You can check in when collecting the equipment.`,
        type: 'booking_approved',
        relatedBooking: booking._id,
        relatedResource: booking.resource._id,
        link: `/bookings/${booking._id}`,
      });

      sendRealtimeNotification(booking.borrower, notif);
      sendBookingUpdate(booking.borrower, booking);

      await logAuditEvent({
        req,
        actionType: 'booking_approved',
        performedBy: req.user._id,
        userRole: req.user.role,
        userName: req.user.name,
        userEmail: req.user.email,
        relatedResource: booking.resource._id,
        resourceName: booking.resource.name,
        relatedBooking: booking._id,
        bookingNumber: booking.bookingNumber,
        explanation: `Booking request ${booking.bookingNumber} approved by ${req.user.name}.`,
        statusChange: { from: 'Pending', to: 'Approved' },
      });

      return res.status(200).json({
        success: true,
        message: 'Booking successfully approved!',
        booking,
      });
    } else if (action === 'reject') {
      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a clear reason for rejecting the booking request.',
        });
      }

      booking.status = 'Rejected';
      booking.rejectionReason = rejectionReason;
      await booking.save();

      // Notify borrower
      const notif = await Notification.create({
        user: booking.borrower,
        title: 'Booking Request Update',
        message: `Your request for '${booking.resource.name}' was not approved. Reason: ${rejectionReason}`,
        type: 'booking_rejected',
        relatedBooking: booking._id,
        relatedResource: booking.resource._id,
        link: `/bookings/${booking._id}`,
      });

      sendRealtimeNotification(booking.borrower, notif);
      sendBookingUpdate(booking.borrower, booking);

      await logAuditEvent({
        req,
        actionType: 'booking_rejected',
        performedBy: req.user._id,
        userRole: req.user.role,
        userName: req.user.name,
        userEmail: req.user.email,
        relatedResource: booking.resource._id,
        resourceName: booking.resource.name,
        relatedBooking: booking._id,
        bookingNumber: booking.bookingNumber,
        explanation: `Booking ${booking.bookingNumber} rejected: ${rejectionReason}`,
        statusChange: { from: 'Pending', to: 'Rejected' },
      });

      return res.status(200).json({
        success: true,
        message: 'Booking request rejected with recorded reason.',
        booking,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Expected 'approve' or 'reject'.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;
    const booking = await Booking.findById(req.params.id).populate('resource');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isBorrower = booking.borrower.toString() === req.user._id.toString();
    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager'].includes(req.user.role);

    if (!isBorrower && !isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this reservation.',
      });
    }

    if (['Completed', 'Cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a booking that is already ${booking.status}.`,
      });
    }

    const oldStatus = booking.status;
    booking.status = 'Cancelled';
    booking.cancellationReason = cancellationReason || 'Cancelled by user';
    booking.cancelledBy = req.user._id;
    await booking.save();

    // Check if slot opens up for waiting list
    if (oldStatus === 'Approved') {
      await promoteWaitingList(booking.resource._id, {
        startTime: booking.startTime,
        endTime: booking.endTime,
      });
    }

    // Notify other party
    const targetUserId = isBorrower ? booking.owner : booking.borrower;
    const notif = await Notification.create({
      user: targetUserId,
      title: 'Booking Cancelled',
      message: `Reservation ${booking.bookingNumber} for '${booking.resource.name}' was cancelled.`,
      type: 'booking_cancelled',
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    sendRealtimeNotification(targetUserId, notif);

    await logAuditEvent({
      req,
      actionType: 'booking_cancelled',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: booking.resource._id,
      resourceName: booking.resource.name,
      relatedBooking: booking._id,
      bookingNumber: booking.bookingNumber,
      explanation: `Booking ${booking.bookingNumber} cancelled by ${req.user.name}.`,
      statusChange: { from: oldStatus, to: 'Cancelled' },
    });

    res.status(200).json({
      success: true,
      message: 'Booking successfully cancelled.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  reviewBooking,
  cancelBooking,
};
