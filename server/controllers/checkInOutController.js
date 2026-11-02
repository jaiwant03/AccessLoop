const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logAuditEvent } = require('../middleware/auditLogger');
const { promoteWaitingList } = require('../services/fairAllocationService');
const {
  sendRealtimeNotification,
  sendBookingUpdate,
} = require('../services/socketService');

// @desc    Borrower completes check-in and submits initial condition documentation
// @route   POST /api/check-in-out/:bookingId/check-in
const submitCheckIn = async (req, res, next) => {
  try {
    const { borrowerNotes, initialPhotos } = req.body;
    const booking = await Booking.findById(req.params.bookingId).populate('resource');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.borrower.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the designated borrower can submit check-in documentation.',
      });
    }

    if (booking.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot check in. Current booking status is '${booking.status}' (expected 'Approved').`,
      });
    }

    let parsedPhotos = [];
    if (req.files && req.files.length > 0) {
      parsedPhotos = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (initialPhotos) {
      parsedPhotos = Array.isArray(initialPhotos) ? initialPhotos : [initialPhotos];
    }

    booking.checkIn = {
      checkedInAt: new Date(),
      borrowerNotes: borrowerNotes || 'Equipment inspected upon collection. All parts present.',
      initialPhotos: parsedPhotos,
      verifiedByOwner: false, // requires owner confirmation
    };

    await booking.save();

    // Notify owner to verify handover
    const notif = await Notification.create({
      user: booking.owner,
      title: 'Handover Verification Required',
      message: `${req.user.name} submitted initial condition photos for '${booking.resource.name}'. Please confirm physical handover.`,
      type: 'check_in_reminder',
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    sendRealtimeNotification(booking.owner, notif);

    await logAuditEvent({
      req,
      actionType: 'check_in_submitted',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: booking.resource._id,
      resourceName: booking.resource.name,
      relatedBooking: booking._id,
      bookingNumber: booking.bookingNumber,
      explanation: `Borrower submitted check-in condition documentation with ${parsedPhotos.length} photos.`,
    });

    res.status(200).json({
      success: true,
      message: 'Check-in details submitted! Awaiting owner handover verification.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner verifies handover and sets booking to 'Active'
// @route   POST /api/check-in-out/:bookingId/verify-handover
const verifyHandover = async (req, res, next) => {
  try {
    const { ownerNotes } = req.body;
    const booking = await Booking.findById(req.params.bookingId).populate('resource');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager'].includes(req.user.role);
    const isBorrower = booking.borrower.toString() === req.user._id.toString();

    if (!isOwner && !isStaff && !isBorrower) {
      return res.status(403).json({
        success: false,
        message: 'Only the resource owner, institutional manager, or authorized party can verify equipment handover.',
      });
    }

    if (booking.status !== 'Approved') {
      return res.status(400).json({
        success: false,
        message: `Booking must be in 'Approved' state to confirm handover. Current: '${booking.status}'`,
      });
    }

    booking.status = 'Active';
    if (!booking.checkIn) {
      booking.checkIn = {
        checkedInAt: new Date(),
        borrowerNotes: 'Equipment collected and inspected.',
        initialPhotos: [],
      };
    }
    booking.checkIn.verifiedByOwner = true;
    booking.checkIn.handoverTime = new Date();
    booking.checkIn.ownerNotes =
      ownerNotes || (isOwner ? 'Item handed over in stated condition.' : `Handover confirmed and verified by ${req.user.name}.`);
    await booking.save();

    // Increment active count for borrower
    await User.findByIdAndUpdate(booking.borrower, { $inc: { activeBookingsCount: 1 } });

    // Notify borrower
    const notif = await Notification.create({
      user: booking.borrower,
      title: 'Handover Confirmed - Booking Active',
      message: `Owner confirmed handover of '${booking.resource.name}'. Happy sharing!`,
      type: 'system',
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    sendRealtimeNotification(booking.borrower, notif);
    sendBookingUpdate(booking.borrower, booking);

    await logAuditEvent({
      req,
      actionType: 'check_in_completed',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: booking.resource._id,
      resourceName: booking.resource.name,
      relatedBooking: booking._id,
      bookingNumber: booking.bookingNumber,
      explanation: `Owner ${req.user.name} confirmed handover. Booking is now Active.`,
      statusChange: { from: 'Approved', to: 'Active' },
    });

    res.status(200).json({
      success: true,
      message: 'Handover verified successfully. Booking is now Active.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Borrower requests return with final condition photographs
// @route   POST /api/check-in-out/:bookingId/request-return
const requestReturn = async (req, res, next) => {
  try {
    const { borrowerNotes, returnPhotos } = req.body;
    const booking = await Booking.findById(req.params.bookingId).populate('resource');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isBorrower = booking.borrower.toString() === req.user._id.toString();
    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager'].includes(req.user.role);

    if (!isBorrower && !isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: 'Only the borrower, custodian, or authorized manager can submit a return request for this resource.',
      });
    }

    if (booking.status !== 'Active' && booking.status !== 'Overdue') {
      return res.status(400).json({
        success: false,
        message: `Booking must be in 'Active' or 'Overdue' status to initiate return. Current: '${booking.status}'`,
      });
    }

    let parsedPhotos = [];
    if (req.files && req.files.length > 0) {
      parsedPhotos = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (returnPhotos) {
      parsedPhotos = Array.isArray(returnPhotos) ? returnPhotos : [returnPhotos];
    }

    booking.status = 'Return Pending';
    booking.checkOut = {
      returnRequestedAt: new Date(),
      borrowerNotes: borrowerNotes || 'Resource returned in good working order.',
      returnPhotos: parsedPhotos,
      inspectedByOwner: false,
      conditionStatus: 'Pending Inspection',
    };

    await booking.save();

    // Notify owner
    const notif = await Notification.create({
      user: booking.owner,
      title: 'Return Inspection Requested',
      message: `${req.user.name} requested return for '${booking.resource.name}' with return photos. Please inspect and confirm.`,
      type: 'return_pending',
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    sendRealtimeNotification(booking.owner, notif);
    sendBookingUpdate(booking.owner, booking);

    await logAuditEvent({
      req,
      actionType: 'return_requested',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: booking.resource._id,
      resourceName: booking.resource.name,
      relatedBooking: booking._id,
      bookingNumber: booking.bookingNumber,
      explanation: `Borrower submitted return documentation with ${parsedPhotos.length} photos. Awaiting owner inspection.`,
      statusChange: { from: 'Active', to: 'Return Pending' },
    });

    res.status(200).json({
      success: true,
      message: 'Return request submitted! Awaiting owner inspection.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Owner inspects and confirms return, completing the transaction
// @route   POST /api/check-in-out/:bookingId/verify-return
const verifyReturn = async (req, res, next) => {
  try {
    const { ownerInspectionNotes, damageDetected, conditionStatus } = req.body;
    const booking = await Booking.findById(req.params.bookingId).populate('resource');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isStaff = ['admin', 'manager'].includes(req.user.role);
    const isBorrower = booking.borrower.toString() === req.user._id.toString();

    if (!isOwner && !isStaff && !isBorrower) {
      return res.status(403).json({
        success: false,
        message: 'Only the resource owner, institutional manager, or authorized party can verify return inspection.',
      });
    }

    if (booking.status !== 'Return Pending' && booking.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: `Booking is not ready for return verification. Current status: '${booking.status}'`,
      });
    }

    booking.status = 'Completed';
    if (!booking.checkOut) {
      booking.checkOut = {
        returnRequestedAt: new Date(),
        borrowerNotes: 'Equipment returned in complete condition.',
        returnPhotos: [],
      };
    }
    booking.checkOut.inspectedByOwner = true;
    booking.checkOut.inspectedAt = new Date();
    booking.checkOut.ownerInspectionNotes =
      ownerInspectionNotes || 'Item inspected and verified in satisfactory condition.';
    booking.checkOut.damageDetected = damageDetected === true || damageDetected === 'true';
    booking.checkOut.conditionStatus =
      conditionStatus || (damageDetected ? 'Damage Reported' : 'Intact & Clean');

    await booking.save();

    // Update user stats (completed bookings and hours)
    const borrowerUser = await User.findById(booking.borrower);
    if (borrowerUser) {
      borrowerUser.completedBookingsCount = (borrowerUser.completedBookingsCount || 0) + 1;
      borrowerUser.activeBookingsCount = Math.max(0, (borrowerUser.activeBookingsCount || 1) - 1);
      borrowerUser.totalHoursUsed = (borrowerUser.totalHoursUsed || 0) + (booking.durationHours || 0);
      await borrowerUser.save();
    }

    // Increment resource total bookings count
    await Resource.findByIdAndUpdate(booking.resource._id, {
      $inc: { totalBookingsCount: 1 },
    });

    // Check if slot opens up for waiting list
    await promoteWaitingList(booking.resource._id, {
      startTime: booking.startTime,
      endTime: booking.endTime,
    });

    // Notify borrower
    const notif = await Notification.create({
      user: booking.borrower,
      title: 'Return Confirmed - Booking Completed!',
      message: `Owner confirmed satisfactory return of '${booking.resource.name}'. Thank you for maintaining community trust!`,
      type: 'return_confirmed',
      relatedBooking: booking._id,
      link: `/bookings/${booking._id}`,
    });

    sendRealtimeNotification(booking.borrower, notif);
    sendBookingUpdate(booking.borrower, booking);

    await logAuditEvent({
      req,
      actionType: 'return_confirmed',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: booking.resource._id,
      resourceName: booking.resource.name,
      relatedBooking: booking._id,
      bookingNumber: booking.bookingNumber,
      explanation: `Owner ${req.user.name} inspected and confirmed return. Booking marked Completed.`,
      statusChange: { from: 'Return Pending', to: 'Completed' },
      metadata: { damageDetected: booking.checkOut.damageDetected },
    });

    res.status(200).json({
      success: true,
      message: 'Return successfully verified! Booking completed.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitCheckIn,
  verifyHandover,
  requestReturn,
  verifyReturn,
};
