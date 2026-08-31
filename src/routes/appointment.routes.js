const express = require('express');
const router = express.Router();
const {
  createAppointment,
  listAppointments,
  updateAppointment,
  addPrescription,
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createAppointment);
router.get('/', protect, listAppointments);
router.put('/:id', protect, updateAppointment);
router.put('/:id/prescription', protect, authorize('doctor', 'admin'), addPrescription);

module.exports = router;
