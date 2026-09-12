const aiService = require('../services/aiService');
const CareerProfile = require('../models/CareerProfile');

// POST /api/skills/analyze
const analyzeSkills = async (req, res) => {
  const { career, currentSkills } = req.body;

  if (!career) {
    return res.status(400).json({ message: 'Career is required.' });
  }

  try {
    const skills = currentSkills || req.user.skills || [];
    const analysis = await aiService.analyzeSkillGap(career, skills);

    // Save into career profile
    await CareerProfile.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        selectedCareer: career,
        currentSkills: skills,
        requiredSkills: analysis.requiredSkills || [],
        missingSkills: analysis.missingSkills || [],
        readinessScore: analysis.matchPercentage || 0,
        skillGapAnalysis: {
          matchPercentage: analysis.matchPercentage || 0,
          beginner: analysis.beginner || [],
          intermediate: analysis.intermediate || [],
          advanced: analysis.advanced || [],
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      message: aiService.isDemoMode ? 'Demo skill gap analysis' : 'Skill gap analysed',
      demoMode: aiService.isDemoMode,
      analysis,
    });
  } catch (err) {
    console.error('Skill analysis error:', err);
    res.status(500).json({ message: 'Failed to analyse skills.' });
  }
};

module.exports = { analyzeSkills };
