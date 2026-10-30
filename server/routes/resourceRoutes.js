const express = require('express');
const router = express.Router();
const {
  getAllResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  checkAvailability,
} = require('../controllers/resourceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getAllResources);
router.get('/:id', getResourceById);
router.post(
  '/',
  protect,
  authorize('owner', 'manager', 'admin'),
  upload.array('images', 5),
  createResource
);
router.put(
  '/:id',
  protect,
  authorize('owner', 'manager', 'admin'),
  upload.array('images', 5),
  updateResource
);
router.delete(
  '/:id',
  protect,
  authorize('owner', 'manager', 'admin'),
  deleteResource
);
router.post('/:id/check-availability', checkAvailability);

module.exports = router;
