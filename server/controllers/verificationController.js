const Verification = require('../models/Verification');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { logAuditEvent } = require('../middleware/auditLogger');
const { sendRealtimeNotification } = require('../services/socketService');

// @desc    Get all verification requests
// @route   GET /api/verifications
const getVerifications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;

    const list = await Verification.find(query)
      .populate('user', 'name email role institution department studentOrEmployeeId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: list.length,
      verifications: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manager/Admin reviews verification request
// @route   PUT /api/verifications/:id/review
const reviewVerification = async (req, res, next) => {
  try {
    const { status, reviewerNotes } = req.body; // 'Verified', 'Rejected', 'Additional Information Required'

    if (!['Verified', 'Rejected', 'Additional Information Required'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be Verified, Rejected or Additional Information Required.',
      });
    }

    const verification = await Verification.findById(req.params.id).populate('user');
    if (!verification) {
      return res.status(404).json({ success: false, message: 'Verification record not found.' });
    }

    verification.status = status;
    verification.reviewerNotes = reviewerNotes || '';
    verification.reviewedBy = req.user._id;
    verification.reviewedAt = new Date();
    await verification.save();

    // Update user record
    await User.findByIdAndUpdate(verification.user._id, {
      verificationStatus: status,
    });

    // Notify user
    const notif = await Notification.create({
      user: verification.user._id,
      title: `Verification Decision: ${status}`,
      message: `Your verification submission has been marked as '${status}'. Note: ${reviewerNotes || 'Reviewed by institution administrator.'}`,
      type: 'verification_update',
      link: '/profile',
    });

    sendRealtimeNotification(verification.user._id, notif);

    await logAuditEvent({
      req,
      actionType: 'verification_decision',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      explanation: `Manager ${req.user.name} reviewed verification for ${verification.user.name}: marked as '${status}'.`,
      statusChange: { from: 'Pending Review', to: status },
    });

    res.status(200).json({
      success: true,
      message: `User verification updated to '${status}'.`,
      verification,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVerifications,
  reviewVerification,
};
