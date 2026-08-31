const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DoctorProfile', required: true, index: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  rating: { type: Number, required: true, min: 1, max: 5, index: true },
  comment: { type: String, maxlength: 1000 },
  isAnonymous: { type: Boolean, default: false }
}, { timestamps: true });

reviewSchema.index({ doctorId: 1, patientId: 1 });
reviewSchema.index({ doctorId: 1, rating: -1 });
reviewSchema.index({ appointmentId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Review', reviewSchema);
