const asyncHandler = require('express-async-handler');
const SiteSettings = require('../models/sitesettingsModel');

// Helper: build a public-safe version of settings
const toPublicSettings = (settingsDoc) => {
  const obj = settingsDoc.toObject();

  // Do not expose banned keywords publicly
  if (obj.moderation && obj.moderation.bannedKeywords) {
    delete obj.moderation.bannedKeywords;
  }

  // You can also hide other internal fields if you like
  delete obj.deleted;
  delete obj.id; // _id already mapped to id in toObject; not critical

  return obj;
};

// Helper: deep merge updates (validated by Joi) into the existing settings doc
const applySettingsUpdates = (settings, updates) => {
  // Top-level simple strings
  const simpleFields = [
    'siteName',
    'tagline',
    'siteDescription',
    'logoUrl',
    'faviconUrl',
    'contactEmail',
    'organizationName',
    'missionStatement',
  ];

  simpleFields.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      settings[field] = updates[field];
    }
  });

  // Nested: features
  if (updates.features) {
    settings.features = settings.features || {};
    const keys = [
      'allowRegistrations',
      'enableComments',
      'enableAnswers',
      'enableArticles',
    ];
    keys.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(updates.features, k)) {
        settings.features[k] = updates.features[k];
      }
    });
  }

  // Nested: moderation
  if (updates.moderation) {
    settings.moderation = settings.moderation || {};
    const keys = [
      'autoApproveLowRisk',
      'requireManualReview',
      'enableAIModeration',
      'aiModerationThreshold',
      'bannedKeywords',
    ];
    keys.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(updates.moderation, k)) {
        settings.moderation[k] = updates.moderation[k];
      }
    });
  }

  // Nested: social
  if (updates.social) {
    settings.social = settings.social || {};
    const keys = [
      'discord',
      'twitter',
      'instagram',
      'youtube',
      'facebook',
      'github',
    ];
    keys.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(updates.social, k)) {
        settings.social[k] = updates.social[k];
      }
    });
  }

  // Nested: maintenanceMode
  if (updates.maintenanceMode) {
    settings.maintenanceMode = settings.maintenanceMode || {};
    const keys = ['enabled', 'message'];
    keys.forEach((k) => {
      if (
        Object.prototype.hasOwnProperty.call(updates.maintenanceMode, k)
      ) {
        settings.maintenanceMode[k] = updates.maintenanceMode[k];
      }
    });
  }

  // Nested: theme
  if (updates.theme) {
    settings.theme = settings.theme || {};
    const keys = ['primaryColor', 'darkModeEnabled'];
    keys.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(updates.theme, k)) {
        settings.theme[k] = updates.theme[k];
      }
    });
  }

  // Nested: analytics
  if (updates.analytics) {
    settings.analytics = settings.analytics || {};
    const keys = ['googleAnalyticsId', 'plausibleDomain'];
    keys.forEach((k) => {
      if (Object.prototype.hasOwnProperty.call(updates.analytics, k)) {
        settings.analytics[k] = updates.analytics[k];
      }
    });
  }

  // Intentionally do NOT allow changing "deleted" via this API

  return settings;
};

// @desc    Get public site settings (no secrets / banned keywords)
// @route   GET /api/sitesettings/public
// @access  Public
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  const payload = toPublicSettings(settings);
  res.json(payload);
});

// @desc    Get full site settings (admin view)
// @route   GET /api/sitesettings
// @access  Admin (protect)
const getAdminSettings = asyncHandler(async (req, res) => {
  const settings = await SiteSettings.getSingleton();
  res.json(settings);
});

// @desc    Update site settings
// @route   PATCH /api/sitesettings
// @access  Admin (protect)
const updateSiteSettings = asyncHandler(async (req, res) => {
  // req.body already validated by Joi (schemas.siteSettingsUpdate)
  const updates = req.body;

  let settings = await SiteSettings.getSingleton();

  settings = applySettingsUpdates(settings, updates);

  await settings.save(); // pre-save hook will normalize bannedKeywords and AI threshold

  res.json(settings);
});

module.exports = {
  getPublicSettings,
  getAdminSettings,
  updateSiteSettings,
};
