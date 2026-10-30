const Incident = require('../models/Incident');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const Notification = require('../models/Notification');
const { logAuditEvent } = require('../middleware/auditLogger');
const { sendRealtimeNotification } = require('../services/socketService');

// @desc    Report an incident / damage / delay
// @route   POST /api/incidents
const createIncident = async (req, res, next) => {
  try {
    const {
      category,
      resourceId,
      bookingId,
      description,
      severity,
      evidenceImages,
    } = req.body;

    if (!category || !resourceId || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide incident category, resource, and detailed description.',
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    let parsedEvidence = [];
    if (req.files && req.files.length > 0) {
      parsedEvidence = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (evidenceImages) {
      parsedEvidence = Array.isArray(evidenceImages) ? evidenceImages : [evidenceImages];
    }

    const incidentNumber = `INC-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const incident = await Incident.create({
      incidentNumber,
      category,
      resource: resourceId,
      booking: bookingId || undefined,
      reportedBy: req.user._id,
      description,
      severity: severity || 'Medium',
      evidenceImages: parsedEvidence,
      status: 'Reported',
    });

    // Notify resource owner and admins
    const notif = await Notification.create({
      user: resource.owner,
      title: `Incident Filed: ${category.replace('_', ' ').toUpperCase()}`,
      message: `An incident (${incidentNumber}) has been reported for '${resource.name}': "${description.slice(0, 80)}..."`,
      type: 'incident_reported',
      relatedResource: resourceId,
      relatedIncident: incident._id,
      link: `/incidents/${incident._id}`,
    });

    sendRealtimeNotification(resource.owner, notif);

    await logAuditEvent({
      req,
      actionType: 'incident_created',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: resource._id,
      resourceName: resource.name,
      relatedIncident: incident._id,
      explanation: `Incident ${incidentNumber} reported for ${resource.name} by ${req.user.name}.`,
    });

    res.status(201).json({
      success: true,
      message: 'Incident reported successfully. A manager will investigate with human oversight.',
      incident,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all incidents (filtered by user/role/resource)
// @route   GET /api/incidents
const getAllIncidents = async (req, res, next) => {
  try {
    const { status, category, severity, page = 1, limit = 20 } = req.query;

    let query = {};

    // Normal borrowers see only their own reported incidents
    if (req.user.role === 'borrower') {
      query.reportedBy = req.user._id;
    } else if (req.user.role === 'owner') {
      // Owners see incidents for their resources OR incidents they reported
      const myResources = await Resource.find({ owner: req.user._id }).select('_id');
      const resourceIds = myResources.map((r) => r._id);
      query.$or = [{ reportedBy: req.user._id }, { resource: { $in: resourceIds } }];
    }

    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All') query.category = category;
    if (severity && severity !== 'All') query.severity = severity;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Incident.countDocuments(query);

    const incidents = await Incident.find(query)
      .populate('resource', 'name category location images')
      .populate('reportedBy', 'name email role department')
      .populate('resolvedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: incidents.length,
      total,
      incidents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single incident
// @route   GET /api/incidents/:id
const getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('resource')
      .populate('booking')
      .populate('reportedBy', 'name email role department avatar phone')
      .populate('resolvedBy', 'name email role');

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    res.status(200).json({
      success: true,
      incident,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update incident status / resolution (Managers & Admins)
// @route   PUT /api/incidents/:id/status
const updateIncidentStatus = async (req, res, next) => {
  try {
    const { status, managerNotes, resolutionDetails } = req.body;
    const incident = await Incident.findById(req.params.id).populate('resource');

    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    if (!['admin', 'manager', 'owner'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only managers, owners or administrators can update incident status.',
      });
    }

    const oldStatus = incident.status;
    if (status) incident.status = status;
    if (managerNotes) incident.managerNotes = managerNotes;
    if (resolutionDetails) {
      incident.resolutionDetails = resolutionDetails;
      incident.resolvedBy = req.user._id;
      incident.resolvedAt = new Date();
    }

    await incident.save();

    // Notify reporter
    const notif = await Notification.create({
      user: incident.reportedBy,
      title: `Incident ${incident.incidentNumber} Updated: ${incident.status}`,
      message: `Status updated to '${incident.status}'. Note: ${managerNotes || resolutionDetails || 'Status reviewed by staff.'}`,
      type: 'incident_resolved',
      relatedIncident: incident._id,
      link: `/incidents/${incident._id}`,
    });

    sendRealtimeNotification(incident.reportedBy, notif);

    await logAuditEvent({
      req,
      actionType: 'incident_resolved',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: incident.resource._id,
      resourceName: incident.resource.name,
      relatedIncident: incident._id,
      explanation: `Incident ${incident.incidentNumber} updated from ${oldStatus} to ${incident.status} by ${req.user.name}.`,
      statusChange: { from: oldStatus, to: incident.status },
    });

    res.status(200).json({
      success: true,
      message: 'Incident status updated successfully.',
      incident,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to incident discussion
// @route   POST /api/incidents/:id/comments
const addIncidentComment = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found.' });
    }

    incident.comments.push({
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      message,
      createdAt: new Date(),
    });

    await incident.save();

    res.status(200).json({
      success: true,
      comments: incident.comments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncidentStatus,
  addIncidentComment,
};
