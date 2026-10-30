const AuditLog = require('../models/AuditLog');

// @desc    Get system audit logs with rich filters
// @route   GET /api/audit-logs
const getAuditLogs = async (req, res, next) => {
  try {
    const {
      actionType,
      userRole,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 25,
    } = req.query;

    const query = {};

    if (actionType && actionType !== 'All') {
      query.actionType = actionType;
    }

    if (userRole && userRole !== 'All') {
      query.userRole = userRole;
    }

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { resourceName: { $regex: search, $options: 'i' } },
        { bookingNumber: { $regex: search, $options: 'i' } },
        { explanation: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      logs,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAuditLogs };
