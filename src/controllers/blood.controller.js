const BloodRequest = require('../models/BloodRequest');
const BloodDonation = require('../models/BloodDonation');
const DonorProfile = require('../models/DonorProfile');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

/**
 * GET /api/blood/stats
 */
exports.getBloodStats = async (req, res, next) => {
  try {
    const donorCounts = await DonorProfile.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);

    const requestCounts = await BloodRequest.aggregate([
      { $match: { status: 'open' } },
      { $group: { _id: '$bloodGroup', count: { $sum: 1 } } },
    ]);

    const stats = {};
    BLOOD_GROUPS.forEach((bg) => {
      stats[bg] = {
        donors: (donorCounts.find((d) => d._id === bg) || {}).count || 0,
        openRequests: (requestCounts.find((r) => r._id === bg) || {}).count || 0,
      };
    });

    const totalDonors = await DonorProfile.countDocuments({ isAvailable: true });
    const totalRequests = await BloodRequest.countDocuments({ status: 'open' });

    res.json({ success: true, data: { byGroup: stats, totalDonors, totalOpenRequests: totalRequests } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/blood/requests?bloodGroup=&status=&urgency=
 */
exports.listBloodRequests = async (req, res, next) => {
  try {
    const { bloodGroup, status, urgency } = req.query;
    const filter = {};
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (status) filter.status = status;
    else filter.status = { $in: ['open', 'matched'] };
    if (urgency) filter.urgency = urgency;

    const requests = await BloodRequest.find(filter)
      .populate('requesterId', 'name')
      .sort({ urgency: -1, neededByDate: 1 })
      .lean();

    res.json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/blood/requests
 */
exports.createBloodRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.create({
      ...req.body,
      requesterId: req.user._id,
      location: req.body.location || { type: 'Point', coordinates: [90.3944, 23.7258] },
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/blood/requests/:id
 */
exports.updateBloodRequest = async (req, res, next) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Blood request not found' });
    }
    if (request.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    Object.assign(request, req.body);
    await request.save();
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/blood/donors?bloodGroup=&available=true
 */
exports.listDonors = async (req, res, next) => {
  try {
    const { bloodGroup, available } = req.query;
    const filter = {};
    if (bloodGroup) {
      // Support compatible donors: requested type + O-
      if (bloodGroup !== 'O-') {
        filter.bloodGroup = { $in: [bloodGroup, 'O-'] };
      } else {
        filter.bloodGroup = 'O-';
      }
    }
    if (available !== 'false') filter.isAvailable = true;
    filter.healthStatus = 'eligible';

    const donors = await DonorProfile.find(filter)
      .populate('userId', 'name phone avatarUrl')
      .sort({ lastDonationDate: -1 })
      .lean();

    res.json({ success: true, data: donors });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/blood/donors
 */
exports.registerDonor = async (req, res, next) => {
  try {
    const existing = await DonorProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already registered as donor' });
    }

    const donor = await DonorProfile.create({
      ...req.body,
      userId: req.user._id,
      location: req.body.location || { type: 'Point', coordinates: [90.3944, 23.7258] },
    });
    res.status(201).json({ success: true, data: donor });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/blood/donations
 */
exports.createDonation = async (req, res, next) => {
  try {
    const donation = await BloodDonation.create({
      ...req.body,
      donorUserId: req.user._id,
    });
    res.status(201).json({ success: true, data: donation });
  } catch (err) {
    next(err);
  }
};
