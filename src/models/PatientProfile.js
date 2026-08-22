const mongoose = require('mongoose');
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const patientProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male','female','other','prefer_not_to_say'] },
  bloodGroup: { type: String, enum: BLOOD_GROUPS },
  allergies: { type: [String], default: [] },
  chronicConditions: { type: [String], default: [] },
  emergencyContact: {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    relationship: { type: String, required: true, trim: true, maxlength: 50 },
    phone: { type: String, required: true, match: [/^\+?[0-9]{7,15}$/, 'Invalid phone'] }
  },
  address: { type: String, maxlength: 500 },
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] }
  }
}, { timestamps: true });

patientProfileSchema.index({ location: '2dsphere' });
patientProfileSchema.index({ bloodGroup: 1 });

module.exports = mongoose.model('PatientProfile', patientProfileSchema);
