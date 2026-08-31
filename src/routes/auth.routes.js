const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  googleAuth,
  sendVerificationCode,
  verifyAccount,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', protect, getMe);
router.post('/verify/send', protect, sendVerificationCode);
router.post('/verify/confirm', protect, verifyAccount);

module.exports = router;
