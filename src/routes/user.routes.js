const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getPublicUser,
  listAllUsers,
  updateUserRole,
  getAdminStats,
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.get('/', protect, authorize('admin'), listAllUsers);
router.put('/:id/role', protect, authorize('admin'), updateUserRole);
router.get('/:id', getPublicUser);

module.exports = router;
