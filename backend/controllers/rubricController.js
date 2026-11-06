import Rubric from '../models/Rubric.js';

// @desc    Get all rubrics
// @route   GET /api/rubrics
// @access  Private
export const getAllRubrics = async (req, res, next) => {
  try {
    const rubrics = await Rubric.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: rubrics.length,
      data: rubrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rubric by ID
// @route   GET /api/rubrics/:id
// @access  Private
export const getRubricById = async (req, res, next) => {
  try {
    const rubric = await Rubric.findById(req.params.id);
    if (!rubric) {
      return res.status(404).json({
        success: false,
        message: 'Rubric not found.',
      });
    }

    res.json({
      success: true,
      data: rubric,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new rubric
// @route   POST /api/rubrics
// @access  Private (Teacher)
export const createRubric = async (req, res, next) => {
  try {
    const { title, description, criteria } = req.body;

    if (!title || !criteria || criteria.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title and at least one criterion are required.',
      });
    }

    const rubric = await Rubric.create({
      title,
      description,
      criteria,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: rubric,
    });
  } catch (error) {
    next(error);
  }
};

