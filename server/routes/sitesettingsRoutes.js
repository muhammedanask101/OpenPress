const express = require('express');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middleware/sanitizemiddleware');

const {
  getPublicSettings,
  getAdminSettings,
  updateSiteSettings,
} = require('../controllers/sitesettingsController');

// Sanitize all site-settings routes
router.use(sanitizeMiddleware);

// public

// Public settings (no banned keywords etc.)
router.get('/publicsettings', getPublicSettings);

// admin

// Full settings view
router.get('/getsettings', protect, getAdminSettings);

// Update settings
router.patch('/updatesettings', protect, validateBody(schemas.siteSettingsUpdate), updateSiteSettings );

module.exports = router;
