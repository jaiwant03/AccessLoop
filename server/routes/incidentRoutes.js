const express = require('express');
const router = express.Router();
const {
  createIncident,
  getAllIncidents,
  getIncidentById,
  updateIncidentStatus,
  addIncidentComment,
} = require('../controllers/incidentController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', protect, upload.array('evidence', 5), createIncident);
router.get('/', protect, getAllIncidents);
router.get('/:id', protect, getIncidentById);
router.put('/:id/status', protect, updateIncidentStatus);
router.post('/:id/comments', protect, addIncidentComment);

module.exports = router;
