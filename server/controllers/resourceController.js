const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const { logAuditEvent } = require('../middleware/auditLogger');

// @desc    Get all resources with search, filters, pagination and sorting
// @route   GET /api/resources
const getAllResources = async (req, res, next) => {
  try {
    const {
      search,
      category,
      resourceType,
      institution,
      isPaid,
      availableOnly,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (resourceType) {
      query.resourceType = resourceType;
    }

    if (institution && institution !== 'All') {
      query.institution = institution;
    }

    if (isPaid !== undefined && isPaid !== '') {
      query.isPaid = isPaid === 'true';
    }

    if (availableOnly === 'true') {
      query.availableQuantity = { $gt: 0 };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'popular') sortOptions = { totalBookingsCount: -1 };
    else if (sort === 'rating') sortOptions = { rating: -1 };
    else if (sort === 'name') sortOptions = { name: 1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Resource.countDocuments(query);

    const resources = await Resource.find(query)
      .populate('owner', 'name email avatar institution department')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single resource by ID with active bookings schedule
// @route   GET /api/resources/:id
const getResourceById = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id).populate(
      'owner',
      'name email avatar institution department phone'
    );

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found.',
      });
    }

    // Fetch existing confirmed bookings to display availability calendar
    const activeBookings = await Booking.find({
      resource: resource._id,
      status: { $in: ['Approved', 'Active', 'Return Pending'] },
      endTime: { $gte: new Date() },
    }).select('startTime endTime status');

    res.status(200).json({
      success: true,
      resource,
      bookedSlots: activeBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new resource
// @route   POST /api/resources
const createResource = async (req, res, next) => {
  try {
    const {
      name,
      category,
      resourceType,
      description,
      department,
      location,
      quantity,
      operatingHours,
      minBookingDurationHours,
      maxBookingDurationHours,
      eligibilityRequirements,
      safetyInstructions,
      usageGuidelines,
      securityDeposit,
      isPaid,
      hourlyFee,
      cancellationPolicy,
      tags,
      images,
    } = req.body;

    let parsedImages = [];
    if (req.files && req.files.length > 0) {
      parsedImages = req.files.map((f) => `/uploads/${f.filename}`);
    } else if (images) {
      parsedImages = Array.isArray(images) ? images : [images];
    }

    const resource = await Resource.create({
      name,
      category,
      resourceType: resourceType || 'equipment',
      description,
      images: parsedImages,
      institution: req.user.institution || 'Apex Institute of Technology & Science',
      department: department || req.user.department,
      location,
      owner: req.user._id,
      quantity: quantity ? parseInt(quantity) : 1,
      availableQuantity: quantity ? parseInt(quantity) : 1,
      operatingHours: operatingHours ? (typeof operatingHours === 'string' ? JSON.parse(operatingHours) : operatingHours) : undefined,
      minBookingDurationHours: minBookingDurationHours ? parseFloat(minBookingDurationHours) : 1,
      maxBookingDurationHours: maxBookingDurationHours ? parseFloat(maxBookingDurationHours) : 8,
      eligibilityRequirements: eligibilityRequirements
        ? (typeof eligibilityRequirements === 'string'
            ? JSON.parse(eligibilityRequirements)
            : eligibilityRequirements)
        : undefined,
      safetyInstructions,
      usageGuidelines,
      securityDeposit: securityDeposit ? parseFloat(securityDeposit) : 0,
      isPaid: isPaid === true || isPaid === 'true',
      hourlyFee: hourlyFee ? parseFloat(hourlyFee) : 0,
      cancellationPolicy,
      tags: typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags,
    });

    await logAuditEvent({
      req,
      actionType: 'resource_created',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: resource._id,
      resourceName: resource.name,
      explanation: `New resource listed: ${resource.name} (${resource.category}) at ${resource.location}`,
    });

    res.status(201).json({
      success: true,
      message: 'Resource listed successfully.',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
const updateResource = async (req, res, next) => {
  try {
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (
      resource.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'manager'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this resource.',
      });
    }

    let updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    resource = await Resource.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    await logAuditEvent({
      req,
      actionType: 'resource_modified',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: resource._id,
      resourceName: resource.name,
      explanation: `Resource details updated by ${req.user.role}.`,
    });

    res.status(200).json({
      success: true,
      message: 'Resource updated successfully.',
      resource,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate/Delete resource
// @route   DELETE /api/resources/:id
const deleteResource = async (req, res, next) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (
      resource.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this resource.',
      });
    }

    resource.isActive = false;
    await resource.save();

    await logAuditEvent({
      req,
      actionType: 'resource_deactivated',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      relatedResource: resource._id,
      resourceName: resource.name,
      explanation: `Resource '${resource.name}' marked inactive/decommissioned.`,
    });

    res.status(200).json({
      success: true,
      message: 'Resource deactivated successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check slot availability and conflict prevention
// @route   POST /api/resources/:id/check-availability
const checkAvailability = async (req, res, next) => {
  try {
    const { startTime, endTime } = req.body;
    const resourceId = req.params.id;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both startTime and endTime.',
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time.',
      });
    }

    const targetResource = await Resource.findById(resourceId);
    if (!targetResource) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const maxQuantity = targetResource.quantity || 1;

    // Check overlapping approved/active bookings
    const overlapping = await Booking.find({
      resource: resourceId,
      status: { $in: ['Approved', 'Active', 'Return Pending'] },
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } },
      ],
    });

    const isAvailable = overlapping.length < maxQuantity;

    res.status(200).json({
      success: true,
      isAvailable,
      capacity: maxQuantity,
      conflictsCount: overlapping.length,
      conflicts: overlapping.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  checkAvailability,
};
