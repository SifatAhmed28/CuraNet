const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'name required'], trim: true, minlength: 2, maxlength: 100 },
  email: {
    type: String, required: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email'],
  },
  passwordHash: { type: String, required: true, minlength: 6, select: false },
  phone: {
    type: String, trim: true,
    match: [/^\+?[0-9]{7,15}$/, 'Invalid phone (E.164)'],
  },
  role: {
    type: String, required: true, enum: ['guest', 'patient', 'customer', 'doctor', 'donor', 'admin'], default: 'patient'
  },
  additionalRoles: [{ type: String, enum: ['guest', 'patient', 'customer', 'doctor', 'donor', 'admin'] }],
  avatarUrl: { type: String, match: [/^https?:\/\/.+/, 'Invalid URL'] },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date },
}, { timestamps: true });

// Unique email (case-insensitive already via lowercase)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

// Enforce hashing at schema layer — future Express signup can do
// new User({ passwordHash: req.body.password }) and never store plaintext.
// insertMany bypasses save hooks, so seed's pre-hashed values stay single-hashed.
// For save/create: if already looks like bcrypt hash, skip to avoid double-hash.
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  const val = this.passwordHash;
  if (typeof val === 'string' && /^\$2[aby]\$\d+\$.{53}$/.test(val)) return next();
  this.passwordHash = await bcrypt.hash(val, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);
