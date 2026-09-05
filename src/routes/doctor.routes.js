const express = require('express');
const router = express.Router();
const {
  listDoctors,
  getDoctor,
  matchDoctors,
  getDoctorLocations,
  getMyDoctorProfile,
  updateMyDoctorProfile,
  createDoctorProfile,
  updateDoctorProfile,
} = require('../controllers/doctor.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/match', matchDoctors);
router.get('/locations', getDoctorLocations);
router.get('/me', protect, authorize('doctor', 'admin'), getMyDoctorProfile);
router.put('/me', protect, authorize('doctor', 'admin'), updateMyDoctorProfile);
router.get('/', listDoctors);
router.get('/:id', getDoctor);
router.post('/', protect, authorize('doctor', 'admin'), createDoctorProfile);
router.put('/:id', protect, authorize('doctor', 'admin'), updateDoctorProfile);

module.exports = router;
