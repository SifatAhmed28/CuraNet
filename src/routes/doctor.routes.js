const express = require('express');
const router = express.Router();
const {
  listDoctors,
  getDoctor,
  matchDoctors,
  createDoctorProfile,
  updateDoctorProfile,
} = require('../controllers/doctor.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/match', matchDoctors);
router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.post('/', protect, authorize('doctor', 'admin'), createDoctorProfile);
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctorProfile);

module.exports = router;
