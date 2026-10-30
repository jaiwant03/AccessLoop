const express = require('express');
const router = express.Router();
const {
  joinWaitingList,
  getMyWaitingList,
  cancelWaitingList,
} = require('../controllers/waitingListController');
const { protect } = require('../middleware/auth');

router.post('/', protect, joinWaitingList);
router.get('/my', protect, getMyWaitingList);
router.delete('/:id', protect, cancelWaitingList);

module.exports = router;
