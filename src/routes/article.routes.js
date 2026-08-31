const express = require('express');
const router = express.Router();
const { listArticles, getArticle, likeArticle } = require('../controllers/article.controller');
const { protect } = require('../middleware/auth');

router.get('/', listArticles);
router.get('/:slug', getArticle);
router.post('/:id/like', likeArticle);

module.exports = router;
