const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const ModLog = require('../models/modlogModel');

const ALLOWED_ITEM_TYPES = [
  'article',
  'question',
  'answer',
  'comment',
  'user',
  'report',
  'settings',
  'system',
  'other',
];

// helper to validate and normalize itemType
const normalizeItemType = (itemType) => {
  if (!itemType) return null;
  const lower = String(itemType).toLowerCase().trim();
  return ALLOWED_ITEM_TYPES.includes(lower) ? lower : null;
};

// Escape regex special chars (for safe regex from user input)
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ADMIN: LIST / FILTER LOGS

// @desc    Get moderation logs with filters
// @route   GET /api/modlogs
// @access  Admin (protect)
const getModLogs = asyncHandler(async (req, res) => {
  const {
    itemType,
    itemId,
    actor,
    action,
    from,
    to,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  // itemType
  if (itemType) {
    const normalized = normalizeItemType(itemType);
    if (!normalized) {
      return res.status(400).json({ message: 'Invalid itemType' });
    }
    filter.itemType = normalized;
  }

  // itemId
  if (itemId) {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }
    filter.itemId = itemId;
  }

  // actor
  if (actor) {
    if (!mongoose.Types.ObjectId.isValid(actor)) {
      return res.status(400).json({ message: 'Invalid actor id' });
    }
    filter.actor = actor;
  }

  // action substring search (case-insensitive)
  if (action) {
    const safe = escapeRegex(String(action).trim());
    filter.action = new RegExp(safe, 'i');
  }

  // date range
  if (from || to) {
    filter.createdAt = {};
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({ message: 'Invalid from date' });
      }
      filter.createdAt.$gte = fromDate;
    }
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({ message: 'Invalid to date' });
      }
      filter.createdAt.$lte = toDate;
    }
  }

  let pageNum = parseInt(page, 10) || 1;
  let limitNum = parseInt(limit, 10) || 20;
  if (pageNum < 1) pageNum = 1;
  if (limitNum < 1) limitNum = 1;
  if (limitNum > 100) limitNum = 100;

  const [logs, total] = await Promise.all([
    ModLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    ModLog.countDocuments(filter),
  ]);

  res.json({
    page: pageNum,
    limit: limitNum,
    total,
    logs,
  });
});

// ADMIN: GET LOGS FOR AN ITEM 

// @desc    Get logs for a specific item
// @route   GET /api/modlogs/item
// @access  Admin (protect)
// @query   itemType, itemId, limit
const getLogsForItem = asyncHandler(async (req, res) => {
  const { itemType, itemId, limit = 50 } = req.query;

  if (!itemType || !itemId) {
    return res
      .status(400)
      .json({ message: 'itemType and itemId are required' });
  }

  const normalized = normalizeItemType(itemType);
  if (!normalized) {
    return res.status(400).json({ message: 'Invalid itemType' });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  let limitNum = parseInt(limit, 10) || 50;
  if (limitNum < 1) limitNum = 1;
  if (limitNum > 200) limitNum = 200;

  const logs = await ModLog.forItem(normalized, itemId, { limit: limitNum });

  res.json({
    itemType: normalized,
    itemId,
    count: logs.length,
    logs,
  });
});

// ADMIN: GET LOGS FOR AN ACTOR 

// @desc    Get logs for a specific actor (moderator)
// @route   GET /api/modlogs/actor/:actorId
// @access  Admin (protect)
// @query   itemType, limit
const getLogsForActor = asyncHandler(async (req, res) => {
  const { actorId } = req.params;
  const { itemType, limit = 50 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(actorId)) {
    return res.status(400).json({ message: 'Invalid actor id' });
  }

  let limitNum = parseInt(limit, 10) || 50;
  if (limitNum < 1) limitNum = 1;
  if (limitNum > 200) limitNum = 200;

  // if itemType filter is given, apply manually instead of using static
  let baseQuery = ModLog.find({ actor: actorId });

  if (itemType) {
    const normalized = normalizeItemType(itemType);
    if (!normalized) {
      return res.status(400).json({ message: 'Invalid itemType' });
    }
    baseQuery = baseQuery.where('itemType').equals(normalized);
  }

  const logs = await baseQuery.sort({ createdAt: -1 }).limit(limitNum);

  res.json({
    actor: actorId,
    count: logs.length,
    logs,
  });
});

// ADMIN: GET SINGLE LOG ENTRY 

// @desc    Get single modlog entry by id
// @route   GET /api/modlogs/:id
// @access  Admin (protect)
const getModLogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid log id' });
  }

  const log = await ModLog.findById(id);
  if (!log) {
    return res.status(404).json({ message: 'Log entry not found' });
  }

  res.json(log);
});

module.exports = {
  getModLogs,
  getLogsForItem,
  getLogsForActor,
  getModLogById,
};
