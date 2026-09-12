const mongoose = require('mongoose');

const questionAnswerSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  question: { type: String, required: true },
  userAnswer: { type: String, default: '' },
  feedback: {
    score: { type: Number, default: 0, min: 0, max: 10 },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    suggestedAnswer: { type: String, default: '' },
    evaluation: { type: String, default: '' },
  },
  answeredAt: { type: Date },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    career: {
      type: String,
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior'],
      default: 'entry',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },
    totalQuestions: {
      type: Number,
      default: 5,
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
    },
    questionsAndAnswers: [questionAnswerSchema],
    finalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    finalFeedback: {
      overallPerformance: { type: String, default: '' },
      topStrengths: { type: [String], default: [] },
      areasToImprove: { type: [String], default: [] },
      recommendedResources: { type: [String], default: [] },
    },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
