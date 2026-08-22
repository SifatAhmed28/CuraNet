const mongoose = require('mongoose');
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bloodRequestSchema = new mongoose.Schema({
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  patientName: { type: String, required: true, trim: true, maxlength: 100 },
  bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS, index: true },
  unitsNeeded: { type: Number, required: true, min: 1, max: 10 },
  urgency: { type: String, required: true, enum: ['low','medium','high','critical'], default: 'medium', index: true },
  status: { type: String, required: true, enum: ['open','matched','fulfilled','cancelled','expired'], default: 'open', index: true },
  hospitalName: { type: String, required: true, maxlength: 200 },
  hospitalAddress: { type: String, required: true, maxlength: 500 },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  contactPhone: { type: String, required: true, match: [/^\+?[0-9]{7,15}$/, 'Invalid phone'] },
  neededByDate: { type: Date, required: true },
  description: { type: String, maxlength: 500 },
  fulfilledByDonorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DonorProfile' },
  fulfilledAt: { type: Date }
}, { timestamps: true });

bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ bloodGroup: 1, status: 1 });
bloodRequestSchema.index({ urgency: 1, neededByDate: 1 });
bloodRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
