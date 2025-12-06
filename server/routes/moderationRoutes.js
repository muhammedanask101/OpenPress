const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware } = require('../middlewares/sanitizeMiddleware');

const {
  getModLogs,
  getLogsForItem,
  getLogsForActor,
  getModLogById,
} = require('../controllers/modlogController');

// Sanitize all modlog routes
router.use(sanitizeMiddleware);

// All modlog routes are admin-only
router.use(protect);

// List mod logs with filters (pagination)
router.get('/getmodlogs', getModLogs);

// Logs for specific item
router.get('/itemlog', getLogsForItem);

// Logs for specific actor
router.get('/actorlog/:actorId', getLogsForActor);

// Single log entry (keep last so it doesn't shadow /item or /actor)
router.get('/modlog/:id', getModLogById);

module.exports = router;
