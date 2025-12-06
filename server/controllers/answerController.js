const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');
const Answer = require('../models/answerModel');
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
    body: body.body,
  };
}

/**
 * @desc   List answers for a question (public, non-deleted, newest first)
 *         - route: GET /questions/:questionId/answers
 *         - supports ?page=1&limit=20
 */
const getAnswersByQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { page, limit } = getPagination(req.query);

  // Ensure question exists and is not deleted
  const question = await Question.findById(questionId);
  if (!question || question.deleted) {
    return res.status(404).json({ message: 'Question not found' });
  }

  const [items, total] = await Promise.all([
    Answer.findPublicByQuestion(questionId, { page, limit }),
    Answer.countPublicByQuestion(questionId),
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
 * @desc   List answers for a question sorted by MOST STARS
 *         - route: GET /questions/:questionId/answers/top
 *         - supports ?page=1&limit=20
 *         - Uses Star collection via aggregation; does NOT store stars on answers
 */
const getTopAnswersByQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const { page, limit } = getPagination(req.query);

  // Ensure question exists and is not deleted
  const question = await Question.findById(questionId);
  if (!question || question.deleted) {
    return res.status(404).json({ message: 'Question not found' });
  }

  if (!mongoose.isValidObjectId(questionId)) {
    return res.status(400).json({ message: 'Invalid question ID' });
  }

  const questionObjectId = new mongoose.Types.ObjectId(questionId);

  // Aggregate answers with star counts using Star collection
  const pipeline = [
    {
      $match: {
        question: questionObjectId,
        deleted: false,
      },
    },
    {
      $lookup: {
        from: 'stars',
        let: { answerId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$itemType', 'answer'] },
                  { $eq: ['$itemId', '$$answerId'] },
                  { $eq: ['$deleted', false] },
                ],
              },
            },
          },
          {
            $count: 'count',
          },
        ],
        as: 'starStats',
      },
    },
    {
      $addFields: {
        starCount: {
          $ifNull: [{ $arrayElemAt: ['$starStats.count', 0] }, 0],
        },
      },
    },
    {
      $sort: {
        starCount: -1,
        createdAt: 1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: limit,
    },
    {
      $project: {
        starStats: 0,
      },
    },
  ];

  const [items, total] = await Promise.all([
    Answer.aggregate(pipeline),
    Answer.countDocuments({ question: questionObjectId, deleted: false }),
  ]);

  // normalize shape to include `id` like normal Mongoose docs
  const normalized = items.map((doc) => {
    const obj = { ...doc };
    obj.id = obj._id;
    delete obj._id;
    return obj;
  });

  return res.json({
    data: normalized,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  });
});

/**
 * @desc   Get a single answer by ID (public) + increment views
 *         - route: GET /answers/:id
 */
const getAnswerById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const answer = await Answer.findById(id);

  if (!answer || answer.deleted) {
    return res.status(404).json({ message: 'Answer not found' });
  }

  // Increment views (non-blocking if it fails)
  try {
    await answer.incrementViews();
  } catch (err) {
    console.error('Failed to increment views for answer', answer._id, err);
  }

  return res.json(answer);
});

/**
 * @desc   Create an answer
 *         - ONLY normal users can create (req.user)
 *         - Uses sanitized + validated body (schemas.answerCreate)
 *         - route: POST /answers
 */
const postAnswer = asyncHandler(async (req, res) => {
  const { actorId, isUser } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  if (!isUser) {
    return res.status(403).json({ message: 'Only users can create answers' });
  }

  const data = extractCreateFields(req.body);

  // Ensure referenced question exists and is not deleted
  const question = await Question.findById(data.question);
  if (!question || question.deleted) {
    return res.status(404).json({ message: 'Question not found' });
  }

  const answer = new Answer({
    question: data.question,
    body: data.body,
    author: actorId,
  });

  const saved = await answer.save();
  return res.status(201).json(saved);
});

/**
 * @desc   Update an answer's body
 *         - Owner can update
 *         - Admin can also update (if you add admin routes/middleware)
 *         - route: PUT /answers/:id
 */
const updateAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const answer = await Answer.findById(id);

  if (!answer || answer.deleted) {
    return res.status(404).json({ message: 'Answer not found' });
  }

  const isOwner =
    answer.author && answer.author.toString() === actorId.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'You are not allowed to update this answer' });
  }

  const newBody = req.body && req.body.body;

  if (typeof newBody !== 'string' || newBody.trim().length < 1) {
    return res.status(400).json({ message: 'Answer body must not be empty' });
  }

  if (newBody.length > 10000) {
    return res.status(400).json({ message: 'Answer cannot exceed 10000 characters' });
  }

  // Use model helper to update body (keeps logic centralized)
  const updated = await answer.updateBody(newBody);
  return res.json(updated);
});

/**
 * @desc   Soft delete answer
 *         - Owner or admin
 *         - route: DELETE /answers/:id
 */
const deleteAnswer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { actorId, isAdmin } = getActor(req);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const answer = await Answer.findById(id);

  if (!answer || answer.deleted) {
    return res.status(404).json({ message: 'Answer not found' });
  }

  const isOwner =
    answer.author && answer.author.toString() === actorId.toString();

  if (!isAdmin && !isOwner) {
    return res.status(403).json({ message: 'You are not allowed to delete this answer' });
  }

  await answer.softDelete();

  return res.json({ message: 'Answer deleted successfully' });
});

/**
 * @desc   Get answers authored by current user/admin
 *         - route: GET /me/answers
 */
const getMyAnswers = asyncHandler(async (req, res) => {
  const { actorId } = getActor(req);
  const { page, limit } = getPagination(req.query);

  if (!actorId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  const [items, total] = await Promise.all([
    Answer.find({ author: actorId, deleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Answer.countDocuments({ author: actorId, deleted: false }),
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
  getAnswersByQuestion,
  getTopAnswersByQuestion,
  getAnswerById,
  postAnswer,
  updateAnswer,
  deleteAnswer,
  getMyAnswers,
};
