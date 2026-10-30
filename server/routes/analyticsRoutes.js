const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getFairUsageBreakdown,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/fair-usage', protect, getFairUsageBreakdown);

module.exports = router;
