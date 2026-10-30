const WaitingList = require('../models/WaitingList');
const Resource = require('../models/Resource');
const { logAuditEvent } = require('../middleware/auditLogger');

// @desc    Join waiting list for a resource
// @route   POST /api/waiting-list
const joinWaitingList = async (req, res, next) => {
  try {
    const { resourceId, requestedStartTime, requestedEndTime, purpose } = req.body;

    if (!resourceId || !requestedStartTime || !requestedEndTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide resource and requested time slot.',
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    // Check if user is already on the waiting list for this resource
    const existing = await WaitingList.findOne({
      resource: resourceId,
      user: req.user._id,
      status: { $in: ['Waiting', 'Notified'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `You are already on the waiting list for this resource (Queue Position: #${existing.queuePosition}).`,
      });
    }

    // Determine current queue length
    const activeWaitersCount = await WaitingList.countDocuments({
      resource: resourceId,
      status: 'Waiting',
    });

    const queuePosition = activeWaitersCount + 1;

    const entry = await WaitingList.create({
      resource: resourceId,
      user: req.user._id,
      requestedStartTime: new Date(requestedStartTime),
      requestedEndTime: new Date(requestedEndTime),
      purpose: purpose || 'Academic research/project access',
      queuePosition,
      status: 'Waiting',
    });

    await logAuditEvent({
      req,
      actionType: 'waiting_list_joined',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: resource._id,
      resourceName: resource.name,
      explanation: `User joined waiting list for ${resource.name} at position #${queuePosition}.`,
    });

    res.status(201).json({
      success: true,
      message: `Successfully joined waiting list! Your queue position is #${queuePosition}.`,
      entry,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's waiting list entries
// @route   GET /api/waiting-list/my
const getMyWaitingList = async (req, res, next) => {
  try {
    const list = await WaitingList.find({
      user: req.user._id,
      status: { $in: ['Waiting', 'Notified'] },
    })
      .populate('resource', 'name category location images securityDeposit')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: list.length,
      waitingList: list,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave waiting list
// @route   DELETE /api/waiting-list/:id
const cancelWaitingList = async (req, res, next) => {
  try {
    const entry = await WaitingList.findById(req.params.id);

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Waiting list entry not found.' });
    }

    if (entry.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this waiting list entry.',
      });
    }

    entry.status = 'Cancelled';
    await entry.save();

    // Re-adjust queue positions for remaining waiters
    await WaitingList.updateMany(
      {
        resource: entry.resource,
        status: 'Waiting',
        queuePosition: { $gt: entry.queuePosition },
      },
      { $inc: { queuePosition: -1 } }
    );

    res.status(200).json({
      success: true,
      message: 'You have left the waiting list.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  joinWaitingList,
  getMyWaitingList,
  cancelWaitingList,
};
