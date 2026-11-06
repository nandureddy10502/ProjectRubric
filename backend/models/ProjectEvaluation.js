import mongoose from 'mongoose';

const scoreItemSchema = new mongoose.Schema(
  {
    criterionName: {
      type: String,
      required: [true, 'Criterion name is required'],
      trim: true,
    },
    pointsAwarded: {
      type: Number,
      required: [true, 'Points awarded is required'],
      min: [0, 'Points awarded cannot be negative'],
    },
    feedback: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const projectEvaluationSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID reference is required'],
      index: true,
    },
    rubricId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rubric',
      required: [true, 'Rubric ID reference is required'],
      index: true,
    },
    projectName: {
      type: String,
      required: [true, 'Project title/name is required'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    projectDescription: {
      type: String,
      default: '',
      trim: true,
    },
    repositoryUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Graded'],
      default: 'Pending',
      index: true,
    },
    scores: {
      type: [scoreItemSchema],
      default: [],
    },
    totalScore: {
      type: Number,
      default: 0,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook: Enforce that scores is non-empty ONLY when status is 'Graded'
projectEvaluationSchema.pre('validate', function (next) {
  if (this.status === 'Graded') {
    if (!this.scores || this.scores.length === 0) {
      this.invalidate('scores', 'A graded evaluation must contain at least one criterion score');
    } else {
      this.totalScore = this.scores.reduce((sum, item) => sum + (Number(item.pointsAwarded) || 0), 0);
    }
  } else if (this.status === 'Pending') {
    this.totalScore = 0;
  }
  next();
});

const ProjectEvaluation = mongoose.model('ProjectEvaluation', projectEvaluationSchema);
export default ProjectEvaluation;
