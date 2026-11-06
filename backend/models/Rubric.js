import mongoose from 'mongoose';

const criterionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Criterion name is required'],
      trim: true,
    },
    maxPoints: {
      type: Number,
      required: [true, 'Maximum points are required'],
      min: [1, 'Maximum points must be at least 1'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { _id: false }
);

const rubricSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Rubric title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    criteria: {
      type: [criterionSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A rubric must contain at least one criterion',
      },
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to calculate total possible points of the rubric
rubricSchema.virtual('totalMaxPoints').get(function () {
  if (!this.criteria || this.criteria.length === 0) return 0;
  return this.criteria.reduce((acc, curr) => acc + (curr.maxPoints || 0), 0);
});

const Rubric = mongoose.model('Rubric', rubricSchema);
export default Rubric;

