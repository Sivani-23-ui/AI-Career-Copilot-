const mongoose = require('mongoose');

const careerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    selectedCareer: {
      type: String,
      required: true,
    },
    interests: {
      type: [String],
      default: [],
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    requiredSkills: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    readinessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    recommendations: [
      {
        careerName: String,
        whySuitable: String,
        requiredSkills: [String],
        currentMatch: Number,
        missingSkills: [String],
        nextSteps: [String],
      },
    ],
    skillGapAnalysis: {
      matchPercentage: { type: Number, default: 0 },
      beginner: { type: [String], default: [] },
      intermediate: { type: [String], default: [] },
      advanced: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CareerProfile', careerProfileSchema);
