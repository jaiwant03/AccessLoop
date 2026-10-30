const AuditLog = require('../models/AuditLog');

const logAuditEvent = async ({
  req,
  actionType,
  performedBy,
  userRole,
  userName,
  userEmail,
  relatedResource,
  resourceName,
  relatedBooking,
  bookingNumber,
  relatedIncident,
  explanation,
  statusChange,
  metadata = {},
}) => {
  try {
    const ipAddress =
      req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';

    const actorId = performedBy || req?.user?._id;
    const actorName = userName || req?.user?.name || 'System';
    const actorRole = userRole || req?.user?.role || 'system';
    const actorEmail = userEmail || req?.user?.email || '';

    await AuditLog.create({
      actionType,
      performedBy: actorId,
      userName: actorName,
      userRole: actorRole,
      userEmail: actorEmail,
      relatedResource,
      resourceName,
      relatedBooking,
      bookingNumber,
      relatedIncident,
      explanation,
      statusChange,
      metadata,
      ipAddress,
    });
  } catch (error) {
    console.error('[Audit Log Error] Failed to record audit event:', error.message);
  }
};

module.exports = { logAuditEvent };
