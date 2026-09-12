const Roadmap = require('../models/Roadmap');
const CareerProfile = require('../models/CareerProfile');
const aiService = require('../services/aiService');

// POST /api/roadmap/generate
const generateRoadmap = async (req, res) => {
  const { career, experienceLevel, studyHoursPerWeek } = req.body;

  if (!career) {
    return res.status(400).json({ message: 'Career is required.' });
  }

  try {
    // Get missing skills from career profile
    const profile = await CareerProfile.findOne({ userId: req.user._id });
    const missingSkills =
      profile?.missingSkills ||
      req.body.missingSkills ||
      [];

    const tasks = await aiService.generateRoadmap(
      career,
      missingSkills,
      experienceLevel || 'beginner',
      studyHoursPerWeek || 10
    );

    const roadmap = await Roadmap.findOneAndUpdate(
      { userId: req.user._id, career },
      {
        userId: req.user._id,
        career,
        experienceLevel: experienceLevel || 'beginner',
        studyHoursPerWeek: studyHoursPerWeek || 10,
        totalWeeks: tasks.length,
        tasks: tasks.map((t, i) => ({
          weekNumber: t.weekNumber || i + 1,
          title: t.title,
          description: t.description || '',
          topics: t.topics || [],
          practiceProblems: t.practiceProblems || [],
          miniProject: t.miniProject || '',
          resources: t.resources || [],
          completed: false,
        })),
        overallProgress: 0,
        currentWeek: 1,
      },
      { upsert: true, new: true }
    );

    res.json({
      message: aiService.isDemoMode ? 'Demo roadmap generated' : 'Roadmap generated',
      demoMode: aiService.isDemoMode,
      roadmap,
    });
  } catch (err) {
    console.error('Roadmap generation error:', err);
    res.status(500).json({ message: 'Failed to generate roadmap.' });
  }
};

// GET /api/roadmap
const getRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ roadmap: roadmap || null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch roadmap.' });
  }
};

// PUT /api/roadmap/task/:taskId/complete
const toggleTaskComplete = async (req, res) => {
  const { taskId } = req.params;
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user._id });
    if (!roadmap) return res.status(404).json({ message: 'Roadmap not found.' });

    const task = roadmap.tasks.id(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found.' });

    task.completed = !task.completed;
    task.completedAt = task.completed ? new Date() : undefined;

    // Recalculate progress
    const completedCount = roadmap.tasks.filter((t) => t.completed).length;
    roadmap.overallProgress = Math.round((completedCount / roadmap.tasks.length) * 100);

    await roadmap.save();
    res.json({ message: 'Task updated.', roadmap });
  } catch (err) {
    console.error('Task toggle error:', err);
    res.status(500).json({ message: 'Failed to update task.' });
  }
};

module.exports = { generateRoadmap, getRoadmap, toggleTaskComplete };
