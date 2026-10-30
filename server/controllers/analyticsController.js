const User = require('../models/User');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const Incident = require('../models/Incident');
const { calculateFairUsageMetrics } = require('../services/fairAllocationService');

// @desc    Get dashboard metrics based on role
// @route   GET /api/analytics/dashboard
const getDashboardAnalytics = async (req, res, next) => {
  try {
    const role = req.user.role;
    const userId = req.user._id;

    if (role === 'admin' || role === 'manager') {
      const institutionFilter =
        role === 'manager' ? { institution: req.user.institution } : {};

      const [
        totalUsers,
        totalResources,
        activeBookings,
        pendingApprovals,
        overdueReturns,
        openIncidents,
      ] = await Promise.all([
        User.countDocuments(institutionFilter),
        Resource.countDocuments({ ...institutionFilter, isActive: true }),
        Booking.countDocuments({ ...institutionFilter, status: 'Active' }),
        Booking.countDocuments({ ...institutionFilter, status: 'Pending' }),
        Booking.countDocuments({ ...institutionFilter, status: 'Overdue' }),
        Incident.countDocuments({ status: { $in: ['Reported', 'Under Review', 'Action Required'] } }),
      ]);

      // Category Distribution
      const categoryAgg = await Resource.aggregate([
        { $match: { ...institutionFilter, isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]);
      const categoryDistribution = categoryAgg.map((item) => ({
        name: item._id,
        count: item.count,
      }));

      // Booking Trends (Simulated or Real aggregated over recent days)
      const bookingStatusAgg = await Booking.aggregate([
        { $match: institutionFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]);
      const statusCounts = bookingStatusAgg.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      // Underutilized resources (resources with lowest booking counts)
      const underutilizedResources = await Resource.find({
        ...institutionFilter,
        isActive: true,
      })
        .sort({ totalBookingsCount: 1 })
        .limit(5)
        .select('name category location totalBookingsCount availableQuantity');

      return res.status(200).json({
        success: true,
        summary: {
          totalUsers,
          totalResources,
          activeBookings,
          pendingApprovals,
          overdueReturns,
          openIncidents,
        },
        categoryDistribution,
        statusCounts,
        underutilizedResources,
      });
    }

    if (role === 'owner') {
      const [
        totalResources,
        availableResources,
        pendingRequests,
        approvedBookings,
        activeBorrowings,
        overdueReturns,
        openIncidents,
      ] = await Promise.all([
        Resource.countDocuments({ owner: userId, isActive: true }),
        Resource.countDocuments({ owner: userId, isActive: true, availableQuantity: { $gt: 0 } }),
        Booking.countDocuments({ owner: userId, status: 'Pending' }),
        Booking.countDocuments({ owner: userId, status: 'Approved' }),
        Booking.countDocuments({ owner: userId, status: 'Active' }),
        Booking.countDocuments({ owner: userId, status: 'Overdue' }),
        Incident.countDocuments({ reportedBy: userId, status: { $ne: 'Closed' } }),
      ]);

      return res.status(200).json({
        success: true,
        summary: {
          totalResources,
          availableResources,
          pendingRequests,
          approvedBookings,
          activeBorrowings,
          overdueReturns,
          openIncidents,
        },
      });
    }

    // Default: Borrower
    const [
      activeBookings,
      pendingRequests,
      completedBookings,
    ] = await Promise.all([
      Booking.countDocuments({ borrower: userId, status: 'Active' }),
      Booking.countDocuments({ borrower: userId, status: 'Pending' }),
      Booking.countDocuments({ borrower: userId, status: 'Completed' }),
    ]);

    const fairMetrics = await calculateFairUsageMetrics(userId);

    return res.status(200).json({
      success: true,
      summary: {
        activeBookings,
        pendingRequests,
        completedBookings,
      },
      fairMetrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Fair Usage Score breakdown for logged-in borrower
// @route   GET /api/analytics/fair-usage
const getFairUsageBreakdown = async (req, res, next) => {
  try {
    const metrics = await calculateFairUsageMetrics(req.user._id);
    res.status(200).json({
      success: true,
      metrics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardAnalytics,
  getFairUsageBreakdown,
};
