const express = require('express');
const router = express.Router();
const { protect, userprotect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middlewares/sanitizeMiddleware');
const {
  createMedia,
  getMyMedia,
  getMediaById,
  getMediaForItem,
  adminListMedia,
  softDeleteMedia,
  attachMediaUsage,
  clearMediaUsage,
  getMediaByKey,
} = require('../controllers/mediaController');


router.use(sanitizeMiddleware);

// user

// Create media record (current user)
router.post( '/createmedia', userprotect, validateBody(schemas.mediaCreate), createMedia );

// Get current user's media
router.get('/me', userprotect, getMyMedia);

// public

// Get media attached to a specific item
router.get('/item', getMediaForItem);

// admin

// Admin list media with filters
router.get('/', protect, adminListMedia);

// Find media by key + provider
router.get('/by-key/search', protect, getMediaByKey);

// Soft delete media
router.delete('/:id', protect, softDeleteMedia);

// Attach usage to media
router.post('/:id/attach', protect, attachMediaUsage);

// Clear usage on media
router.post('/:id/clear-usage', protect, clearMediaUsage);

// ---------- PUBLIC (by id) ----------

// Get a single media record (non-deleted)
// This goes last so it doesn't shadow /item or /by-key/search
router.get('/:id', getMediaById);

module.exports = router;
