const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: { type: String, required: true, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
  startTime: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM 24h'] },
  endTime: { type: String, required: true, match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'HH:MM 24h'] },
  slotDurationMinutes: { type: Number, required: true, enum: [15,20,30,45,60], default: 30 },
  isAvailable: { type: Boolean, default: true }
}, { _id: true });

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, sparse: true, index: true },
  name: { type: String, trim: true },
  education: { type: String, trim: true },
  specialization: { type: [String], required: true, validate: v => v.length > 0 }, // e.g. Cardiology
  qualifications: { type: [String], required: true, validate: v => v.length > 0 }, // MBBS, MD
  experienceYears: { type: Number, required: true, min: 0, max: 60 },
  licenseNumber: { type: String, trim: true },
  bio: { type: String, maxlength: 5000 },
  consultationFee: { type: Number, required: true, min: 0, max: 100000 },
  clinicName: { type: String, trim: true, maxlength: 300 },
  clinicAddress: { type: String, required: true, maxlength: 1000 },
  chamber: { type: String, trim: true, maxlength: 500 },
  city: { type: String, trim: true, index: true },
  district: { type: String, trim: true, index: true },
  postalCode: { type: String, trim: true, index: true },
  concentrations: { type: [String], default: [] },
  location: {
    type: { type: String, enum: ['Point'], required: true, default: 'Point' },
    coordinates: { type: [Number], required: true, validate: { validator: v => v.length===2, message: '[lng, lat]' } } // [lng, lat]
  },
  languages: { type: [String], default: ['Bengali', 'English'] },
  ratingAvg: { type: Number, min: 0, max: 5, default: 4.8 },
  ratingCount: { type: Number, min: 0, default: 12 },
  isVerifiedByAdmin: { type: Boolean, default: true },
  consultationTypes: { type: [String], enum: ['online','offline','both'], default: ['both'] },
  availabilitySlots: { type: [availabilitySlotSchema], default: [] }
}, { timestamps: true });

doctorProfileSchema.index({ location: '2dsphere' });
doctorProfileSchema.index({ specialization: 1 });
doctorProfileSchema.index({ experienceYears: -1 });
doctorProfileSchema.index({ consultationFee: 1 });
doctorProfileSchema.index({ ratingAvg: -1 });
doctorProfileSchema.index({ isVerifiedByAdmin: 1 });
doctorProfileSchema.index({ city: 1, district: 1 });
doctorProfileSchema.index({
  name: 'text',
  specialization: 'text',
  clinicName: 'text',
  clinicAddress: 'text',
  concentrations: 'text',
  city: 'text',
  district: 'text'
}, { name: 'doctor_text_idx' });

module.exports = mongoose.model('DoctorProfile', doctorProfileSchema);
