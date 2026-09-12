const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeText: {
      type: String,
      default: '',
    },
    fileName: {
      type: String,
      default: '',
    },
    extractedData: {
      education: { type: [String], default: [] },
      skills: { type: [String], default: [] },
      experience: { type: [String], default: [] },
      projects: { type: [String], default: [] },
      certifications: { type: [String], default: [] },
    },
    strengths: {
      type: [String],
      default: [],
    },
    missingSkills: {
      type: [String],
      default: [],
    },
    suggestions: {
      type: [String],
      default: [],
    },
    overallScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    analysisStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
