const express = require('express');
const router = express.Router();
const {
  listCourses,
  getCourse,
  enrollCourse,
  completeLesson,
  getMyEnrollments,
} = require('../controllers/course.controller');
const { protect } = require('../middleware/auth');

router.get('/enrollments/me', protect, getMyEnrollments);
router.get('/', listCourses);
router.get('/:idOrSlug', getCourse);
router.post('/:id/enroll', protect, enrollCourse);
router.put('/:courseId/lessons/:lessonId/complete', protect, completeLesson);

module.exports = router;
