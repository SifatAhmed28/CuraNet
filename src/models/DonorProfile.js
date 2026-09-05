const mongoose = require('mongoose');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const donorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  bloodGroup: { type: String, required: true, enum: BLOOD_GROUPS, index: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male','female','other','prefer_not_to_say'] },
  isAvailable: { type: Boolean, default: true, index: true },
  lastDonationDate: { type: Date },
  totalDonations: { type: Number, default: 0, min: 0 },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  address: { type: String, required: true, maxlength: 500 },
  healthStatus: { type: String, enum: ['eligible','temporarily_deferred','ineligible'], default: 'eligible' },
  weightKg: { type: Number, min: 45, max: 200 },
  phoneVisible: { type: Boolean, default: false },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, match: [/^\+?[0-9]{7,15}$/, 'Invalid phone'] }
  }
}, { timestamps: true });

donorProfileSchema.index({ location: '2dsphere' });
donorProfileSchema.index({ bloodGroup: 1, isAvailable: 1 });
donorProfileSchema.index({ healthStatus: 1 });
donorProfileSchema.index({ lastDonationDate: -1 });

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
module.exports.BLOOD_GROUPS = BLOOD_GROUPS;
