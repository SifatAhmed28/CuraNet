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

    // If doctor, update or create DoctorProfile fields
    if (user.role === 'doctor') {
      const docUpdates = {};
      if (req.body.specialization) {
        docUpdates.specialization = Array.isArray(req.body.specialization) ? req.body.specialization : [req.body.specialization];
      }
      if (req.body.clinicName) docUpdates.clinicName = req.body.clinicName;
      if (req.body.clinicAddress) docUpdates.clinicAddress = req.body.clinicAddress;
      if (req.body.consultationFee !== undefined) docUpdates.consultationFee = Number(req.body.consultationFee);
      if (req.body.bio !== undefined) docUpdates.bio = req.body.bio;
      if (req.body.experienceYears !== undefined) docUpdates.experienceYears = Number(req.body.experienceYears);

      await DoctorProfile.findOneAndUpdate({ userId: user._id }, docUpdates, { new: true, upsert: true });
    }

    // If donor profile fields provided
    if (user.role === 'donor' || req.body.bloodGroup) {
      const donorUpdates = {};
      if (req.body.bloodGroup) donorUpdates.bloodGroup = req.body.bloodGroup;
      if (req.body.address) donorUpdates.address = req.body.address;
      await DonorProfile.findOneAndUpdate({ userId: user._id }, donorUpdates, { new: true, upsert: true });
    }

    // Return populated user
    const userObj = user.toObject();
    if (user.role === 'doctor') {
      userObj.doctorProfile = await DoctorProfile.findOne({ userId: user._id }).lean();
    } else if (user.role === 'donor') {
      userObj.donorProfile = await DonorProfile.findOne({ userId: user._id }).lean();
    }

    res.json({ success: true, user: userObj });
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

const Appointment = require('../models/Appointment');
const BloodRequest = require('../models/BloodRequest');

/**
 * GET /api/users — list all users (admin only)
 */
exports.listAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const filter = {};
    if (role && role !== 'all') filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('name email role phone isVerified isActive createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const counts = {
      total: await User.countDocuments(),
      patients: await User.countDocuments({ role: 'patient' }),
      doctors: await User.countDocuments({ role: 'doctor' }),
      donors: await User.countDocuments({ role: 'donor' }),
      admins: await User.countDocuments({ role: 'admin' }),
    };

    res.json({ success: true, data: users, counts });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id/role — update user role / active status (admin only)
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role, isActive, isVerified } = req.body;
    const updates = {};
    if (role) updates.role = role;
    if (isActive !== undefined) updates.isActive = isActive;
    if (isVerified !== undefined) updates.isVerified = isVerified;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true })
      .select('name email role isVerified isActive');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If upgraded to doctor, create DoctorProfile if missing
    if (role === 'doctor') {
      const existingDoc = await DoctorProfile.findOne({ userId: user._id });
      if (!existingDoc) {
        await DoctorProfile.create({
          userId: user._id,
          specialization: ['General Medicine'],
          clinicName: 'CuraNet Central Clinic',
          clinicAddress: 'Dhaka, Bangladesh',
          consultationFee: 700,
          isVerified: true,
        });
      }
    }

    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/admin/stats — system stats for admin dashboard
 */
exports.getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDonors = await DonorProfile.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const paidAppointments = await Appointment.countDocuments({ paymentStatus: 'paid' });
    const openBloodRequests = await BloodRequest.countDocuments({ status: 'open' });

    // Revenue calculation
    const paidList = await Appointment.find({ paymentStatus: 'paid' }).select('fee').lean();
    const totalRevenue = paidList.reduce((acc, curr) => acc + (curr.fee || 0), 0);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalPatients,
        totalDonors,
        totalAppointments,
        completedAppointments,
        paidAppointments,
        openBloodRequests,
        totalRevenue,
      },
    });
  } catch (err) {
    next(err);
  }
};
