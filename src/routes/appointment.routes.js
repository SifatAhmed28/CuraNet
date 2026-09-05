const express = require('express');
const router = express.Router();
const {
  createAppointment,
  listAppointments,
  updateAppointment,
  cancelAppointment,
  addPrescription,
  getDoctorSlots,
  createPaymentIntent,
  confirmPayment,
} = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middleware/auth');

router.get('/doctor/:doctorId/slots', getDoctorSlots);
router.post('/payment-intent', protect, createPaymentIntent);
router.post('/confirm-payment', protect, confirmPayment);

router.post('/', protect, createAppointment);
router.get('/', protect, listAppointments);
router.put('/:id', protect, updateAppointment);
router.put('/:id/cancel', protect, cancelAppointment);
router.put('/:id/prescription', protect, authorize('doctor', 'admin'), addPrescription);

module.exports = router;
