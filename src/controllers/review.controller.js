const Review = require('../models/Review');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');

/**
 * POST /api/reviews
 */
exports.createReview = async (req, res, next) => {
  try {
    const { doctorId, appointmentId, rating, comment, isAnonymous } = req.body;

    // Verify appointment belongs to patient and is completed
    if (appointmentId) {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
      if (appointment.patientId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not your appointment' });
      }
    }

    const review = await Review.create({
      patientId: req.user._id,
      doctorId,
      appointmentId,
      rating,
      comment,
      isAnonymous: isAnonymous || false,
    });

    // Recalculate doctor rating
    const stats = await Review.aggregate([
      { $match: { doctorId: review.doctorId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    if (stats.length > 0) {
      await DoctorProfile.findByIdAndUpdate(doctorId, {
        ratingAvg: Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count,
      });
    }

    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/reviews/doctor/:doctorId
 */
exports.getDoctorReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: reviews });
  } catch (err) {
    next(err);
  }
};
