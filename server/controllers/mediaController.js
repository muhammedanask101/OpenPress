const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Media = require('../models/mediaModel');

const DISALLOWED_MEDIA_KINDS = ['comment', 'question', 'answer'];

// USER: CREATE + OWN MEDIA 

// @desc    Create a media record for current user
// @route   POST /api/media
// @access  User (userprotect)
const createMedia = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // validated by schemas.mediaCreate
  const {
    key,
    url,
    mimeType,
    size,
    storageProvider,
    storageRegion,
    // usedin is intentionally ignored for security on create
  } = req.body;

  try {
    const media = await Media.create({
      key,
      url,
      mimeType: mimeType || undefined,
      size: typeof size === 'number' ? size : undefined,
      storageProvider: storageProvider || undefined,
      storageRegion: storageRegion || undefined,
      uploadedBy: userId,
      // deleted, meta, derivatives, usedin are server-controlled only
    });

    res.status(201).json(media);
  } catch (err) {
    if (err.code === 11000) {
      // unique index on key + storageProvider
      return res.status(409).json({
        message: 'Media with this key and storage provider already exists',
      });
    }
    throw err;
  }
});

// @desc    Get current user's media
// @route   GET /api/media/me
// @access  User (userprotect)
const getMyMedia = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  let { page = 1, limit = 20 } = req.query;

  page = parseInt(page, 10) || 1;
  limit = parseInt(limit, 10) || 20;
  if (page < 1) page = 1;
  if (limit < 1) limit = 1;
  if (limit > 100) limit = 100;

  const [items, total] = await Promise.all([
    Media.forUser(userId, { page, limit }),
    Media.countDocuments({ uploadedBy: userId, deleted: false }),
  ]);

  res.json({
    page,
    limit,
    total,
    items,
  });
});

// -------- PUBLIC: READ MEDIA --------

// @desc    Get a single media record by id (only non-deleted)
// @route   GET /api/media/:id
// @access  Public
const getMediaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid media id' });
  }

  const media = await Media.findOne({ _id: id, deleted: false });
  if (!media) {
    return res.status(404).json({ message: 'Media not found' });
  }

  res.json(media);
});

// @desc    Get active media for an item (kind + itemId)
// @route   GET /api/media/item
// @access  Public
// @query   kind, itemId
const getMediaForItem = asyncHandler(async (req, res) => {
  const { kind, itemId } = req.query;

  if (!kind || !itemId) {
    return res.status(400).json({ message: 'kind and itemId are required' });
  }

  const normalizedKind = String(kind).toLowerCase().trim();

  // comments, questions and answers can't use media
  if (DISALLOWED_MEDIA_KINDS.includes(normalizedKind)) {
    return res.status(400).json({
      message: 'This type of content cannot have media attached',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const items = await Media.findActiveForItem({
    kind: normalizedKind,
    itemId,
  });

  res.json(items);
});

// ADMIN: LIST + MANAGEMENT 

// @desc    Admin list media (with filters)
// @route   GET /api/media
// @access  Admin (protect)
const adminListMedia = asyncHandler(async (req, res) => {
  const {
    uploadedBy,
    storageProvider,
    storageRegion,
    deleted,
    kind,
    itemId,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = {};

  if (deleted === 'true') filter.deleted = true;
  else if (deleted === 'false') filter.deleted = false;

  if (uploadedBy) {
    if (!mongoose.Types.ObjectId.isValid(uploadedBy)) {
      return res.status(400).json({ message: 'Invalid uploadedBy id' });
    }
    filter.uploadedBy = uploadedBy;
  }

  if (storageProvider) filter.storageProvider = storageProvider;
  if (storageRegion) filter.storageRegion = storageRegion;

  if (kind) {
    const normalizedKind = String(kind).toLowerCase().trim();
    filter['usedin.kind'] = normalizedKind;
  }
  if (itemId) {
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }
    filter['usedin.item'] = itemId;
  }

  let pageNum = parseInt(page, 10) || 1;
  let limitNum = parseInt(limit, 10) || 20;
  if (pageNum < 1) pageNum = 1;
  if (limitNum < 1) limitNum = 1;
  if (limitNum > 100) limitNum = 100;

  const [items, total] = await Promise.all([
    Media.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Media.countDocuments(filter),
  ]);

  res.json({
    page: pageNum,
    limit: limitNum,
    total,
    items,
  });
});

// @desc    Admin: soft delete a media record
// @route   DELETE /api/media/:id
// @access  Admin (protect)
const softDeleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid media id' });
  }

  const media = await Media.findById(id);
  if (!media || media.deleted) {
    return res.status(404).json({ message: 'Media not found' });
  }

  await media.softDelete();

  res.json({ message: 'Media soft-deleted', media });
});

// @desc    Admin: attach usage to media (kind + itemId)
// @route   POST /api/media/:id/attach
// @access  Admin (protect)
const attachMediaUsage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { kind, itemId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid media id' });
  }

  if (!kind || !itemId) {
    return res.status(400).json({ message: 'kind and itemId are required' });
  }

  const normalizedKind = String(kind).toLowerCase().trim();

  // comments, questions and answers can't use media
  if (DISALLOWED_MEDIA_KINDS.includes(normalizedKind)) {
    return res.status(400).json({
      message: 'This type of content cannot have media attached',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: 'Invalid itemId' });
  }

  const media = await Media.findById(id);
  if (!media || media.deleted) {
    return res.status(404).json({ message: 'Media not found' });
  }

  await media.attachUsage(normalizedKind, itemId);

  res.json({ message: 'Usage attached', media });
});

// @desc    Admin: clear usage from media
// @route   POST /api/media/:id/clear-usage
// @access  Admin (protect)
const clearMediaUsage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid media id' });
  }

  const media = await Media.findById(id);
  if (!media || media.deleted) {
    return res.status(404).json({ message: 'Media not found' });
  }

  await media.clearUsage();

  res.json({ message: 'Usage cleared', media });
});

// @desc    Admin: find media by key + provider
// @route   GET /api/media/by-key/search
// @access  Admin (protect)
// @query   key, provider (optional)
const getMediaByKey = asyncHandler(async (req, res) => {
  const { key, provider = 's3' } = req.query;

  if (!key) {
    return res.status(400).json({ message: 'key is required' });
  }

  const media = await Media.findByKey(key, provider);
  if (!media) {
    return res.status(404).json({ message: 'Media not found' });
  }

  res.json(media);
});

module.exports = {
  createMedia,
  getMyMedia,
  getMediaById,
  getMediaForItem,
  adminListMedia,
  softDeleteMedia,
  attachMediaUsage,
  clearMediaUsage,
  getMediaByKey,
};
