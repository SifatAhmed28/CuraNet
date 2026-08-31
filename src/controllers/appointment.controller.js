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
      .populate('doctorId', 'specialization clinicName clinicAddress consultationFee')
      .populate('doctorUserId', 'name')
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

    // If doctor, show their appointments; otherwise show patient's
    if (req.user.role === 'doctor' || role === 'doctor') {
      const doctorProfile = await DoctorProfile.findOne({ userId: req.user._id });
      if (doctorProfile) {
        filter.doctorId = doctorProfile._id;
      } else {
        return res.json({ success: true, data: [] });
      }
    } else {
      filter.patientId = req.user._id;
    }

    if (status) filter.status = status;

    const appointments = await Appointment.find(filter)
      .populate('doctorId', 'specialization clinicName clinicAddress consultationFee')
      .populate('doctorUserId', 'name avatarUrl')
      .populate('patientId', 'name avatarUrl')
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

    // Only patient or doctor can update
    const isPatient = appointment.patientId.toString() === req.user._id.toString();
    const isDoctor = appointment.doctorUserId.toString() === req.user._id.toString();
    if (!isPatient && !isDoctor && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { status, notes } = req.body;
    if (status) appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    res.json({ success: true, data: appointment });
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
