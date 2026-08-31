const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getPublicUser } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/:id', getPublicUser);

module.exports = router;
