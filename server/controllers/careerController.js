const CareerProfile = require('../models/CareerProfile');
const User = require('../models/User');
const aiService = require('../services/aiService');

// POST /api/career/recommend
const getRecommendations = async (req, res) => {
  const { skills, interests } = req.body;

  if (!skills || !Array.isArray(skills) || skills.length === 0) {
    return res.status(400).json({ message: 'Please provide at least one skill.' });
  }

  try {
    const recommendations = await aiService.getCareerRecommendations(
      skills,
      interests || []
    );

    res.json({
      message: aiService.isDemoMode ? 'Demo recommendations' : 'Recommendations generated',
      demoMode: aiService.isDemoMode,
      recommendations,
    });
  } catch (err) {
    console.error('Career recommendation error:', err);
    res.status(500).json({ message: 'Failed to generate recommendations.' });
  }
};

// POST /api/career/select
const selectCareer = async (req, res) => {
  const { career, currentSkills } = req.body;

  if (!career) {
    return res.status(400).json({ message: 'Career is required.' });
  }

  try {
    // Run skill gap analysis for the selected career
    const gapAnalysis = await aiService.analyzeSkillGap(
      career,
      currentSkills || req.user.skills || []
    );

    // Save career profile
    const profile = await CareerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        selectedCareer: career,
        currentSkills: currentSkills || req.user.skills || [],
        requiredSkills: gapAnalysis.requiredSkills || [],
        missingSkills: gapAnalysis.missingSkills || [],
        readinessScore: gapAnalysis.matchPercentage || 0,
        skillGapAnalysis: {
          matchPercentage: gapAnalysis.matchPercentage || 0,
          beginner: gapAnalysis.beginner || [],
          intermediate: gapAnalysis.intermediate || [],
          advanced: gapAnalysis.advanced || [],
        },
      },
      { upsert: true, new: true }
    );

    // Update user's selected career and readiness score
    await User.findByIdAndUpdate(req.user._id, {
      selectedCareer: career,
      careerReadinessScore: gapAnalysis.matchPercentage || 0,
    });

    res.json({
      message: 'Career selected and skill gap analysed.',
      demoMode: aiService.isDemoMode,
      profile,
    });
  } catch (err) {
    console.error('Career select error:', err);
    res.status(500).json({ message: 'Failed to select career.' });
  }
};

// GET /api/career/profile
const getCareerProfile = async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({ userId: req.user._id });
    res.json({ profile: profile || null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch career profile.' });
  }
};

module.exports = { getRecommendations, selectCareer, getCareerProfile };
