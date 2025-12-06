// controllers/badgeController.js
const asyncHandler = require('express-async-handler');
const Badge = require('../models/badgeModel');
const BadgeOf = require('../models/badgeofModel');
const User = require('../models/usermodel');

// @desc    Create a new badge (ADMIN ONLY)
// @route   POST /api/badges
// @access  Admin
exports.createBadge = asyncHandler(async (req, res) => {
  // body already validated by Joi (schemas.badgeCreate)
  const { name, description = '', iconUrl = '', autoAward } = req.body;

  // Respect DB-level uniqueness: no duplicate name at all
  const existing = await Badge.findOne({ name });
  if (existing) {
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

// @desc    Get all badges (active by default)
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
    const existing = await Badge.findOne({ name });
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
    return res
      .status(404)
      .json({ message: 'Badge not found or not deleted' });
  }

  await badge.restore();
  res.json({ message: 'Badge restored', badge });
});

// @desc    Configure auto-award settings (ADMIN ONLY)
// @ro
