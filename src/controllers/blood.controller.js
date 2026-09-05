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
/**
 * GET /api/blood/requests?bloodGroup=&location=&search=&status=&urgency=
 */
exports.listBloodRequests = async (req, res, next) => {
  try {
    const { bloodGroup, location, search, status, urgency } = req.query;
    const filter = {};

    if (bloodGroup && bloodGroup !== 'All') {
      filter.bloodGroup = bloodGroup;
    }

    if (status && status !== 'all' && status !== 'All') {
      filter.status = status;
    } else {
      filter.status = { $in: ['open', 'matched'] };
    }

    if (urgency && urgency !== 'all' && urgency !== 'All') {
      filter.urgency = urgency;
    }

    const andConditions = [];

    if (location && location !== 'All' && location !== 'All Bangladesh' && location !== 'All Areas') {
      const locRegex = new RegExp(location.trim(), 'i');
      andConditions.push({
        $or: [
          { hospitalAddress: locRegex },
          { hospitalName: locRegex },
        ],
      });
    }

    if (search && search.trim()) {
      const qRegex = new RegExp(search.trim(), 'i');
      andConditions.push({
        $or: [
          { patientName: qRegex },
          { hospitalName: qRegex },
          { hospitalAddress: qRegex },
          { description: qRegex },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    // Urgency sort order weighting
    const requests = await BloodRequest.find(filter)
      .populate('requesterId', 'name phone email avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    // Sort in memory by urgency priority if desired: critical > high > medium > low
    const urgencyWeight = { critical: 4, high: 3, medium: 2, low: 1 };
    requests.sort((a, b) => {
      const uA = urgencyWeight[a.urgency] || 1;
      const uB = urgencyWeight[b.urgency] || 1;
      if (uA !== uB) return uB - uA;
      return new Date(a.neededByDate) - new Date(b.neededByDate);
    });

    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/blood/requests
 */
exports.createBloodRequest = async (req, res, next) => {
  try {
    const bloodGroup = req.body.bloodGroup || req.body.bloodType;
    const patientName = req.body.patientName || req.user?.name || 'Emergency Patient';
    const hospitalName = req.body.hospitalName || req.body.hospital || 'Hospital';
    const hospitalAddress = req.body.hospitalAddress || req.body.district || req.body.hospital || 'Dhaka';
    const contactPhone = req.body.contactPhone || req.user?.phone || '+8801700000000';
    const neededByDate = req.body.neededByDate ? new Date(req.body.neededByDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
    let urgency = req.body.urgency || 'medium';
    if (urgency === 'moderate') urgency = 'medium';

    const request = await BloodRequest.create({
      ...req.body,
      patientName,
      bloodGroup,
      hospitalName,
      hospitalAddress,
      contactPhone,
      neededByDate,
      urgency,
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
 * GET /api/blood/donors?bloodGroup=&location=&search=&available=true
 */
exports.listDonors = async (req, res, next) => {
  try {
    const { bloodGroup, location, search, available } = req.query;
    const filter = {};

    if (bloodGroup && bloodGroup !== 'All') {
      filter.bloodGroup = bloodGroup;
    }

    if (available === 'true') {
      filter.isAvailable = true;
    } else if (available === 'false') {
      filter.isAvailable = false;
    }

    const andConditions = [];

    if (location && location !== 'All' && location !== 'All Bangladesh' && location !== 'All Areas') {
      const locRegex = new RegExp(location.trim(), 'i');
      andConditions.push({ address: locRegex });
    }

    if (search && search.trim()) {
      const qRegex = new RegExp(search.trim(), 'i');
      andConditions.push({
        $or: [
          { address: qRegex },
          { 'emergencyContact.name': qRegex },
        ],
      });
    }

    if (andConditions.length > 0) {
      filter.$and = andConditions;
    }

    const donors = await DonorProfile.find(filter)
      .populate('userId', 'name phone email avatarUrl')
      .sort({ isAvailable: -1, totalDonations: -1, lastDonationDate: -1 })
      .lean();

    // If search also matched user name
    let result = donors;
    if (search && search.trim()) {
      const lowSearch = search.trim().toLowerCase();
      result = donors.filter(
        d =>
          d.userId?.name?.toLowerCase().includes(lowSearch) ||
          d.address?.toLowerCase().includes(lowSearch) ||
          d.bloodGroup?.toLowerCase().includes(lowSearch)
      );
    }

    res.json({ success: true, count: result.length, data: result });
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

    const bloodGroup = req.body.bloodGroup || req.body.bloodType;
    const address = req.body.address || req.body.district || 'Dhaka';

    const donor = await DonorProfile.create({
      ...req.body,
      bloodGroup,
      address,
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

/**
 * GET /api/blood/donors/me — fetch logged in user's donor profile
 */
exports.getMyDonorProfile = async (req, res, next) => {
  try {
    const donor = await DonorProfile.findOne({ userId: req.user._id })
      .populate('userId', 'name phone email')
      .lean();
    res.json({ success: true, data: donor || null });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/blood/requests/mine — fetch logged in user's blood requests
 */
exports.getMyBloodRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ requesterId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, data: requests || [] });
  } catch (err) {
    next(err);
  }
};
