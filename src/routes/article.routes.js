const express = require('express');
const router = express.Router();
const { listArticles, getArticle, likeArticle, createArticle } = require('../controllers/article.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/', listArticles);
router.post('/', protect, authorize('doctor', 'admin'), createArticle);
router.get('/:slug', getArticle);
router.post('/:id/like', likeArticle);

module.exports = router;
