const mongoose = require('mongoose');

const timeSlotEmbedded = new mongoose.Schema({
  startTime: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM'] },
  endTime: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM'] },
  dayOfWeek: { type: String, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true, index: true },
  doctorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
  appointmentDate: { type: Date, required: true, index: true },
  timeSlot: { type: timeSlotEmbedded, required: true },
  consultationType: { type: String, enum: ['online','offline'], required: true, default: 'offline' },
  status: { type: String, enum: ['pending','confirmed','cancelled','completed','no_show'], default: 'pending', index: true },
  reason: { type: String, required: true, maxlength: 500 },
  notes: { type: String, maxlength: 1000 },
  fee: { type: Number, required: true, min: 0 },
  prescriptionNotes: { type: String, maxlength: 2000 },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid', index: true },
  paymentMethod: { type: String, default: 'stripe' },
  stripePaymentIntentId: { type: String, index: true },
  paidAt: { type: Date },
  currency: { type: String, default: 'bdt' },
  // Transparent rule-based matching metadata (NOT AI black-box)
  ruleMatchMeta: {
    matchedSpecialty: { type: String },
    matchedLocation: { type: Boolean },
    matchedAvailability: { type: Boolean },
    distanceKm: { type: Number },
    matchedAt: { type: Date, default: Date.now }
  }
}, { timestamps: true });

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, 'timeSlot.startTime': 1 }, { unique: true, name: 'no_double_booking' });
appointmentSchema.index({ patientId: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);
