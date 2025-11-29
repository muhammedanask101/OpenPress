const express = require('express');
const router = express.Router();
const { getArticles, postArticle, updateArticle, deleteArticle } = require('../controllers/articleController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getArticles);
router.post('/', protect, postArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

module.exports = router;