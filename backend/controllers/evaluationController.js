import ProjectEvaluation from '../models/ProjectEvaluation.js';
import Rubric from '../models/Rubric.js';

// @desc    Get evaluations belonging strictly to the logged-in student
// @route   GET /api/evaluations/my-projects
// @access  Private (Student)
export const getMyProjects = async (req, res, next) => {
  try {
    // STRICT DATA ISOLATION: Filter exclusively by authenticated student's _id
    const studentId = req.user._id;

    const evaluations = await ProjectEvaluation.find({ studentId })
      .populate({
        path: 'rubricId',
        select: 'title description criteria',
      })
      .populate({
        path: 'evaluatedBy',
        select: 'name email role',
      })
      .sort({ status: -1, submittedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all evaluations across all students (Pending first, then date)
// @route   GET /api/evaluations/all
// @access  Private (Teacher only)
export const getAllEvaluations = async (req, res, next) => {
  try {
    // Sorted by status ('Pending' first) then date
    const evaluations = await ProjectEvaluation.find()
      .populate({
        path: 'studentId',
        select: 'name email role',
      })
      .populate({
        path: 'rubricId',
        select: 'title description criteria',
      })
      .populate({
        path: 'evaluatedBy',
        select: 'name email role',
      })
      .sort({ status: -1, submittedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      count: evaluations.length,
      data: evaluations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single evaluation by ID with strict ownership/role validation
// @route   GET /api/evaluations/:id
// @access  Private
export const getEvaluationById = async (req, res, next) => {
  try {
    const evaluation = await ProjectEvaluation.findById(req.params.id)
      .populate({
        path: 'rubricId',
        select: 'title description criteria',
      })
      .populate({
        path: 'studentId',
        select: 'name email',
      })
      .populate({
        path: 'evaluatedBy',
        select: 'name email',
      });

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found.',
      });
    }

    // Strict Authorization Check: If the caller is a student, ensure they own this project
    const isOwner = evaluation.studentId?._id?.toString() === req.user._id.toString();
    const isTeacher = req.user.role === 'teacher';

    if (!isOwner && !isTeacher) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view evaluations belonging to other students.',
      });
    }

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student submits a new project for evaluation ('Pending' state)
// @route   POST /api/evaluations/submit
// @access  Private (Student)
export const submitProject = async (req, res, next) => {
  try {
    const { rubricId, projectName, projectDescription, repositoryUrl } = req.body;

    if (!rubricId || !projectName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both rubric selection and project name.',
      });
    }

    // Verify rubric exists
    const rubric = await Rubric.findById(rubricId);
    if (!rubric) {
      return res.status(404).json({
        success: false,
        message: 'The selected rubric was not found.',
      });
    }

    const evaluation = await ProjectEvaluation.create({
      studentId: req.user._id,
      rubricId,
      projectName,
      projectDescription: projectDescription || '',
      repositoryUrl: repositoryUrl || '',
      status: 'Pending',
      scores: [],
      totalScore: 0,
      submittedAt: new Date(),
    });

    const populated = await ProjectEvaluation.findById(evaluation._id)
      .populate('rubricId')
      .populate('studentId', 'name email');

    res.status(201).json({
      success: true,
      data: populated,
      message: 'Project submitted successfully. Awaiting instructor evaluation.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Teacher grades an evaluation and publishes scores
// @route   PUT /api/evaluations/:id/grade
// @access  Private (Teacher only)
export const gradeEvaluation = async (req, res, next) => {
  try {
    const { scores } = req.body;

    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide scores for all rubric criteria.',
      });
    }

    const evaluation = await ProjectEvaluation.findById(req.params.id).populate('rubricId');
    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation not found.',
      });
    }

    // Validate and calculate total score
    const validatedScores = scores.map((item) => {
      const awarded = Number(item.pointsAwarded);
      if (isNaN(awarded) || awarded < 0) {
        throw new Error(`Points awarded for "${item.criterionName}" must be a non-negative number.`);
      }
      return {
        criterionName: item.criterionName,
        pointsAwarded: awarded,
        feedback: item.feedback ? item.feedback.trim() : '',
      };
    });

    const totalScore = validatedScores.reduce((sum, item) => sum + item.pointsAwarded, 0);

    evaluation.scores = validatedScores;
    evaluation.totalScore = totalScore;
    evaluation.evaluatedBy = req.user._id;
    evaluation.status = 'Graded';

    await evaluation.save();

    const updated = await ProjectEvaluation.findById(evaluation._id)
      .populate('rubricId')
      .populate('studentId', 'name email')
      .populate('evaluatedBy', 'name email');

    res.json({
      success: true,
      data: updated,
      message: 'Evaluation graded and published successfully.',
    });
  } catch (error) {
    next(error);
  }
};
