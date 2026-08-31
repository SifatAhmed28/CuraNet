const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, maxlength: 1000 },
  contentType: { type: String, required: true, enum: ['video','article','quiz','pdf'] },
  content: { type: String, maxlength: 10000 }, // article body / transcript
  videoUrl: { type: String, match: [/^https?:\/\/.+/, 'Invalid URL'] },
  durationMinutes: { type: Number, required: true, min: 1, max: 600 },
  order: { type: Number, required: true, min: 1 },
  isPreview: { type: Boolean, default: false },
  resources: [{ type: String, match: [/^https?:\/\/.+/, 'Invalid URL'] }],
  // Embedded quiz for quiz-type lessons
  quiz: {
    questions: [{
      question: { type: String, required: true, maxlength: 500 },
      options: { type: [String], required: true, validate: v=>v.length>=2 },
      correctIndex: { type: Number, required: true, min: 0 }
    }]
  }
}, { _id: true, timestamps: true });

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, lowercase: true, trim: true, match: [/^[a-z0-9\-]+$/, 'slug: a-z,0-9,-'] },
  description: { type: String, required: true, maxlength: 5000 },
  category: {
    type: String, required: true, enum: ['nutrition','mental_health','chronic_disease','first_aid','maternal_health','infectious_disease','general_wellness','preventive_care'], index: true
  },
  level: { type: String, required: true, enum: ['beginner','intermediate','advanced'], default: 'beginner', index: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  thumbnailUrl: { type: String, match: [/^https?:\/\/.+/, 'Invalid URL'] },
  tags: [{ type: String, trim: true, lowercase: true }],
  durationMinutes: { type: Number, min: 1 },
  isPublished: { type: Boolean, default: false, index: true },
  isFeatured: { type: Boolean, default: false },
  enrollmentCount: { type: Number, default: 0, min: 0 },
  ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0, min: 0 },
  lessons: { type: [lessonSchema], default: [] }
}, { timestamps: true });

courseSchema.index({ slug: 1 }, { unique: true });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' }, { name: 'course_text_idx' });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ isPublished: 1, isFeatured: 1 });

courseSchema.pre('save', function(next){
  if (this.lessons && this.lessons.length) this.durationMinutes = this.lessons.reduce((s,l)=> s + (l.durationMinutes||0), 0);
  next();
});

module.exports = mongoose.model('Course', courseSchema);
