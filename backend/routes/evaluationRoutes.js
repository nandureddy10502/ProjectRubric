import express from 'express';
import {
  getMyProjects,
  getAllEvaluations,
  getEvaluationById,
  submitProject,
  gradeEvaluation,
} from '../controllers/evaluationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All evaluation routes require authentication
router.use(protect);

// Student project submission ('Pending' state)
router.post('/submit', submitProject);

// Student's own projects (strictly isolated to req.user._id)
router.get('/my-projects', getMyProjects);

// Teacher: Get all submissions across all students
router.get('/all', authorize('teacher'), getAllEvaluations);

// Teacher: Grade and publish evaluation
router.put('/:id/grade', authorize('teacher'), gradeEvaluation);

// Get single evaluation by ID (ownership or teacher validated in controller)
router.get('/:id', getEvaluationById);

export default router;
