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
    const { specialty, search, maxFee, sort, page = 1, limit = 20 } = req.query;
    const filter = { isVerifiedByAdmin: true };

    if (specialty && specialty !== 'All') {
      filter.specialization = specialty;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (maxFee) {
      filter.consultationFee = { $lte: Number(maxFee) };
    }

    let sortObj = { ratingAvg: -1 };
    if (sort === 'fee_asc') sortObj = { consultationFee: 1 };
    if (sort === 'fee_desc') sortObj = { consultationFee: -1 };
    if (sort === 'experience') sortObj = { experienceYears: -1 };

    const skip = (Number(page) - 1) * Number(limit);

    const [doctors, total] = await Promise.all([
      DoctorProfile.find(filter)
        .populate('userId', 'name email phone avatarUrl')
        .sort(sortObj)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      DoctorProfile.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: doctors,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
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

    const doctors = await DoctorProfile.find({
      specialization: { $in: matchedSpecialties },
      isVerifiedByAdmin: true,
    })
      .populate('userId', 'name email phone avatarUrl')
      .sort({ ratingAvg: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      matchedSpecialties,
      data: doctors,
    });
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
    if (profile.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
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
