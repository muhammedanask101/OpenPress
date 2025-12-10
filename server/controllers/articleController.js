const asyncHandler = require('express-async-handler');
const Article = require('../models/articleModel');

// parse pagination safely
function getPagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100; // hard cap

  return { page, limit };
}

// get actor info (user or admin)
function getActor(req) {
  const isUser = !!req.user;
  const isAdmin = !!req.admin;

  const actorId =
    (req.user && req.user._id) ||
    (req.admin && req.admin._id) ||
    null;

  return { actorId, isUser, isAdmin };
}

// only allow safe fields for create
function extractCreateFields(body) {
  return {
    title: body.title,
    body: body.body,
    preview: body.preview ?? undefined,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };
}

// only allow safe fields for update
function extractUpdateFields(body, isAdmin) {
  const update = {};

  if (typeof body.title === 'string') update.title = body.title;
  if (typeof body.body === 'string') update.body = body.body;
  if (body.preview !== undefined) update.preview = body.preview;
  if (Array.isArray(body.tags)) update.tags = body.tags;

  // Only admins can change status
  if (isAdmin && typeof body.status === 'string') {
    update.status = body.status;
  }

  return update;
}

/**
 * @desc   List articles
 *         - ?page=1&limit=10
 *         - ?q=search term (text search on title/body)
 *         - ?tag=someTag
 *         - ?author=<userId>
 *         - ?status=pending|approved|rejected (admin only)
 */
const getArticles = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { q, tag, author, status } = req.query;
  const { isAdmin } = getActor(req);

  // Search path (public-only, approved + not deleted)
  if (q && typeof q === 'string' && q.trim().length > 0) {
    const [items, total] = await Promise.all([
      // searchPublic returns a Query — we can populate it
      Article.searchPublic(q, { page, limit }).populate('author', 'name'),
      Article.countDocuments({
        $text: { $search: q },
        status: 'approved',
        deleted: false,
      }),
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
  }

  // Admin listing – can see everything and filter by status
  if (isAdmin) {
    const filter = {};

    if (status) filter.status = status;
    if (author) filter.author = author;
    if (tag) filter.tags = tag;

    const [items, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name'),
      Article.countDocuments(filter),
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
  }

  // Public listing – only approved + not deleted (uses model static)
  const publicFilter = {};
  if (author) publicFilter.author = author;
  if (tag) publicFilter.tags = tag;

  // Article.findApproved returns a Query, so we can populate it directly
  const itemsQuery = Article.findApproved
    ? Article.findApproved(publicFilter, { page, limit }).populate('author', 'name')
    : Article.find({ status: 'approved', deleted: false, ...publicFilter })
        .sort({ publishDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name');

  const [items, total] = await Promise.all([
    itemsQuery,
    Article.countDocuments({ status: 'approved', deleted: false, ...publicFilter }),
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
 * @desc   Get one article by ID
 *         - Public sees only approved + not deleted
 *         - Admin/owner can see even if pending/rejected
 */
const getArticleById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  // populate the author name
  const article = await Article.findById(id).populate('author', 'name');

  if (!article || article.deleted) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const isOwner =
    actorId && article.author && article.author._id && article.author._id.toString() === actorId.toString();

  if (article.status !== 'approved' && !isAdmin && !isOwner) {
    return res.status(403).json({ message: 'You are not allowed to view this article' });
  }

  return res.json(article);
});

/**
 * @desc   Get one article by slug (public) + increment views
 */
const getArticleBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // populate author
  const article = await Article.findBySlug(slug).populate('author', 'name');

  if (!article) {
    return res.status(404).json({ message: 'Article not found' });
  }

  if (!article.isPublished) {
    return res.status(403).json({ message: 'Article is not published' });
  }

  // Increment views via model method (non-blocking)
  try {
    await article.incrementViews();
  } catch (err) {
    console.error('Failed to increment views for article', article._id, err);
  }

  return res.json(article);
});

/**
 * @desc   Create new article
 *         - ONLY normal users (req.user) can create
 *         - Uses validated & sanitized body (articleCreate)
 */
const postArticle = asyncHandler(async (req, res) => {
  const { actorId, isUser } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!isUser) {
    return res.status(403).json({ message: 'Only users can create articles' });
  }

  const data = extractCreateFields(req.body);

  const article = new Article({
    ...data,
    author: actorId,
    // status defaults to 'pending' from schema
  });

  const saved = await article.save();

  // populate author before returning
  const populated = await Article.findById(saved._id).populate('author', 'name');

  return res.status(201).json(populated);
});

/**
 * @desc   Update article
 *         - Owner can update content fields
 *         - Only admins can change status
 */
const updateArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const article = await Article.findById(id);

  if (!article || article.deleted) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const isOwner =
    article.author && article.author.toString() === actorId.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'You are not allowed to update this article' });
  }

  const update = extractUpdateFields(req.body, isAdmin);

  Object.assign(article, update);

  const updated = await article.save();
  // populate author for the response
  const populated = await Article.findById(updated._id).populate('author', 'name');

  return res.json(populated);
});

/**
 * @desc   Soft delete article
 *         - Owner or admin
 */
const deleteArticle = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const article = await Article.findById(id);

  if (!article || article.deleted) {
    return res.status(404).json({ message: 'Article not found' });
  }

  const isOwner =
    article.author && article.author.toString() === actorId.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'You are not allowed to delete this article' });
  }

  await article.softDelete();

  return res.json({ message: 'Article deleted successfully' });
});

/**
 * @desc   Get articles authored by current user/admin
 */
const getMyArticles = asyncHandler(async (req, res) => {
  const { actorId } = getActor(req);
  const { page, limit } = getPagination(req.query);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const [items, total] = await Promise.all([
    Article.find({ author: actorId, deleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('author', 'name'),
    Article.countDocuments({ author: actorId, deleted: false }),
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
  getArticles,
  getArticleById,
  getArticleBySlug,
  postArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
};
