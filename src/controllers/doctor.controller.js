const DoctorProfile = require('../models/DoctorProfile');
const Review = require('../models/Review');
const User = require('../models/User');

// Keyword→specialty map for rule-based matching (same logic as frontend)
const SPECIALTIES = [
  { name: 'Cardiology', keywords: ['chest pain', 'shortness of breath', 'palpitation', 'heart', 'breath', 'high blood pressure'] },
  { name: 'Dermatology', keywords: ['rash', 'acne', 'skin', 'itching', 'itchy', 'eczema', 'hives'] },
  { name: 'Neurology', keywords: ['headache', 'migraine', 'dizziness', 'numbness', 'dizzy', 'seizure', 'tremor'] },
  { name: 'Gastroenterology', keywords: ['stomach', 'nausea', 'vomiting', 'diarrhea', 'abdominal', 'acidity', 'constipation'] },
  { name: 'Orthopedics', keywords: ['joint pain', 'fracture', 'back pain', 'knee', 'bone', 'sprain', 'arthritis'] },
  { name: 'Pediatrics', keywords: ['child fever', 'kids', 'child cough', 'baby', 'infant', 'growth'] },
  { name: 'General Medicine', keywords: ['fever', 'cold', 'fatigue', 'weakness', 'flu', 'cough', 'body ache'] },
  { name: 'Gynecology', keywords: ['pregnancy', 'period', 'menstrual', 'pcos', 'pelvic pain'] },
  { name: 'ENT (Otolaryngology)', keywords: ['ear pain', 'sore throat', 'sinus', 'hearing loss', 'nose bleed', 'tonsil'] },
  { name: 'Psychiatry', keywords: ['anxiety', 'depression', 'insomnia', 'stress', 'panic', 'mood'] },
  { name: 'Pulmonology', keywords: ['asthma', 'wheezing', 'chronic cough', 'chest congestion', 'breathing difficulty'] },
  { name: 'Endocrinology', keywords: ['diabetes', 'thyroid', 'hormonal', 'weight gain', 'weight loss', 'blood sugar'] },
  { name: 'Urology', keywords: ['urinary', 'kidney stone', 'urination pain', 'bladder', 'prostate'] },
  { name: 'Ophthalmology', keywords: ['blurry vision', 'eye pain', 'red eye', 'vision loss', 'eye strain'] },
  { name: 'Dentistry', keywords: ['tooth pain', 'cavity', 'gum bleeding', 'toothache', 'wisdom tooth'] },
  { name: 'Oncology', keywords: ['lump', 'unexplained weight loss', 'tumor', 'cancer screening'] },
  { name: 'Nephrology', keywords: ['kidney', 'swelling', 'creatinine', 'dialysis'] },
  { name: 'Rheumatology', keywords: ['joint stiffness', 'autoimmune', 'lupus', 'gout'] },
];

/**
 * GET /api/doctors?specialty=&search=&location=&maxFee=&page=&limit=&sort=
 */
