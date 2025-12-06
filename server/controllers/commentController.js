// controllers/commentController.js
const asyncHandler = require('express-async-handler');
const Comment = require('../models/commentModel');
const Article = require('../models/articleModel');

// Pagination helper
function getPagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  return { page, limit };
}

// Identify actor (user / admin)
function getActor(req) {
  const isUser = !!req.user;
  const isAdmin = !!req.admin;

  const actorId =
    (req.user && req.user._id) ||
    (req.admin && req.admin._id) ||
    null;

  return { actorId, isUser, isAdmin };
}

// Allowed fields on create
function extractCreateFields(body) {
  return {
    article: body.article,
    parent: body.parent ?? null,
    body: body.body,
  };
}

/**
 * @desc   Get all comments for an article (non-deleted, oldest first)
 *         GET /articles/:articleId/comments
 */
const getCommentsForArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const { page, limit } = getPagination(req.query);

  const article = await Article.findById(articleId);

  if (!article || article.deleted) {
    return res.status(404).json({ message: 'Article not found' });
  }

  // Only allow comments listing on published articles
  if (article.status !== 'approved') {
    return res
      .status(403)
      .json({ message: 'Comments are not available for this article' });
  }

  const [items, total] = await Promise.all([
    Comment.findPublicForArticle(articleId, { page, limit }),
    Comment.countPublicForArticle(articleId),
  ]);

  return res.json({
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

/**
 * @desc   Get replies for a comment (non-deleted, oldest first)
 *         GET /comments/:id/replies
 */
const getRepliesForComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page, limit } = getPagination(req.query);

  const parentComment = await Comment.findById(id);

  if (!parentComment || parentComment.deleted) {
    return res.status(404).json({ message: 'Parent comment not found' });
  }

  const [items, total] = await Promise.all([
    Comment.findReplies(id, { page, limit }),
    Comment.countDocuments({ parent: id, deleted: false }),
  ]);

  return res.json({
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

/**
 * @desc   Get a single comment by ID
 *         GET /comments/:id
 */
const getCommentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment || comment.deleted) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  return res.json(comment);
});

/**
 * @desc   Create a new comment (ONLY USERS)
 *         POST /comments
 */
const postComment = asyncHandler(async (req, res) => {
  const { actorId, isUser } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!isUser) {
    return res.status(403).json({ message: 'Only users can create comments' });
  }

  const data = extractCreateFields(req.body);

  // Ensure article exists and is published
  const article = await Article.findById(data.article);
  if (!article || article.deleted) {
    return res.status(404).json({ message: 'Article not found' });
  }

  if (article.status !== 'approved') {
    return res.status(403).json({ message: 'Cannot comment on unpublished article' });
  }

  // If parent is provided, ensure it exists, is not deleted, belongs to same article
  if (data.parent) {
    const parentComment = await Comment.findById(data.parent);
    if (!parentComment || parentComment.deleted) {
      return res
        .status(400)
        .json({ message: 'Parent comment not found or deleted' });
    }
    if (parentComment.article.toString() !== data.article.toString()) {
      return res
        .status(400)
        .json({ message: 'Parent comment does not belong to this article' });
    }
  }

  const comment = new Comment({
    user: actorId,
    article: data.article,
    parent: data.parent || null,
    body: data.body,
  });

  const saved = await comment.save();
  return res.status(201).json(saved);
});

/**
 * @desc   Update a comment's body
 *         owner or admin
 *         PUT /comments/:id
 */
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const comment = await Comment.findById(id);

  if (!comment || comment.deleted) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  const isOwner = comment.belongsTo(actorId);

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .json({ message: 'You are not allowed to update this comment' });
  }

  const newBody = req.body && req.body.body;

  if (typeof newBody !== 'string' || newBody.trim().length < 1) {
    return res.status(400).json({ message: 'Comment body must not be empty' });
  }

  if (newBody.length > 5000) {
    return res
      .status(400)
      .json({ message: 'Comment cannot exceed 5000 characters' });
  }

  comment.body = newBody;
  const updated = await comment.save();

  return res.json(updated);
});

/**
 * @desc   Soft delete comment
 *         owner or admin
 *         DELETE /comments/:id
 */
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const comment = await Comment.findById(id);

  if (!comment || comment.deleted) {
    return res.status(404).json({ message: 'Comment not found' });
  }

  const isOwner = comment.belongsTo(actorId);

  if (!isOwner && !isAdmin) {
    return res
      .status(403)
      .json({ message: 'You are not allowed to delete this comment' });
  }

  await comment.softDelete();

  return res.json({ message: 'Comment deleted successfully' });
});

/**
 * @desc   Get comments authored by current user
 *         GET /me/comments
 */
const getMyComments = asyncHandler(async (req, res) => {
  const { actorId } = getActor(req);
  const { page, limit } = getPagination(req.query);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const [items, total] = await Promise.all([
    Comment.find({ user: actorId, deleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Comment.countDocuments({ user: actorId, deleted: false }),
  ]);

  return res.json({
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

module.exports = {
  getCommentsForArticle,
  getRepliesForComment,
  getCommentById,
  postComment,
  updateComment,
  deleteComment,
  getMyComments,
};
