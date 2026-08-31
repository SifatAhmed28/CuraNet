const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const DonorProfile = require('../models/DonorProfile');
const PatientProfile = require('../models/PatientProfile');

/**
 * GET /api/users/profile
 */
exports.getProfile = async (req, res, next) => {
  try {
    const user = req.user.toObject();

    if (user.role === 'doctor') {
      user.doctorProfile = await DoctorProfile.findOne({ userId: user._id });
    } else if (user.role === 'donor') {
      user.donorProfile = await DonorProfile.findOne({ userId: user._id });
    }
    if (user.role === 'patient' || (user.additionalRoles || []).includes('patient')) {
      user.patientProfile = await PatientProfile.findOne({ userId: user._id });
    }

    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['name', 'phone', 'avatarUrl'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/:id
 */
exports.getPublicUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('name role avatarUrl createdAt');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};
