const mongoose = require('mongoose');

const bloodDonationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'DonorProfile', required: true, index: true },
  donorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest', required: true, index: true },
  unitsDonated: { type: Number, required: true, min: 1, max: 10 },
  donationDate: { type: Date, required: true, default: Date.now },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  },
  status: { type: String, required: true, enum: ['scheduled','completed','cancelled','verified'], default: 'scheduled', index: true },
  notes: { type: String, maxlength: 500 },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

bloodDonationSchema.index({ donorId: 1, requestId: 1 });
bloodDonationSchema.index({ donationDate: -1 });
bloodDonationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodDonation', bloodDonationSchema);
