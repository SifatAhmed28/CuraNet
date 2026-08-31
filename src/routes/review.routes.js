const express = require('express');
const router = express.Router();
const { createReview, getDoctorReviews } = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');

router.post('/', protect, createReview);
router.get('/doctor/:doctorId', getDoctorReviews);

module.exports = router;
