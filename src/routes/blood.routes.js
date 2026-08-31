const express = require('express');
const router = express.Router();
const {
  listBloodRequests,
  createBloodRequest,
  updateBloodRequest,
  listDonors,
  registerDonor,
  createDonation,
  getBloodStats,
} = require('../controllers/blood.controller');
const { protect } = require('../middleware/auth');

router.get('/stats', getBloodStats);
router.get('/requests', listBloodRequests);
router.post('/requests', protect, createBloodRequest);
router.put('/requests/:id', protect, updateBloodRequest);
router.get('/donors', listDonors);
router.post('/donors', protect, registerDonor);
router.post('/donations', protect, createDonation);

module.exports = router;
