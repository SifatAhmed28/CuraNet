const Appointment = require('../models/Appointment');
const DoctorProfile = require('../models/DoctorProfile');

/**
 * POST /api/appointments
 */
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot, consultationType, reason } = req.body;

    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId: doctor._id,
      doctorUserId: doctor.userId,
      appointmentDate,
      timeSlot,
      consultationType: consultationType || 'offline',
      reason,
      fee: doctor.consultationFee,
      ruleMatchMeta: {
        matchedSpecialty: doctor.specialization[0],
        matchedLocation: true,
        matchedAvailability: true,
        matchedAt: new Date(),
      },
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialization clinicName clinicAddress chamber city district consultationFee education')
      .populate('doctorUserId', 'name email phone avatarUrl')
      .populate('patientId', 'name email phone')
      .lean();

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments?role=patient|doctor&status=
 */
exports.listAppointments = async (req, res, next) => {
  try {
    const { status, role } = req.query;
    const filter = {};

    // Role-based visibility
    if (req.user.role === 'admin') {
      // Admin has full system visibility across all appointments
    } else if (req.user.role === 'doctor' || role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
      filter.$or = [
        ...(doctorProfile ? [{ doctorId: doctorProfile._id }] : []),
        { doctorUserId: req.user._id },
      ];
    } else {
      filter.patientId = req.user._id;
    }

    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'name specialization clinicName clinicAddress chamber city district consultationFee education')
      .populate('doctorUserId', 'name email phone avatarUrl')
      .populate('patientId', 'name email phone')
      .sort({ appointmentDate: -1 })
      .lean();

    res.json({ success: true, data: appointments });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/appointments/:id — update status
 */
exports.updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
    const isPatient = appointment.patientId && appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = (appointment.doctorUserId && appointment.doctorUserId.toString() === req.user._id.toString()) ||
                     (doctorProfile && appointment.doctorId && appointment.doctorId.toString() === doctorProfile._id.toString());

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this appointment' });
    }

    const { status, notes, appointmentDate, timeSlot, consultationType } = req.body;
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    if (appointmentDate) appointment.appointmentDate = new Date(appointmentDate);
    if (timeSlot) appointment.timeSlot = timeSlot;
    if (consultationType) appointment.consultationType = consultationType;

    await appointment.save();

    res.json({ success: true, message: 'Appointment updated successfully', data: appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/appointments/:id/cancel
 */
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
    const isPatient = appointment.patientId && appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = (appointment.doctorUserId && appointment.doctorUserId.toString() === req.user._id.toString()) ||
                     (doctorProfile && appointment.doctorId && appointment.doctorId.toString() === doctorProfile._id.toString());

    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this appointment' });
    }

    appointment.status = 'cancelled';
    if (appointment.paymentStatus === 'paid') {
      appointment.paymentStatus = 'refunded';
    }
    appointment.notes = req.body.reason || req.body.notes || (isDoctor ? 'Cancelled by doctor' : 'Cancelled by patient');
    await appointment.save();

    res.json({ success: true, message: 'Appointment cancelled successfully', data: appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/appointments/:id/prescription
 */
exports.addPrescription = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    if (appointment.doctorUserId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only the assigned doctor can add prescriptions' });
    }

    appointment.prescriptionNotes = req.body.prescriptionNotes;
    appointment.status = 'completed';
    await appointment.save();

    res.json({ success: true, data: appointment });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/appointments/doctor/:doctorId/slots?date=YYYY-MM-DD
 * Returns available time slots for a doctor on a specific date, marking booked slots
 */
exports.getDoctorSlots = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const targetDate = date ? new Date(date) : new Date();
    // Normalize date to midnight UTC/local comparison range
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get all existing active appointments for that doctor on that date
    const bookedAppointments = await Appointment.find({
      doctorId: doctor._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $nin: ['cancelled'] },
    }).select('timeSlot.startTime').lean();

    const bookedStartTimes = new Set(bookedAppointments.map((a) => a.timeSlot?.startTime));

    // Determine day of week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayOfWeek = days[targetDate.getDay()];

    // Generate slots: either from doctor's availabilitySlots or standard template
    let slots = [];
    const matchedAvailability = (doctor.availabilitySlots || []).filter(
      (s) => s.dayOfWeek === dayOfWeek && s.isAvailable
    );

    if (matchedAvailability.length > 0) {
      matchedAvailability.forEach((s) => {
        slots.push({
          startTime: s.startTime,
          endTime: s.endTime,
          dayOfWeek: s.dayOfWeek,
          isAvailable: !bookedStartTimes.has(s.startTime),
        });
      });
    }

    // Default template slots if doctor has no specific slots registered for this day
    if (slots.length === 0) {
      const defaultSlots = [
        { startTime: '09:00', endTime: '09:30', period: 'Morning' },
        { startTime: '09:30', endTime: '10:00', period: 'Morning' },
        { startTime: '10:00', endTime: '10:30', period: 'Morning' },
        { startTime: '10:30', endTime: '11:00', period: 'Morning' },
        { startTime: '11:00', endTime: '11:30', period: 'Morning' },
        { startTime: '11:30', endTime: '12:00', period: 'Morning' },
        { startTime: '14:00', endTime: '14:30', period: 'Afternoon' },
        { startTime: '14:30', endTime: '15:00', period: 'Afternoon' },
        { startTime: '15:00', endTime: '15:30', period: 'Afternoon' },
        { startTime: '15:30', endTime: '16:00', period: 'Afternoon' },
        { startTime: '16:00', endTime: '16:30', period: 'Evening' },
        { startTime: '16:30', endTime: '17:00', period: 'Evening' },
        { startTime: '17:00', endTime: '17:30', period: 'Evening' },
      ];

      slots = defaultSlots.map((s) => ({
        ...s,
        dayOfWeek,
        isAvailable: !bookedStartTimes.has(s.startTime),
      }));
    }

    res.json({
      success: true,
      data: {
        doctorId: doctor._id,
        doctorName: doctor.userId?.name,
        date: targetDate.toISOString().slice(0, 10),
        dayOfWeek,
        fee: doctor.consultationFee,
        slots,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/appointments/payment-intent
 * Creates Stripe PaymentIntent for the appointment consultation fee
 */
exports.createPaymentIntent = async (req, res, next) => {
  try {
    const { doctorId, appointmentDate, timeSlot } = req.body;

    const doctor = await DoctorProfile.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (!timeSlot || !timeSlot.startTime) {
      return res.status(400).json({ success: false, message: 'Time slot is required' });
    }

    // Check if time slot already taken
    const targetDate = new Date(appointmentDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Appointment.findOne({
      doctorId: doctor._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      'timeSlot.startTime': timeSlot.startTime,
      status: { $nin: ['cancelled'] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked. Please choose a different slot.',
      });
    }

    const feeAmount = Number(doctor.consultationFee) || 500;
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    let clientSecret = '';
    let paymentIntentId = '';

    // If a valid live or test key is set in .env
    if (stripeKey && !stripeKey.includes('your_') && stripeKey.startsWith('sk_')) {
      try {
        const stripe = require('stripe')(stripeKey);
        // Stripe requires amount in smallest currency unit (cents or poisha)
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(feeAmount * 100),
          currency: 'bdt',
          description: `CuraNet Doctor Consultation - Dr. ${doctor.userId?.name || 'Specialist'}`,
          metadata: {
            doctorId: doctor._id.toString(),
            patientId: req.user._id.toString(),
            appointmentDate: targetDate.toISOString(),
            startTime: timeSlot.startTime,
          },
        });
        clientSecret = paymentIntent.client_secret;
        paymentIntentId = paymentIntent.id;
      } catch (stripeErr) {
        console.warn('[Stripe API Note]', stripeErr.message);
        // Fallback to simulated sandbox intent if BDT or key restricts intent
        paymentIntentId = `pi_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        clientSecret = `${paymentIntentId}_secret_${Math.random().toString(36).substring(2, 10)}`;
      }
    } else {
      // Sandbox test mode for immediate local testing
      paymentIntentId = `pi_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      clientSecret = `${paymentIntentId}_secret_test`;
    }

    res.json({
      success: true,
      data: {
        clientSecret,
        paymentIntentId,
        amount: feeAmount,
        currency: 'BDT',
        doctor: {
          id: doctor._id,
          fee: feeAmount,
          specialization: doctor.specialization,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/appointments/confirm-payment
 * Confirms payment and reserves the appointment
 */
exports.confirmPayment = async (req, res, next) => {
  try {
    const {
      doctorId,
      appointmentDate,
      timeSlot,
      consultationType,
      reason,
      paymentIntentId,
    } = req.body;

    const doctor = await DoctorProfile.findById(doctorId).populate('userId', 'name');
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const targetDate = new Date(appointmentDate);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Double-booking check
    const existing = await Appointment.findOne({
      doctorId: doctor._id,
      appointmentDate: { $gte: startOfDay, $lte: endOfDay },
      'timeSlot.startTime': timeSlot.startTime,
      status: { $nin: ['cancelled'] },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already reserved. Please select another time.',
      });
    }

    // Verify Stripe payment intent if live production key
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (
      stripeKey &&
      stripeKey.startsWith('sk_live_') &&
      paymentIntentId &&
      !paymentIntentId.startsWith('pi_sandbox_') &&
      !paymentIntentId.startsWith('pi_mock_') &&
      !paymentIntentId.startsWith('pi_test_')
    ) {
      try {
        const stripe = require('stripe')(stripeKey);
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (pi.status !== 'succeeded' && pi.status !== 'requires_capture') {
          return res.status(400).json({
            success: false,
            message: `Stripe payment incomplete. Status: ${pi.status}`,
          });
        }
      } catch (piErr) {
        console.warn('[Stripe verification note]', piErr.message);
      }
    }

    const resolvedDayOfWeek = (
      (timeSlot && timeSlot.dayOfWeek) ||
      targetDate.toLocaleDateString('en-US', { weekday: 'long' }) ||
      'monday'
    ).toLowerCase();

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId: doctor._id,
      doctorUserId: doctor.userId ? (doctor.userId._id || doctor.userId) : null,
      appointmentDate: targetDate,
      timeSlot: {
        startTime: timeSlot?.startTime || '09:00',
        endTime: timeSlot?.endTime || '09:30',
        dayOfWeek: resolvedDayOfWeek,
      },
      consultationType: consultationType || 'offline',
      reason: reason || 'Specialist Consultation',
      fee: doctor.consultationFee,
      status: 'confirmed',
      paymentStatus: 'paid',
      paymentMethod: req.body.paymentMethod || 'stripe',
      stripePaymentIntentId: paymentIntentId || `pi_rec_${Date.now()}`,
      paidAt: new Date(),
      ruleMatchMeta: {
        matchedSpecialty: doctor.specialization?.[0] || 'General',
        matchedLocation: true,
        matchedAvailability: true,
        matchedAt: new Date(),
      },
    });

    const populated = await Appointment.findById(appointment._id)
      .populate('doctorId', 'name specialization clinicName clinicAddress chamber city district consultationFee education')
      .populate('doctorUserId', 'name email phone avatarUrl')
      .populate('patientId', 'name email phone')
      .lean();

    res.status(201).json({
      success: true,
      message: 'Appointment confirmed and payment received successfully!',
      data: populated,
    });
  } catch (err) {
    next(err);
  }
};
