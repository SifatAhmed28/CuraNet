const mongoose = require('mongoose');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

/**
 * GET /api/courses?search=&category=&level=&page=&limit=
 */
exports.listCourses = async (req, res, next) => {
  try {
    const { search, category, level, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (level && level !== 'All') {
      filter.level = level;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .populate('instructorId', 'name avatarUrl')
        .sort({ isFeatured: -1, enrollmentCount: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Course.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: courses,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/courses/:idOrSlug
 */
exports.getCourse = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let course;

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      course = await Course.findById(idOrSlug).populate('instructorId', 'name avatarUrl').lean();
    }
    if (!course) {
      course = await Course.findOne({ slug: idOrSlug }).populate('instructorId', 'name avatarUrl').lean();
    }
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, data: course });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/courses/:id/enroll
 */
exports.enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const existing = await Enrollment.findOne({ userId: req.user._id, courseId: course._id });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Already enrolled', data: existing });
    }

    const enrollment = await Enrollment.create({
      userId: req.user._id,
      courseId: course._id,
    });

    // Increment enrollment count
    await Course.findByIdAndUpdate(course._id, { $inc: { enrollmentCount: 1 } });

    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/courses/:courseId/lessons/:lessonId/complete
 */
exports.completeLesson = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;

    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Not enrolled in this course' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Add lesson to completed list if not already there
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
    if (!enrollment.completedLessonIds.some((id) => id.equals(lessonObjectId))) {
      enrollment.completedLessonIds.push(lessonObjectId);
    }

    // Calculate progress
    const totalLessons = course.lessons.length;
    enrollment.progress = Math.round((enrollment.completedLessonIds.length / totalLessons) * 100);
    enrollment.lastAccessedAt = new Date();

    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    } else {
      enrollment.status = 'in_progress';
    }

    await enrollment.save();

    res.json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/courses/enrollments/me
 */
exports.getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id })
      .populate({
        path: 'courseId',
        select: 'title slug category level thumbnailUrl durationMinutes lessons',
        populate: { path: 'instructorId', select: 'name' },
      })
      .sort({ lastAccessedAt: -1 })
      .lean();

    res.json({ success: true, data: enrollments });
  } catch (err) {
    next(err);
  }
};
