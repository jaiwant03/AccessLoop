const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Verification = require('../models/Verification');
const { logAuditEvent } = require('../middleware/auditLogger');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'accessloop_super_secret_jwt_key_2026_trusted_ecosystem',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      institution,
      department,
      role,
      studentOrEmployeeId,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required fields.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      institution: institution || 'Apex Institute of Technology & Science',
      department: department || 'Engineering & Technology',
      role: role || 'borrower',
      studentOrEmployeeId: studentOrEmployeeId || '',
      verificationStatus: 'Not Submitted',
    });

    await logAuditEvent({
      req,
      actionType: 'user_registered',
      performedBy: user._id,
      userRole: user.role,
      userName: user.name,
      userEmail: user.email,
      explanation: `New user account created with role '${user.role}' at ${user.institution}.`,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        department: user.department,
        verificationStatus: user.verificationStatus,
        fairUsageScore: user.fairUsageScore,
        avatar: user.avatar,
        studentOrEmployeeId: user.studentOrEmployeeId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform administration.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution: user.institution,
        department: user.department,
        verificationStatus: user.verificationStatus,
        fairUsageScore: user.fairUsageScore,
        avatar: user.avatar,
        studentOrEmployeeId: user.studentOrEmployeeId,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, department, studentOrEmployeeId } = req.body;

    const user = await User.findById(req.user._id);
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (department) user.department = department;
    if (studentOrEmployeeId) user.studentOrEmployeeId = studentOrEmployeeId;

    await user.save();

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit verification document / ID
// @route   POST /api/auth/verify-request
const submitVerification = async (req, res, next) => {
  try {
    const { verificationType, idNumber, department, submittedNotes, documentUrl } = req.body;

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : documentUrl;

    if (!fileUrl && !idNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide ID number and supporting document or ID photo.',
      });
    }

    const verification = await Verification.create({
      user: req.user._id,
      institution: req.user.institution,
      verificationType: verificationType || 'Student ID',
      idNumber: idNumber || req.user.studentOrEmployeeId || 'ID-PENDING',
      department: department || req.user.department,
      documentUrl: fileUrl || '/uploads/sample_id_card.png',
      submittedNotes: submittedNotes || 'Verification submission for academic equipment access',
      status: 'Pending Review',
    });

    req.user.verificationStatus = 'Pending Review';
    req.user.verificationDoc = fileUrl;
    req.user.verificationType = verificationType;
    await req.user.save();

    await logAuditEvent({
      req,
      actionType: 'verification_submitted',
      performedBy: req.user._id,
      userRole: req.user.role,
      userName: req.user.name,
      userEmail: req.user.email,
      explanation: `User submitted ${verificationType} documentation for manager review.`,
    });

    res.status(201).json({
      success: true,
      message: 'Verification request submitted successfully. An institution manager will review it.',
      verification,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  submitVerification,
};
