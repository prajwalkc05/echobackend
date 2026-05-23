import express from 'express';
import * as coursesController from './courses.controller.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/search', coursesController.searchCourses);
router.get('/skill/:skill', coursesController.getCoursesBySkill);
router.get('/career/:career', coursesController.getCoursesByCareer);

// Protected routes
router.post('/recommended', authMiddleware, coursesController.getRecommendedCourses);
router.post('/learning-path', authMiddleware, coursesController.generateLearningPath);
router.post('/save', authMiddleware, coursesController.saveCourse);
router.get('/saved', authMiddleware, coursesController.getSavedCourses);
router.delete('/saved/:courseId', authMiddleware, coursesController.removeSavedCourse);
router.put('/progress', authMiddleware, coursesController.trackCourseProgress);

export default router;
