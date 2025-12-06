const express = require('express');
const router = express.Router();

const {
  getQuestions,
  getQuestionById,
  postQuestion,
  updateQuestion,
  deleteQuestion,
  getMyQuestions,
} = require('../controllers/questionController');

const { userprotect, protect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middlewares/sanitizeMiddleware');

// public routes

// List questions (public, with optional search/filter: q, tag, author, page, limit)
router.get('/getquestions', sanitizeMiddleware, getQuestions);

// Get question by ID (public, increments views)
router.get('/getquestions/:id', sanitizeMiddleware, getQuestionById);

// user routes

// Create question – only users can create (enforced in userprotect + controller)
router.post( '/postquestions', sanitizeMiddleware, userprotect, validateBody(schemas.questionCreate), postQuestion );

// Update question – only owner user (or admin, if you later add an admin route) can update
router.put( '/updatequestion/:id', sanitizeMiddleware, protect, validateBody(schemas.questionUpdate), updateQuestion );

// Delete question (soft delete) – only owner user (or admin if you add admin route) can delete
router.delete( '/updatequestion/:id', sanitizeMiddleware, protect, deleteQuestion );

// Get questions authored by current user
router.get( '/getmyquestions', sanitizeMiddleware, userprotect, getMyQuestions );

module.exports = router;
