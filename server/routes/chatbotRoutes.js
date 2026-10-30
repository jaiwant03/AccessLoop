const express = require('express');
const router = express.Router();
const { handleChatMessage } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

// Allow authenticated users to chat with full role context, or fallback for guest
router.post('/message', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, handleChatMessage);

module.exports = router;