exports.listDoctors = async (req, res, next) => {
  try {
    const { specialty, search, location, maxFee, sort, page = 1, limit = 20 } = req.query;
    const filter = { isVerifiedByAdmin: true };

    if (specialty && specialty !== 'All') {
      filter.specialization = { $in: [new RegExp(specialty, 'i')] };
    }

    if (location && location !== 'All' && location !== 'All Areas' && location !== 'All Bangladesh') {
      const locRegex = new RegExp(location.trim(), 'i');
      filter.$or = [
        { city: locRegex },
        { district: locRegex },
        { postalCode: locRegex },
        { clinicAddress: locRegex },
        { chamber: locRegex },
      ];
    }

    if (search && search.trim()) {
      const q = search.trim();
      const searchRegex = new RegExp(q, 'i');
      const searchConditions = [
        { name: searchRegex },
        { specialization: { $in: [searchRegex] } },
        { concentrations: { $in: [searchRegex] } },
        { clinicName: searchRegex },
        { clinicAddress: searchRegex },
        { chamber: searchRegex },
        { education: searchRegex },
      ];

      if (filter.$or) {
        // If we already have location in $or, combine with $and
        filter.$and = [{ $or: filter.$or }, { $or: searchConditions }];
        delete filter.$or;
      } else {
        filter.$or = searchConditions;
      }
    }

    if (maxFee) {
      filter.consultationFee = { $lte: Number(maxFee) };
    }

    let sortObj = { ratingAvg: -1, ratingCount: -1 };
    if (sort === 'fee_asc') sortObj = { consultationFee: 1 };
    if (sort === 'fee_desc') sortObj = { consultationFee: -1 };
    if (sort === 'experience') sortObj = { experienceYears: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
      DoctorProfile.find(filter)
        .populate('userId', 'name email phone avatarUrl')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      DoctorProfile.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: doctors,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/locations
 */
exports.getDoctorLocations = async (req, res, next) => {
  try {
    const cities = await DoctorProfile.distinct('city', { city: { $ne: null } });
    const districts = await DoctorProfile.distinct('district', { district: { $ne: null } });
    res.json({
      success: true,
      data: {
        cities: cities.filter(Boolean).sort(),
        districts: districts.filter(Boolean).sort(),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/:id
 */
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await DoctorProfile.findById(req.params.id)
      .populate('userId', 'name email phone avatarUrl')
      .lean();

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const reviews = await Review.find({ doctorId: doctor._id })
      .populate('patientId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: { ...doctor, reviews } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/match?symptoms=chest+pain+shortness+of+breath
 */
exports.matchDoctors = async (req, res, next) => {
  try {
    const { symptoms } = req.query;
    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'symptoms query param required' });
    }

    const lower = symptoms.toLowerCase();
    const scored = SPECIALTIES.map((s) => ({
      ...s,
      score: s.keywords.filter((k) => lower.includes(k)).length,
    }))
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);

    const matchedSpecialties = scored.length ? scored.map((s) => s.name) : ['General Medicine'];

    // Split symptoms into words for concentration matching
    const words = lower.split(/[\s,]+/).filter(w => w.length > 2);
    const concentrationRegexes = words.map(w => new RegExp(w, 'i'));

    const doctors = await DoctorProfile.find({
      $and: [
        { isVerifiedByAdmin: true },
        {
          $or: [
            { specialization: { $in: matchedSpecialties } },
            ...(concentrationRegexes.length > 0 ? [{ concentrations: { $in: concentrationRegexes } }] : []),
          ],
        },
      ],
    })
      .populate('userId', 'name email phone avatarUrl')
      .sort({ ratingAvg: -1, ratingCount: -1 })
      .limit(20)
      .lean();

    res.json({
      success: true,
      matchedSpecialties,
      data: doctors,
      total: doctors.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/doctors/me
 */
exports.getMyDoctorProfile = async (req, res, next) => {
  try {
    let profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await DoctorProfile.findOne({ name: req.user.name });
      if (profile && !profile.userId) {
        profile.userId = req.user._id;
        await profile.save();
      }
    }
    if (!profile) {
      profile = await DoctorProfile.create({
        userId: req.user._id,
        name: req.user.name,
        specialization: ['General Medicine'],
        qualifications: ['MBBS'],
        experienceYears: 5,
        consultationFee: 700,
        clinicName: 'Central Care Hospital',
        clinicAddress: 'Dhanmondi, Dhaka, Bangladesh',
        chamber: 'Chamber 402, Level 4',
        city: 'Dhaka',
        district: 'Dhaka',
        location: { type: 'Point', coordinates: [90.4125, 23.8103] },
        availabilitySlots: [
          { dayOfWeek: 'monday', startTime: '17:00', endTime: '21:00', slotDurationMinutes: 30, isAvailable: true },
          { dayOfWeek: 'wednesday', startTime: '17:00', endTime: '21:00', slotDurationMinutes: 30, isAvailable: true },
          { dayOfWeek: 'friday', startTime: '17:00', endTime: '21:00', slotDurationMinutes: 30, isAvailable: true },
        ],
      });
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/doctors/me
 */
exports.updateMyDoctorProfile = async (req, res, next) => {
  try {
    let profile = await DoctorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await DoctorProfile.findOne({ name: req.user.name });
      if (profile) {
        profile.userId = req.user._id;
      }
    }
    if (!profile) {
      profile = new DoctorProfile({
        userId: req.user._id,
        name: req.user.name,
        specialization: ['General Medicine'],
        qualifications: ['MBBS'],
        experienceYears: 5,
        location: { type: 'Point', coordinates: [90.4125, 23.8103] },
        clinicAddress: 'Dhaka, Bangladesh',
        ...req.body,
      });
      await profile.save();
    } else {
      Object.assign(profile, req.body);
      await profile.save();
    }
    res.json({ success: true, message: 'Practice schedule & visiting settings updated', data: profile });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/doctors
 */
exports.createDoctorProfile = async (req, res, next) => {
  try {
    const existing = await DoctorProfile.findOne({ userId: req.user._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Doctor profile already exists' });
    }

    const profile = await DoctorProfile.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/doctors/:id
 */
exports.updateDoctorProfile = async (req, res, next) => {
  try {
    const profile = await DoctorProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }
    if (profile.userId && profile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
    }

    const updated = await DoctorProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
