const express = require('express');
const router = express.Router();
const {
  getVerifications,
  reviewVerification,
} = require('../controllers/verificationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'manager'), getVerifications);
router.put('/:id/review', protect, authorize('admin', 'manager'), reviewVerification);

module.exports = router;
