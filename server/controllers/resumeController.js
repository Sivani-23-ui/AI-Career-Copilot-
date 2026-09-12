const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume');
const User = require('../models/User');
const aiService = require('../services/aiService');

// POST /api/resume/analyze
const analyzeResume = async (req, res) => {
  const { resumeText } = req.body;

  if (!resumeText || resumeText.trim().length < 50) {
    return res.status(400).json({
      message: 'Please provide resume text with at least 50 characters.',
    });
  }

  try {
    // Call AI service
    const analysis = await aiService.analyzeResume(resumeText);

    // Save or update resume in DB
    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        resumeText,
        extractedData: {
          education: analysis.education || [],
          skills: analysis.skills || [],
          experience: analysis.experience || [],
          projects: analysis.projects || [],
          certifications: analysis.certifications || [],
        },
        strengths: analysis.strengths || [],
        missingSkills: analysis.missingSkills || [],
        suggestions: analysis.suggestions || [],
        overallScore: analysis.overallScore || 0,
        analysisStatus: 'completed',
      },
      { upsert: true, new: true }
    );

    // Update user's skill list
    if (analysis.skills?.length) {
      await User.findByIdAndUpdate(req.user._id, {
        skills: analysis.skills,
      });
    }

    res.json({
      message: aiService.isDemoMode
        ? 'Demo analysis complete (no real AI key configured)'
        : 'Resume analysed successfully',
      demoMode: aiService.isDemoMode,
      analysis: {
        id: resume._id,
        education: resume.extractedData.education,
        skills: resume.extractedData.skills,
        experience: resume.extractedData.experience,
        projects: resume.extractedData.projects,
        certifications: resume.extractedData.certifications,
        strengths: resume.strengths,
        missingSkills: resume.missingSkills,
        suggestions: resume.suggestions,
        overallScore: resume.overallScore,
      },
    });
  } catch (err) {
    console.error('Resume analysis error:', err);
    res.status(500).json({ message: 'Failed to analyse resume. Please try again.' });
  }
};

// GET /api/resume/latest
const getLatestResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!resume) return res.json({ resume: null });
    res.json({ resume });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch resume.' });
  }
};

// POST /api/resume/upload  — multipart PDF upload → extract text → analyze
const uploadAndAnalyze = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No PDF file uploaded. Please attach a file.' });
  }

  let resumeText;
  try {
    const parsed = await pdfParse(req.file.buffer);
    resumeText = parsed.text.trim();
  } catch (err) {
    console.error('PDF parse error:', err);
    return res.status(422).json({ message: 'Could not read the PDF. Make sure it contains selectable text (not a scanned image).' });
  }

  if (!resumeText || resumeText.length < 50) {
    return res.status(422).json({ message: 'The PDF appears to be empty or contains too little text. Please use a text-based PDF.' });
  }

  try {
    const analysis = await aiService.analyzeResume(resumeText);

    const resume = await Resume.findOneAndUpdate(
      { userId: req.user._id },
      {
        userId: req.user._id,
        resumeText,
        fileName: req.file.originalname,
        extractedData: {
          education: analysis.education || [],
          skills: analysis.skills || [],
          experience: analysis.experience || [],
          projects: analysis.projects || [],
          certifications: analysis.certifications || [],
        },
        strengths: analysis.strengths || [],
        missingSkills: analysis.missingSkills || [],
        suggestions: analysis.suggestions || [],
        overallScore: analysis.overallScore || 0,
        analysisStatus: 'completed',
      },
      { upsert: true, new: true }
    );

    if (analysis.skills?.length) {
      await User.findByIdAndUpdate(req.user._id, { skills: analysis.skills });
    }

    res.json({
      message: aiService.isDemoMode
        ? 'Demo analysis complete (no real AI key configured)'
        : 'PDF resume analysed successfully',
      demoMode: aiService.isDemoMode,
      extractedTextLength: resumeText.length,
      fileName: req.file.originalname,
      analysis: {
        id: resume._id,
        education: resume.extractedData.education,
        skills: resume.extractedData.skills,
        experience: resume.extractedData.experience,
        projects: resume.extractedData.projects,
        certifications: resume.extractedData.certifications,
        strengths: resume.strengths,
        missingSkills: resume.missingSkills,
        suggestions: resume.suggestions,
        overallScore: resume.overallScore,
      },
    });
  } catch (err) {
    console.error('Resume upload analysis error:', err);
    res.status(500).json({ message: 'Failed to analyse resume. Please try again.' });
  }
};

module.exports = { analyzeResume, getLatestResume, uploadAndAnalyze };
