const { processChatMessage } = require('../services/aiChatbotService');

// @desc    Process chatbot message with real DB integration & role awareness
// @route   POST /api/chatbot/message
const handleChatMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const userRole = req.user?.role || 'borrower';
    const userId = req.user?._id;

    const result = await processChatMessage({
      message,
      userRole,
      userId,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleChatMessage };
