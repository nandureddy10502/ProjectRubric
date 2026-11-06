import express from 'express';
import {
  getAllRubrics,
  getRubricById,
  createRubric,
} from '../controllers/rubricController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getAllRubrics);
router.get('/:id', getRubricById);
router.post('/', authorize('teacher'), createRubric);

export default router;

