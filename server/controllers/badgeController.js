// controllers/badgeController.js
const asyncHandler = require('express-async-handler');
const Badge = require('../models/badgeModel');
const BadgeOf = require('../models/badgeOfModel');
const User = require('../models/temp'); // only for sanity checks; adjust path if needed

// @desc    Create a new badge (ADMIN ONLY)
// @route   POST /api/badges
// @access  Admin
exports.createBadge = asyncHandler(async (req, res) => {
  // body already validated by Joi (badgeCreate)
  const { name, description = '', iconUrl = '', autoAward } = req.body;

  // Ensure name uniqueness is respected at app level as well
  const existing = await Badge.findOne({ name });
  if (existing && !existing.deleted) {
    return res.status(400).json({ message: 'Badge name already exists' });
  }

  const badge = await Badge.create({
    name,
    description: description || '',
    iconUrl: iconUrl || '',
    autoAward: autoAward || { enabled: false, rule: null },
  });

  res.status(201).json(badge);
});

// @desc    Get all active badges
// @route   GET /api/badges
// @access  Public
exports.getBadges = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted === 'true';

  const query = includeDeleted ? {} : { deleted: false };
  const badges = await Badge.find(query).sort({ name: 1 });

  res.json(badges);
});

// @desc    Get badge by ID
// @route   GET /api/badges/:id
// @access  Public
exports.getBadgeById = asyncHandler(async (req, res) => {
  const includeDeleted = req.query.includeDeleted === 'true';

  const query = { _id: req.params.id };
  if (!includeDeleted) query.deleted = false;

  const badge = await Badge.findOne(query);
  if (!badge) {
    return res.status(404).json({ message: 'Badge not found' });
  }

  res.json(badge);
});

// @desc    Update a badge (ADMIN ONLY)
// @route   PATCH /api/badges/:id
// @access  Admin
exports.updateBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);
  if (!badge || badge.deleted) {
    return res.status(404).json({ message: 'Badge not found' });
  }

  const { name, description, iconUrl, autoAward } = req.body;

  if (name && name !== badge.name) {
    const existing = await Badge.findOne({ name, deleted: false });
    if (existing && existing.id !== badge.id) {
      return res.status(400).json({ message: 'Badge name already exists' });
    }
    badge.name = name;
  }

  if (description !== undefined) badge.description = description || '';
  if (iconUrl !== undefined) badge.iconUrl = iconUrl || '';

  if (autoAward) {
    if (typeof autoAward.enabled === 'boolean') {
      badge.autoAward.enabled = autoAward.enabled;
    }
    if (autoAward.rule !== undefined) {
      badge.autoAward.rule = autoAward.rule;
    }
  }

  await badge.save();
  res.json(badge);
});

// @desc    Soft delete a badge (ADMIN ONLY)
// @route   DELETE /api/badges/:id
// @access  Admin
exports.deleteBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);
  if (!badge || badge.deleted) {
    return res.status(404).json({ message: 'Badge not found' });
  }

  await badge.softDelete();

  res.json({ message: 'Badge soft-deleted', badge });
});

// @desc    Restore a soft-deleted badge (ADMIN ONLY)
// @route   POST /api/badges/:id/restore
// @access  Admin
exports.restoreBadge = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);
  if (!badge || !badge.deleted) {
    return res.status(404).json({ message: 'Badge not found or not deleted' });
  }

  await badge.restore();
  res.json({ message: 'Badge restored', badge });
});

// @desc    Configure auto-award settings (ADMIN ONLY)
// @route   POST /api/badges/:id/auto-award
// @access  Admin
exports.setAutoAward = asyncHandler(async (req, res) => {
  const badge = await Badge.findById(req.params.id);
  if (!badge || badge.deleted) {
    return res.status(404).json({ message: 'Badge not found' });
  }

  const { enabled, rule } = req.body; // you can reuse badgeUpdate schema here or a small specific schema

  await badge.setAutoAward(enabled, rule);
  res.json({ message: 'Auto-award settings updated', badge });
});

// @desc    Award a badge to a user (ADMIN ONLY)
// @route   POST /api/badges/award
// @access  Admin
exports.awardBadgeToUser = asyncHandler(async (req, res) => {
  const { user: userId, badge: badgeId, reason } = req.body;

  // Ensure badge exists and is active
  const badge = await Badge.findOne({ _id: badgeId, deleted: false });
  if (!badge) {
    return res.status(404).json({ message: 'Badge not found or deleted' });
  }

  // Optional: sanity-check user existence for nicer error
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const badgeOf = await BadgeOf.awardBadge({
    userId,
    badgeId,
    reason: reason || '',
    awardedBy: req.admin ? req.admin._id : null,
  });

  res.status(201).json(badgeOf);
});

// @desc    Revoke a badge from a user (ADMIN ONLY)
// @route   DELETE /api/badges/award/:id
// @access  Admin
exports.revokeBadgeFromUser = asyncHandler(async (req, res) => {
  const badgeOf = await BadgeOf.findById(req.params.id);
  if (!badgeOf) {
    return res.status(404).json({ message: 'Badge assignment not found' });
  }

  await badgeOf.revoke();
  res.json({ message: 'Badge revoked' });
});

// @desc    Get all badges for a user
// @route   GET /api/users/:userId/badges
// @access  Public (or user-protected if you prefer)
exports.getUserBadges = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const badgesOf = await BadgeOf.getUserBadges(userId).populate('badge');
  res.json(badgesOf);
});
