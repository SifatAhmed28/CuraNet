const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 300 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^[a-z0-9\-]+$/, 'slug invalid'] },
  excerpt: { type: String, maxlength: 300 },
  content: { type: String, required: true, maxlength: 20000 },
  category: { type: String, required: true, enum: ['nutrition','mental_health','chronic_disease','first_aid','maternal_health','infectious_disease','general_wellness','preventive_care'], index: true },
  tags: [{ type: String, trim: true, lowercase: true }],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  coverImageUrl: { type: String, match: [/^https?:\/\/.+/, 'Invalid URL'] },
  readingTimeMinutes: { type: Number, min: 1, max: 120 },
  views: { type: Number, default: 0, min: 0 },
  likes: { type: Number, default: 0, min: 0 },
  isPublished: { type: Boolean, default: false, index: true },
  publishedAt: { type: Date }
}, { timestamps: true });

articleSchema.index({ slug: 1 }, { unique: true });
articleSchema.index({ title: 'text', content: 'text', tags: 'text' }, { name: 'article_text_idx' });
articleSchema.index({ category: 1, isPublished: 1 });
articleSchema.index({ views: -1 });
articleSchema.index({ publishedAt: -1 });

module.exports = mongoose.model('Article', articleSchema);
