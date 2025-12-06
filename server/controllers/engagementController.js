const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Bookmark = require('../models/bookmarkModel');
const Star = require('../models/starModel');


// @desc    Toggle bookmark on/off for current user
// @route   POST /api/engagement/bookmarks/toggle
// @access  User (userprotect)
exports.toggleBookmark = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemType, itemId } = req.body; // validated by Joi (bookmarkToggle)

  const { bookmarked, bookmark } = await Bookmark.toggle({
    userId,
    itemType,
    itemId,
  });

  res.json({
    bookmarked,
    bookmark,
  });
});

// @desc    Get bookmarks for current user (optionally filtered by itemType)
// @route   GET /api/engagement/bookmarks
// @access  User (userprotect)
exports.getUserBookmarks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemType } = req.query;

  const validTypes = ['article', 'question', 'answer'];
  let typeFilter;

  if (itemType) {
    const lower = String(itemType).toLowerCase();
    if (!validTypes.includes(lower)) {
      return res.status(400).json({ message: 'Invalid itemType' });
    }
    typeFilter = lower;
  }

  let { page = 1, limit = 50 } = req.query;
  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 50;

  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100; // simple DoS protection

  const bookmarks = await Bookmark.getUserBookmarks(userId, {
    itemType: typeFilter,
    page,
    limit,
  });

  res.json({
    page,
    limit,
    count: bookmarks.length,
    bookmarks,
  });
});

// @desc    Check if current user has bookmarked given item
// @route   GET /api/engagement/bookmarks/status
// @access  User (userprotect)
// @query   itemType, itemId
exports.getBookmarkStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemType, itemId } = req.query;

  const validTypes = ['article', 'question', 'answer'];

  if (!itemType || !itemId) {
    return res
      .status(400)
      .json({ message: 'itemType and itemId are required' });
  }

  const lower = String(itemType).toLowerCase();
  if (!validTypes.includes(lower)) {
    return res.status(400).json({ message: 'Invalid itemType' });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const bookmarked = await Bookmark.isBookmarked({
    userId,
    itemType: lower,
    itemId,
  });

  res.json({ bookmarked });
});


// @desc    Toggle star on/off for current user
// @route   POST /api/engagement/stars/toggle
// @access  User (userprotect)
exports.toggleStar = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemType, itemId } = req.body; // validated by Joi (starToggle)

  const { starred, star } = await Star.toggle({
    userId,
    itemType,
    itemId,
  });

  res.json({
    starred,
    star,
  });
});

// @desc    Check if current user has starred given item
// @route   GET /api/engagement/stars/status
// @access  User (userprotect)
// @query   itemType, itemId
exports.getStarStatus = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { itemType, itemId } = req.query;

  const validTypes = ['article', 'answer'];

  if (!itemType || !itemId) {
    return res
      .status(400)
      .json({ message: 'itemType and itemId are required' });
  }

  const lower = String(itemType).toLowerCase();
  if (!validTypes.includes(lower)) {
    return res.status(400).json({ message: 'Invalid itemType' });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const hasStarred = await Star.hasStarred({
    userId,
    itemType: lower,
    itemId,
  });

  res.json({ starred: hasStarred });
});

// @desc    Get star count for an item (public)
// @route   GET /api/engagement/stars/count
// @access  Public
// @query   itemType, itemId
exports.getStarCount = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.query;
  const validTypes = ['article', 'answer'];

  if (!itemType || !itemId) {
    return res
      .status(400)
      .json({ message: 'itemType and itemId are required' });
  }

  const lower = String(itemType).toLowerCase();
  if (!validTypes.includes(lower)) {
    return res.status(400).json({ message: 'Invalid itemType' });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const count = await Star.countStars({
    itemType: lower,
    itemId,
  });

  res.json({ itemType: lower, itemId, count });
});
