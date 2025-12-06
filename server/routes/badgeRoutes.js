// routes/badgeRoutes.js
const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middleware/sanitizemiddleware');

const badgeController = require('../controllers/badgeController');

// Sanitize all inputs on these routes
router.use(sanitizeMiddleware);

// public

// Get all badges (active by default)
router.get('/getbadges', badgeController.getBadges);

// Get badge by ID
router.get('/badge/:id', badgeController.getBadgeById);

// Get all badges for a user
router.get('/userbadges/:userId', badgeController.getUserBadges);

// admin

// Create badge
router.post( '/createbadge', protect, validateBody(schemas.badgeCreate), badgeController.createBadge );

// Update badge
router.patch( '/updatebadge/:id', protect, validateBody(schemas.badgeUpdate), badgeController.updateBadge );

// Soft delete badge
router.delete('/deletebadge/:id', protect, badgeController.deleteBadge);

// Restore soft-deleted badge
router.post('/:id/restorebadge', protect, badgeController.restoreBadge);

// Configure auto-award settings
router.post( '/:id/autoaward', protect,
  // simple body filter for security: only allow enabled + rule
  (req, res, next) => {
    const { enabled, rule } = req.body;
    req.body = { enabled, rule };
    next();
  }, badgeController.setAutoAward );

// Award badge to user
router.post( '/awardbadge', protect, validateBody(schemas.badgeAward), badgeController.awardBadgeToUser );

// Revoke awarded badge
router.delete('/revokebadge/:id', protect, badgeController.revokeBadgeFromUser);

module.exports = router;
