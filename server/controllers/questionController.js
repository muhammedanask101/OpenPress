// controllers/questionController.js
const asyncHandler = require('express-async-handler');
const Question = require('../models/questionModel');

// Helper: parse pagination safely
function getPagination(query) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (Number.isNaN(page) || page < 1) page = 1;
  if (Number.isNaN(limit) || limit < 1) limit = 10;
  if (limit > 100) limit = 100; // hard cap

  return { page, limit };
}

// Helper: get actor info (user or admin)
function getActor(req) {
  const isUser = !!req.user;
  const isAdmin = !!req.admin;

  const actorId =
    (req.user && req.user._id) ||
    (req.admin && req.admin._id) ||
    null;

  return { actorId, isUser, isAdmin };
}

// Helper: allowed fields on create
function extractCreateFields(body) {
  return {
    question: body.question,
    context: body.context ?? undefined,
    tags: Array.isArray(body.tags) ? body.tags : [],
  };
}

// Helper: allowed fields on update
function extractUpdateFields(body) {
  const update = {};

  if (typeof body.question === 'string') update.question = body.question;
  if (body.context !== undefined) update.context = body.context;
  if (Array.isArray(body.tags)) update.tags = body.tags;

  return update;
}


const getQuestions = asyncHandler(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { q, tag, author } = req.query;
  const { isAdmin } = getActor(req);

  // Search path (public-only, non-deleted)
  if (q && typeof q === 'string' && q.trim().length > 0) {
    const [items, total] = await Promise.all([
      Question.searchPublic(q, { page, limit }),
      Question.countDocuments({
        $text: { $search: q },
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

  // Admin listing – can be extended later to include deleted
  if (isAdmin) {
    const filter = {};
    if (author) filter.author = author;
    if (tag) filter.tags = tag;

    const [items, total] = await Promise.all([
      Question.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Question.countDocuments(filter),
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

  // Public listing – only non-deleted (uses model static)
  const publicFilter = {};
  if (author) publicFilter.author = author;
  if (tag) publicFilter.tags = tag;

  const [items, total] = await Promise.all([
    Question.findPublic(publicFilter, { page, limit }),
    Question.countDocuments({ deleted: false, ...publicFilter }),
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
 * @desc   Get one question by ID (public) + increment views
 *         - deleted questions return 404 for everyone here
 */
const getQuestionById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const question = await Question.findById(id);

  if (!question || question.deleted) {
    return res.status(404).json({ message: 'Question not found' });
  }

  // Increment views via model method (now atomic)
  try {
    await question.incrementViews();
  } catch (err) {
    console.error('Failed to increment views for question', question._id, err);
  }

  return res.json(question);
});

/**
 * @desc   Create new question
 *         - ONLY normal users can create (req.user)
 *         - Uses sanitized + validated body (questionCreate)
 */
const postQuestion = asyncHandler(async (req, res) => {
  const { actorId, isUser } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!isUser) {
    return res.status(403).json({ message: 'Only users can create questions' });
  }

  const data = extractCreateFields(req.body);

  const question = new Question({
    ...data,
    author: actorId,
  });

  const saved = await question.save();
  return res.status(201).json(saved);
});

/**
 * @desc   Update question
 *         - Owner can update their question
 *         - Admins can also update (if route uses protect)
 */
const updateQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const question = await Question.findById(id);

  if (!question || question.deleted) {
    return res.status(404).json({ message: 'Question not found' });
  }

  const isOwner =
    question.author && question.author.toString() === actorId.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'You are not allowed to update this question' });
  }

  const update = extractUpdateFields(req.body);

  Object.assign(question, update);

  const updated = await question.save();
  return res.json(updated);
});

/**
 * @desc   Soft delete question
 *         - Owner or admin
 */
const deleteQuestion = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const question = await Question.findById(id);

  if (!question || question.deleted) {
    return res.status(404).json({ message: 'Question not found' });
  }

  const isOwner =
    question.author && question.author.toString() === actorId.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'You are not allowed to delete this question' });
  }

  await question.softDelete();

  return res.json({ message: 'Question deleted successfully' });
});

/**
 * @desc   Get questions authored by current user/admin
 */
const getMyQuestions = asyncHandler(async (req, res) => {
  const { actorId } = getActor(req);
  const { page, limit } = getPagination(req.query);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const [items, total] = await Promise.all([
    Question.find({ author: actorId, deleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Question.countDocuments({ author: actorId, deleted: false }),
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
  getQuestions,
  getQuestionById,
  postQuestion,
  updateQuestion,
  deleteQuestion,
  getMyQuestions,
};
