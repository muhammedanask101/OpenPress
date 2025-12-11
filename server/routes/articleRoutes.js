// routes/articleRoutes.js
const express = require('express');
const router = express.Router();

const {
  getArticles,
  getArticleById,
  getArticleBySlug,
  postArticle,
  updateArticle,
  deleteArticle,
  getMyArticles,
} = require('../controllers/articleController');

const { userprotect, protect, authEither } = require('../middlewares/authMiddleware');
const { sanitizeMiddleware, validateBody, schemas, } = require('../middlewares/sanitizeMiddleware');

//public

// List articles (public, with optional search/filter)
router.get('/getarticles', sanitizeMiddleware, getArticles);

// Get article by slug (public, increments views)
router.get('/slug/:slug', sanitizeMiddleware, getArticleBySlug);

// Get article by ID (public; non-approved restricted in controller)
router.get('/getarticles/:id', sanitizeMiddleware, getArticleById);

// users

// Create article – only users can create (enforced in userprotect + controller)
router.post( '/postarticle', sanitizeMiddleware, userprotect, validateBody(schemas.articleCreate), postArticle );

// Update article – only owner user can update (controller checks ownership)
router.put( '/updatearticle/:id', sanitizeMiddleware, authEither, validateBody(schemas.articleUpdate), updateArticle );

// Delete article (soft delete) – only owner user can delete
router.delete( '/deletearticles/:id', sanitizeMiddleware, protect, deleteArticle );

// Get articles authored by current user
router.get( '/getmyarticles', sanitizeMiddleware, userprotect, getMyArticles );

module.exports = router;

