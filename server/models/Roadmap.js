const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  topics: { type: [String], default: [] },
  practiceProblems: { type: [String], default: [] },
  miniProject: { type: String, default: '' },
  resources: { type: [String], default: [] },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const roadmapSchema = new mongoose.Schema(
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
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    studyHoursPerWeek: {
      type: Number,
      default: 10,
    },
    totalWeeks: {
      type: Number,
      default: 12,
    },
    tasks: [taskSchema],
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    currentWeek: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

// Calculate progress when tasks are updated
roadmapSchema.methods.calculateProgress = function () {
  if (this.tasks.length === 0) return 0;
  const completed = this.tasks.filter((t) => t.completed).length;
  return Math.round((completed / this.tasks.length) * 100);
};

module.exports = mongoose.model('Roadmap', roadmapSchema);
