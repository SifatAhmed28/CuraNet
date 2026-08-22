const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  completedLessonIds: [{ type: mongoose.Schema.Types.ObjectId }],
  status: { type: String, enum: ['enrolled','in_progress','completed','dropped'], default: 'enrolled', index: true },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date },
  certificateUrl: { type: String, match: [/^https?:\/\/.+/, 'Invalid URL'] }
}, { timestamps: true });

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ status: 1 });
enrollmentSchema.index({ enrolledAt: -1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
