const express = require('express');
const router = express.Router();
const {
  submitCheckIn,
  verifyHandover,
  requestReturn,
  verifyReturn,
} = require('../controllers/checkInOutController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post(
  '/:bookingId/check-in',
  protect,
  upload.array('photos', 5),
  submitCheckIn
);
router.post('/:bookingId/verify-handover', protect, verifyHandover);
router.post(
  '/:bookingId/request-return',
  protect,
  upload.array('photos', 5),
  requestReturn
);
router.post('/:bookingId/verify-return', protect, verifyReturn);

module.exports = router;
