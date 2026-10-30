const Booking = require('../models/Booking');
const User = require('../models/User');
const Incident = require('../models/Incident');
const WaitingList = require('../models/WaitingList');
const Notification = require('../models/Notification');
const { sendRealtimeNotification } = require('./socketService');

/**
 * Calculates a dynamic Fair Usage Score (0 - 100) and returns a transparent breakdown.
 */
const calculateFairUsageMetrics = async (userId) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // 1. Fetch user's bookings in the past 30 days
  const recentBookings = await Booking.find({
    borrower: userId,
    createdAt: { $gte: thirtyDaysAgo },
  });

  // 2. Fetch active bookings count
  const activeCount = recentBookings.filter((b) =>
    ['Pending', 'Approved', 'Active', 'Return Pending'].includes(b.status)
  ).length;

  // 3. Total hours used in last 30 days
  const completedBookings = recentBookings.filter(
    (b) => b.status === 'Completed'
  );
  const totalHoursUsed30d = completedBookings.reduce(
    (acc, b) => acc + (b.durationHours || 0),
    0
  );

  // 4. Incident penalty points (e.g. late returns or confirmed damage)
  const userIncidents = await Incident.find({
    reportedBy: userId,
    category: { $in: ['late_return', 'physical_damage', 'misuse'] },
    status: { $in: ['Resolved', 'Action Required'] },
  });
  const incidentPenalty = userIncidents.length * 15;

  // 5. Heavy usage decay: If used > 30 hours in last month, apply soft score reduction to allow others fair access
  let usagePenalty = 0;
  if (totalHoursUsed30d > 40) {
    usagePenalty = Math.min(30, Math.floor((totalHoursUsed30d - 40) * 1.5));
  }

  // 6. Active concurrent booking load penalty (discouraging hogging multiple resources at once)
  const concurrentPenalty = activeCount >= 3 ? 15 : activeCount === 2 ? 5 : 0;

  let score = 100 - incidentPenalty - usagePenalty - concurrentPenalty;
  score = Math.max(10, Math.min(100, score));

  // Determine Fair Usage Tier
  let tier = 'High Priority';
  let tierColor = '#22C55E';
  if (score < 50) {
    tier = 'Cooldown / Low Priority';
    tierColor = '#EF4444';
  } else if (score < 75) {
    tier = 'Moderate Access';
    tierColor = '#F59E0B';
  }

  return {
    score,
    tier,
    tierColor,
    totalHoursUsed30d,
    activeCount,
    incidentCount: userIncidents.length,
    factors: [
      { name: 'Base Standing', impact: 100, description: 'Starting score for compliant users' },
      ...(usagePenalty > 0
        ? [
            {
              name: 'High Frequency Usage',
              impact: -usagePenalty,
              description: `User consumed ${totalHoursUsed30d}h in the last 30 days; priority adjusted to balance community access.`,
            },
          ]
        : []),
      ...(concurrentPenalty > 0
        ? [
            {
              name: 'Active Resource Commitments',
              impact: -concurrentPenalty,
              description: `User currently holds ${activeCount} active/pending reservations.`,
            },
          ]
        : []),
      ...(incidentPenalty > 0
        ? [
            {
              name: 'Recorded Incidents/Delays',
              impact: -incidentPenalty,
              description: `${userIncidents.length} past incident(s) on record.`,
            },
          ]
        : []),
    ],
  };
};

/**
 * Checks if a requested booking violates consecutive limits or fair access policy.
 */
const evaluateFairAllocationRules = async ({
  borrowerId,
  resourceId,
  startTime,
  endTime,
  durationHours,
}) => {
  const metrics = await calculateFairUsageMetrics(borrowerId);

  // Rule 1: Max concurrent active bookings limit
  if (metrics.activeCount >= 3) {
    return {
      allowed: false,
      reason:
        'Maximum concurrent reservation limit reached. You currently have 3 active or pending bookings. Please complete or cancel existing reservations first.',
      score: metrics.score,
    };
  }

  // Rule 2: Consecutive booking rule (prevent same user from booking same resource back-to-back within 24 hours if high demand)
  const oneDayBefore = new Date(new Date(startTime).getTime() - 24 * 60 * 60 * 1000);
  const backToBackBooking = await Booking.findOne({
    borrower: borrowerId,
    resource: resourceId,
    endTime: { $gte: oneDayBefore, $lte: startTime },
    status: { $in: ['Approved', 'Completed', 'Active'] },
  });

  if (backToBackBooking && metrics.score < 80) {
    return {
      allowed: false,
      reason:
        'Fair Share Cooldown: You recently reserved this resource. A 24-hour community cooldown applies to allow other researchers and students fair opportunity.',
      score: metrics.score,
    };
  }

  return {
    allowed: true,
    score: metrics.score,
    metrics,
  };
};

/**
 * Promotes the next eligible waiting list applicant when a slot opens up.
 */
const promoteWaitingList = async (resourceId, cancelledSlot) => {
  try {
    const nextInQueue = await WaitingList.findOne({
      resource: resourceId,
      status: 'Waiting',
      requestedStartTime: { $gte: cancelledSlot.startTime },
      requestedEndTime: { $lte: cancelledSlot.endTime },
    }).sort({ queuePosition: 1 });

    if (nextInQueue) {
      nextInQueue.status = 'Notified';
      nextInQueue.notifiedAt = new Date();
      nextInQueue.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours to claim
      await nextInQueue.save();

      // Send notification
      const notif = await Notification.create({
        user: nextInQueue.user,
        title: 'Spot Available: Waiting List Opportunity',
        message: `A reserved time slot has opened for the resource you were waiting for! Log in within 2 hours to confirm your booking.`,
        type: 'waiting_list_update',
        relatedResource: resourceId,
        link: `/resources/${resourceId}`,
      });

      sendRealtimeNotification(nextInQueue.user, notif);
      return nextInQueue;
    }
  } catch (err) {
    console.error('[Fair Allocation] Error promoting waiting list:', err.message);
  }
  return null;
};

module.exports = {
  calculateFairUsageMetrics,
  evaluateFairAllocationRules,
  promoteWaitingList,
};
