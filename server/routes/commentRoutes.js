// routes/commentRoutes.js
const express = require('express');
const router = express.Router();

const {
  getCommentsForArticle,
  getRepliesForComment,
  getCommentById,
  postComment,
  updateComment,
  deleteComment,
  getMyComments,
} = require('../controllers/commentController');

const { userprotect } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middlewares/sanitizeMiddleware');

// public

// All comments for an article (non-deleted, oldest first)
router.get( '/article/:articleId/comments', sanitizeMiddleware, getCommentsForArticle );

// Replies to a specific comment
router.get( '/comment/:id/replies', sanitizeMiddleware, getRepliesForComment );

// Get a single comment by ID
router.get( '/comment/:id', sanitizeMiddleware, getCommentById );

// users

// Create comment
router.post( '/createcomment', sanitizeMiddleware, userprotect, validateBody(schemas.commentCreate), postComment );

// Update comment
router.put( '/updatecomment/:id', sanitizeMiddleware, userprotect, validateBody(schemas.commentUpdate), updateComment );

// Delete comment (soft delete)
router.delete( '/deletecomment/:id', sanitizeMiddleware, userprotect, deleteComment );

// Current user's comments
router.get( '/mycomments', sanitizeMiddleware, userprotect, getMyComments );

module.exports = router;
