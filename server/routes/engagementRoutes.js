const express = require('express');
const router = express.Router();
const { userprotect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middlewares/sanitizeMiddleware');
const engagementController = require('../controllers/engagementController');

router.use(sanitizeMiddleware);


// Toggle bookmark (current user)
router.post( '/bookmarks/toggle', userprotect, validateBody(schemas.bookmarkToggle), engagementController.toggleBookmark );

// Get current user's bookmarks
router.get( '/getbookmarks', userprotect, engagementController.getUserBookmarks );

// Get bookmark status for current user
router.get( '/bookmarks/status', userprotect, engagementController.getBookmarkStatus );

// Toggle star (current user)
router.post( '/stars/toggle', userprotect, validateBody(schemas.starToggle), engagementController.toggleStar );

// Get star status for current user
router.get( '/stars/status', userprotect, engagementController.getStarStatus );

// Get star count (public)
router.get('/stars/count', engagementController.getStarCount);

module.exports = router;
