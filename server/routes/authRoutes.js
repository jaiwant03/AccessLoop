const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  submitVerification,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/verify-request', protect, upload.single('verificationDoc'), submitVerification);

module.exports = router;
