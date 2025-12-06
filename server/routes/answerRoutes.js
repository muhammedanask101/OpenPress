const express = require('express');
const router = express.Router();

const {
  getAnswersByQuestion,
  getTopAnswersByQuestion,
  getAnswerById,
  postAnswer,
  updateAnswer,
  deleteAnswer,
  getMyAnswers,
} = require('../controllers/answerController');

const { userprotect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middlewares/sanitizeMiddleware');

// public

// Newest answers for a question
router.get( '/question/:questionId/answers', sanitizeMiddleware, getAnswersByQuestion );

// Top answers by stars for a question
router.get( '/question/:questionId/answers/top', sanitizeMiddleware, getTopAnswersByQuestion );

// Get a single answer by ID (increments views)
router.get( '/answer/:id', sanitizeMiddleware, getAnswerById );

// users

// Create answer
router.post( '/postanswer', sanitizeMiddleware, userprotect,validateBody(schemas.answerCreate), postAnswer );

// Update answer
router.put( '/updateanswer/:id', sanitizeMiddleware, userprotect, updateAnswer );

// Delete answer (soft delete)
router.delete( '/answers/:id', sanitizeMiddleware, userprotect, deleteAnswer );

// Get current user's answers
router.get( '/myanswers', sanitizeMiddleware, userprotect, getMyAnswers );

module.exports = router;
